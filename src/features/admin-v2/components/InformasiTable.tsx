'use client';
import {useEffect, useMemo, useState} from 'react';
import Modal, {FormField} from './Modal';
import {
  createInformationItem,
  deleteInformationItem,
  getAllInformationItems,
  updateInformationItem,
  INFORMATION_TABS,
  type InformationItem,
} from '@/src/services/firebase/firestore/information.service';

function isCloudinaryUrl(url: string): boolean {
  try {
    return new URL(url).hostname.endsWith('cloudinary.com');
  } catch {
    return false;
  }
}

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

  const loadItems = async () => {
    setLoading(true);
    setError(null);
    const result = await getAllInformationItems();

    if (result.success) {
      setItems(result.data);
    } else {
      setError('Failed to load information items');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleAddNew = () => {
    setEditingId(null);
    setEditingData(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: InformationItem) => {
    setEditingId(item.id ?? null);
    setEditingData(item);
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

    const imageUrl = (data.imageUrl as string).trim();
    if (!isCloudinaryUrl(imageUrl)) {
      setError('Image URL harus link Cloudinary (contoh: https://res.cloudinary.com/...), bukan link foto lain atau upload fisik.');
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

  const filteredItems = useMemo(
    () => (tabFilter === 'all' ? items : items.filter((item) => item.tab === tabFilter)),
    [items, tabFilter],
  );

  return (
    <>
      <div className="flex-1 bg-[#1e2532]/80 backdrop-blur-2xl rounded-[2rem] border border-white/20 p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col relative">
        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 text-sm">
            {success}
          </div>
        )}

        <div className="flex justify-between items-center mb-8 gap-3">
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setTabFilter('all')}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                tabFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              Semua Tab
            </button>
            {INFORMATION_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setTabFilter(tab)}
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                  tabFilter === tab ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button
            onClick={handleAddNew}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(37,99,235,0.6)] text-sm shrink-0"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
            Add New
          </button>
        </div>

        <div className="flex-1 overflow-auto rounded-2xl border border-white/10 bg-black/30 backdrop-blur-md custom-scrollbar">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-3 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                <p className="text-gray-400">Loading...</p>
              </div>
            </div>
          ) : filteredItems.length > 0 ? (
            <table className="w-full text-sm text-left">
              <thead className="text-[11px] uppercase bg-black/60 text-gray-300 font-extrabold tracking-widest sticky top-0 z-10 backdrop-blur-xl border-b border-white/10">
                <tr>
                  <th className="px-6 py-5 w-16 text-center">#</th>
                  <th className="px-6 py-5">TAB</th>
                  <th className="px-6 py-5">BARIS (SECTION)</th>
                  <th className="px-6 py-5">JUDUL</th>
                  <th className="px-6 py-5 w-20 text-center">FOTO</th>
                  <th className="px-6 py-5 text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredItems.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-5 font-black text-gray-400 text-center">{idx + 1}</td>
                    <td className="px-6 py-5">
                      <span className="px-3 py-1.5 bg-white/10 rounded-lg text-xs font-bold text-gray-200 uppercase tracking-wider border border-white/10">
                        {item.tab}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-gray-300">{item.sectionTitle}</td>
                    <td className="px-6 py-5 font-bold text-gray-100">{item.title}</td>
                    <td className="px-6 py-5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.imageUrl} alt={item.title} className="w-12 h-12 rounded-lg object-cover border border-white/10 mx-auto" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2.5 bg-blue-500/20 hover:bg-blue-500 text-blue-300 hover:text-white rounded-xl transition-all border border-blue-500/30 hover:border-transparent"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
                            <path d="m15 5 4 4" />
                          </svg>
                        </button>
                        <button
                          onClick={() => item.id && handleDelete(item.id)}
                          className="p-2.5 bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white rounded-xl transition-all border border-red-500/30 hover:border-transparent"
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
              <p className="text-gray-400 text-lg">Belum ada konten. Tambahkan untuk mulai mengisi halaman Information!</p>
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
        <FormField
          label="Image URL (wajib link Cloudinary)"
          name="imageUrl"
          type="text"
          placeholder="https://res.cloudinary.com/..."
          value={editingData?.imageUrl}
          required
        />
      </Modal>

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.2); border-radius: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.4); }
      `}} />
    </>
  );
}
