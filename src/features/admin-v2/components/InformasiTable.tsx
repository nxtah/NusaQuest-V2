'use client';
import {useEffect, useMemo, useState} from 'react';
import Modal, {FormField} from './Modal';
import CloudinaryUploadField from './CloudinaryUploadField';
import {
  createInformationItem,
  deleteInformationItem,
  listenToInformationItems,
  updateInformationItem,
  INFORMATION_TABS,
  type InformationItem,
} from '@/src/services/firebase/firestore/information.service';

export default function InformasiTable() {
  const [items, setItems] = useState<InformationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabFilter, setTabFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<InformationItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  // `CloudinaryUploadField` gak render <input name="imageUrl"> native — jadi
  // gak ke-pick up sama `new FormData()` di Modal.tsx. URL hasil upload
  // dilacak di sini, lalu digabung manual ke payload pas submit.
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  // Realtime — edit dari admin/tab lain langsung kelihatan tanpa refresh manual.
  useEffect(() => {
    const unsub = listenToInformationItems((result) => {
      setItems(result);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleAddNew = () => {
    setEditingId(null);
    setEditingData(null);
    setImageUrl(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (item: InformationItem) => {
    setEditingId(item.id ?? null);
    setEditingData(item);
    setImageUrl(item.imageUrl);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus item ini?')) return;

    setLoading(true);
    const result = await deleteInformationItem(id);

    if (result.success) {
      setItems((prev) => prev.filter((item) => item.id !== id));
      setSuccess('Item berhasil dihapus');
    } else {
      setError('Gagal menghapus item');
    }
    setLoading(false);
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    setError(null);

    if (!imageUrl) {
      setError('Unggah gambar dulu sebelum menyimpan.');
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        tab: data.tab as InformationItem['tab'],
        sectionTitle: (data.sectionTitle as string).trim(),
        title: (data.title as string).trim(),
        description: (data.description as string).trim(),
        imageUrl,
        order: editingData?.order ?? items.length,
      };

      if (editingId) {
        const result = await updateInformationItem(editingId, payload);
        if (result.success) {
          setItems((prev) =>
            prev.map((item) => (item.id === editingId ? {...item, ...payload} : item)),
          );
          setSuccess('Item berhasil diperbarui');
        } else {
          setError('Gagal memperbarui item');
        }
      } else {
        const result = await createInformationItem(payload);
        if (result.success) {
          setItems((prev) => [...prev, {...payload, id: result.data.id}]);
          setSuccess('Item berhasil ditambahkan');
        } else {
          setError('Gagal menambahkan item');
        }
      }

      setIsModalOpen(false);
      setTimeout(() => setSuccess(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredItems = useMemo(() => {
    const byTab = tabFilter === 'all' ? items : items.filter((item) => item.tab === tabFilter);
    const query = searchQuery.trim().toLowerCase();
    if (!query) return byTab;
    return byTab.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.sectionTitle.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query),
    );
  }, [items, tabFilter, searchQuery]);

  return (
    <>
      <div className="nq-admin-panel flex-1 rounded-[1.75rem] p-5 sm:p-8 overflow-hidden flex flex-col relative">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm font-semibold">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-emerald-100 border border-emerald-300 rounded-lg text-emerald-700 text-sm font-semibold">
            {success}
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-6 sm:mb-8">
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setTabFilter('all')}
              className={`nq-admin-chip px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap ${tabFilter === 'all' ? 'nq-admin-chip--active' : ''}`}
            >
              Semua Tab
            </button>
            {INFORMATION_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setTabFilter(tab)}
                className={`nq-admin-chip px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap ${tabFilter === tab ? 'nq-admin-chip--active' : ''}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button
            onClick={handleAddNew}
            className="nq-admin-btn-primary px-5 py-2.5 rounded-full font-bold flex items-center gap-2 text-sm shrink-0"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
            Tambah Konten
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4 sm:mb-6">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40"
            width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari judul, section, atau deskripsi..."
            className="nq-admin-field w-full pl-11 pr-4 py-2.5 rounded-xl text-sm"
          />
        </div>

        <div className="nq-admin-table-wrap nq-admin-scrollbar flex-1 overflow-auto rounded-2xl">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-3 border-[#f5a916]/40 border-t-[#f5a916] rounded-full animate-spin" />
                <p className="opacity-60">Memuat...</p>
              </div>
            </div>
          ) : filteredItems.length > 0 ? (
            <table className="nq-admin-table w-full text-sm text-left">
              <thead className="text-[11px] uppercase font-extrabold tracking-widest sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-5 w-16 text-center">#</th>
                  <th className="px-6 py-5">Tab</th>
                  <th className="px-6 py-5">Baris (Section)</th>
                  <th className="px-6 py-5">Judul</th>
                  <th className="px-6 py-5 w-20 text-center">Foto</th>
                  <th className="px-6 py-5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredItems.map((item, idx) => (
                  <tr key={item.id} className="group">
                    <td className="px-6 py-5 font-black opacity-50 text-center">{idx + 1}</td>
                    <td className="px-6 py-5">
                      <span className="px-3 py-1.5 bg-black/5 rounded-lg text-xs font-bold uppercase tracking-wider">
                        {item.tab}
                      </span>
                    </td>
                    <td className="px-6 py-5 opacity-80">{item.sectionTitle}</td>
                    <td className="px-6 py-5 font-bold">{item.title}</td>
                    <td className="px-6 py-5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.imageUrl} alt={item.title} className="w-12 h-12 rounded-lg object-cover border border-black/10 mx-auto" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleEdit(item)}
                          className="nq-admin-icon-btn--edit p-2.5 rounded-xl"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
                            <path d="m15 5 4 4" />
                          </svg>
                        </button>
                        <button
                          onClick={() => item.id && handleDelete(item.id)}
                          className="nq-admin-icon-btn--delete p-2.5 rounded-xl"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            <line x1="10" x2="10" y1="11" y2="17" />
                            <line x1="14" x2="14" y1="11" y2="17" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="opacity-60 text-lg">
                {searchQuery.trim()
                  ? `Gak ada konten yang cocok dengan "${searchQuery}".`
                  : 'Belum ada konten. Tambahkan untuk mulai mengisi halaman Information!'}
              </p>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        title={editingId ? 'Edit Konten Information' : 'Tambah Konten Information'}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        isLoading={isSaving}
        submitButtonText={editingId ? 'Update' : 'Create'}
        size="lg"
      >
        <FormField label="Tab" name="tab" type="select" value={editingData?.tab} required>
          {INFORMATION_TABS.map((tab) => (
            <option key={tab} value={tab}>{tab}</option>
          ))}
        </FormField>
        <FormField
          label="Judul Baris (Section)"
          name="sectionTitle"
          type="text"
          placeholder="Contoh: Perkotaan & Industri"
          value={editingData?.sectionTitle}
          required
        />
        <FormField
          label="Judul Kartu"
          name="title"
          type="text"
          placeholder="Contoh: Kota Bandung"
          value={editingData?.title}
          required
        />
        <FormField
          label="Deskripsi"
          name="description"
          type="textarea"
          placeholder="Deskripsi yang muncul saat kartu diklik"
          value={editingData?.description}
          required
          rows={3}
        />
        <CloudinaryUploadField
          label="Gambar"
          value={imageUrl}
          onChange={setImageUrl}
          folder="nusaquest/informasi"
          aspect={2490 / 984}
          required
        />
      </Modal>
    </>
  );
}
