'use client';
import {useEffect, useState} from 'react';
import Modal, {FormField} from './Modal';
import {
  getAllInformasi,
  createInformasi,
  updateInformasi,
  deleteInformasi,
  type Informasi,
} from '@/src/services/firebase/rtdb/admin.informasi.service';

const CATEGORIES = [
  'Tutorial',
  'Panduan',
  'Tips',
  'Berita',
  'Peraturan',
  'FAQ',
  'Lainnya',
];

export default function InformasiTable() {
  const [informasiList, setInformasiList] = useState<Record<string, Informasi>>({});
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Informasi | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load informasi
  useEffect(() => {
    const loadInformasi = async () => {
      setLoading(true);
      setError(null);
      const result = await getAllInformasi();

      if (result.success) {
        setInformasiList(result.data || {});
      } else {
        setError('Failed to load informasi');
      }
      setLoading(false);
    };

    loadInformasi();
  }, []);

  const handleAddNew = () => {
    setEditingId(null);
    setEditingData(null);
    setIsModalOpen(true);
  };

  const handleEdit = (id: string, data: Informasi) => {
    setEditingId(id);
    setEditingData(data);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this informasi?')) return;

    setLoading(true);
    const result = await deleteInformasi(id);

    if (result.success) {
      setInformasiList((prev) => {
        const updated = {...prev};
        delete updated[id];
        return updated;
      });
      setSuccess('Informasi deleted successfully');
    } else {
      setError('Failed to delete informasi');
    }
    setLoading(false);

    setTimeout(() => setSuccess(null), 3000);
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    setIsSaving(true);
    setError(null);

    try {
      if (editingId) {
        // Update existing
        const result = await updateInformasi(editingId, {
          title: data.title as string,
          description: data.description as string,
          content: data.content as string,
          category: data.category as string,
          image: (data.image as string) || undefined,
        });

        if (result.success) {
          setInformasiList((prev) => ({
            ...prev,
            [editingId]: {
              ...editingData,
              title: (result.data.title ?? editingData?.title) as string,
              description: (result.data.description ?? editingData?.description) as string,
              content: (result.data.content ?? editingData?.content) as string,
              category: (result.data.category ?? editingData?.category) as string,
              image: result.data.image ?? editingData?.image,
              updatedAt: result.data.updatedAt,
            } as Informasi,
          }));
          setSuccess('Informasi updated successfully');
        } else {
          setError('Failed to update informasi');
        }
      } else {
        // Create new
        const result = await createInformasi({
          title: data.title as string,
          description: data.description as string,
          content: data.content as string,
          category: data.category as string,
          image: (data.image as string) || undefined,
        });

        if (result.success) {
          setInformasiList((prev) => ({
            ...prev,
            [result.data.id]: {
              id: result.data.id,
              title: data.title as string,
              description: data.description as string,
              content: data.content as string,
              category: data.category as string,
              image: (data.image as string) || undefined,
            },
          }));
          setSuccess('Informasi created successfully');
        } else {
          setError('Failed to create informasi');
        }
      }

      setIsModalOpen(false);
      setTimeout(() => setSuccess(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const informasiArray = Object.entries(informasiList)
    .map(([id, item]) => ({id, ...item}))
    .sort((a, b) => {
      const aTime = a.createdAt || 0;
      const bTime = b.createdAt || 0;
      return bTime - aTime;
    });

  return (
    <>
      <div className="flex-1 bg-[#1e2532]/80 backdrop-blur-2xl rounded-[2rem] border border-white/20 p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col relative">
        {/* Alerts */}
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

        {/* Top Actions Bar */}
        <div className="flex justify-end items-center mb-8 gap-3">
          <button className="px-6 py-3 bg-[#2d3748]/80 border border-white/20 hover:bg-[#3a4556] text-white rounded-xl font-bold transition-all shadow-md text-sm backdrop-blur-sm">
            Save Changes
          </button>
          <button
            onClick={handleAddNew}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(37,99,235,0.6)] text-sm"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
            Add New
          </button>
        </div>

        {/* Table Container */}
        <div className="flex-1 overflow-auto rounded-2xl border border-white/10 bg-black/30 backdrop-blur-md custom-scrollbar">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-3 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                <p className="text-gray-400">Loading informasi...</p>
              </div>
            </div>
          ) : informasiArray.length > 0 ? (
            <table className="w-full text-sm text-left">
              <thead className="text-[11px] uppercase bg-black/60 text-gray-300 font-extrabold tracking-widest sticky top-0 z-10 backdrop-blur-xl border-b border-white/10">
                <tr>
                  <th className="px-6 py-5 w-16 text-center">#</th>
                  <th className="px-6 py-5 w-[25%]">JUDUL</th>
                  <th className="px-6 py-5 w-[35%]">DESKRIPSI</th>
                  <th className="px-6 py-5">KATEGORI</th>
                  <th className="px-6 py-5 text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {informasiArray.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-5 font-black text-gray-400 text-center">
                      {idx + 1}
                    </td>
                    <td className="px-6 py-5 font-bold text-base text-gray-100 pr-8 leading-relaxed">
                      {item.title}
                    </td>
                    <td className="px-6 py-5 text-gray-300 text-sm line-clamp-2">
                      {item.description}
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-3 py-1.5 bg-white/10 rounded-lg text-xs font-bold text-gray-200 uppercase tracking-wider border border-white/10 shadow-sm">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleEdit(item.id, item)}
                          className="p-2.5 bg-blue-500/20 hover:bg-blue-500 text-blue-300 hover:text-white rounded-xl transition-all border border-blue-500/30 hover:border-transparent shadow-sm"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
                            <path d="m15 5 4 4" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2.5 bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white rounded-xl transition-all border border-red-500/30 hover:border-transparent shadow-sm"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
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
              <p className="text-gray-400 text-lg">
                No informasi found. Create one to get started!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        title={editingId ? 'Edit Informasi' : 'Add New Informasi'}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        isLoading={isSaving}
        submitButtonText={editingId ? 'Update' : 'Create'}
        size="lg"
      >
        <FormField
          label="Title"
          name="title"
          type="text"
          placeholder="Enter title"
          value={editingData?.title}
          required
        />
        <FormField
          label="Description"
          name="description"
          type="textarea"
          placeholder="Enter description"
          value={editingData?.description}
          required
          rows={2}
        />
        <FormField
          label="Content"
          name="content"
          type="textarea"
          placeholder="Enter detailed content"
          value={editingData?.content}
          required
          rows={4}
        />
        <FormField
          label="Category"
          name="category"
          type="select"
          value={editingData?.category}
          required
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </FormField>
        <FormField
          label="Image URL (Optional)"
          name="image"
          type="text"
          placeholder="https://example.com/image.jpg"
          value={editingData?.image}
        />
      </Modal>

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.4);
        }
      `}} />
    </>
  );
}
