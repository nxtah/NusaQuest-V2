'use client';
import {useEffect, useState} from 'react';
import Modal, {FormField} from './Modal';
import {
  getAllDestinations,
  createDestination,
  updateDestination,
  deleteDestination,
  type KotaProvinsi,
} from '@/src/services/firebase/firestore/admin-destination.service';

const DESTINATION_TYPES = [
  'Desa Wisata',
  'Sejarah dan Budaya',
  'Sejarah & Budaya',
  'Urban & Industri',
  'Wisata & Alam',
  'Alam dan Pegunungan',
  'Hidangan Utama (Main Course)',
  'Camilan dan Kudapan (Snacks & Appetizers)',
  'Bersejarah & Mistis',
  'Snorkeling & Rekreasi Keluarga',
  'Berselancar dan Freediving',
  'Fisik & Ketangkasan',
  'Kognitif & Strategi',
  'Kreativitas & Imitasi',
];

const PROVINCES = [
  'Aceh',
  'Sumatera Utara',
  'Sumatera Barat',
  'Riau',
  'Jambi',
  'Sumatera Selatan',
  'Bangka Belitung',
  'Bengkulu',
  'Lampung',
  'Kepulauan Riau',
  'DKI Jakarta',
  'Jawa Barat',
  'Jawa Tengah',
  'DI Yogyakarta',
  'Jawa Timur',
  'Banten',
  'Bali',
  'Nusa Tenggara Barat',
  'Nusa Tenggara Timur',
  'Kalimantan Barat',
  'Kalimantan Tengah',
  'Kalimantan Selatan',
  'Kalimantan Timur',
  'Kalimantan Utara',
  'Sulawesi Utara',
  'Sulawesi Tengah',
  'Sulawesi Selatan',
  'Sulawesi Tenggara',
  'Gorontalo',
  'Sulawesi Barat',
  'Maluku',
  'Maluku Utara',
  'Papua',
  'Papua Barat',
];

export default function KotaProvinsTable() {
  const [destinations, setDestinations] = useState<Record<string, KotaProvinsi>>({});
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<KotaProvinsi | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load destinations
  useEffect(() => {
    const loadDestinations = async () => {
      setLoading(true);
      setError(null);
      const result = await getAllDestinations();

      if (result.success) {
        const record: Record<string, KotaProvinsi> = {};
        (result.data || []).forEach((item) => {
          record[item.id] = {
            id: item.id,
            nama: item.nama,
            provinsi: item.provinsi,
            deskripsi: item.deskripsi,
            latitude: item.latitude,
            longitude: item.longitude,
            type: item.type,
            image: item.image,
          };
        });
        setDestinations(record);
      } else {
        setError('Failed to load destinations');
      }
      setLoading(false);
    };

    loadDestinations();
  }, []);

  const handleAddNew = () => {
    setEditingId(null);
    setEditingData(null);
    setIsModalOpen(true);
  };

  const handleEdit = (id: string, data: KotaProvinsi) => {
    setEditingId(id);
    setEditingData(data);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this destination?')) return;

    setLoading(true);
    const result = await deleteDestination(id);

    if (result.success) {
      setDestinations((prev) => {
        const updated = {...prev};
        delete updated[id];
        return updated;
      });
      setSuccess('Destination deleted successfully');
    } else {
      setError('Failed to delete destination');
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
        const result = await updateDestination(editingId, {
          nama: data.nama as string,
          provinsi: data.provinsi as string,
          deskripsi: (data.deskripsi as string) || undefined,
          type: (data.type as string) || undefined,
          image: (data.image as string) || undefined,
          latitude: data.latitude ? parseFloat(data.latitude as string) : undefined,
          longitude: data.longitude ? parseFloat(data.longitude as string) : undefined,
        });

        if (result.success) {
          setDestinations((prev) => ({
            ...prev,
            [editingId]: {
              ...editingData,
              nama: (result.data.nama ?? editingData?.nama) as string,
              provinsi: (result.data.provinsi ?? editingData?.provinsi) as string,
              type: result.data.type ?? editingData?.type,
              deskripsi: result.data.deskripsi ?? editingData?.deskripsi,
              image: result.data.image ?? editingData?.image,
              latitude: result.data.latitude ?? editingData?.latitude,
              longitude: result.data.longitude ?? editingData?.longitude,
              updatedAt: result.data.updatedAt,
            } as KotaProvinsi,
          }));
          setSuccess('Destination updated successfully');
        } else {
          setError('Failed to update destination');
        }
      } else {
        // Create new
        const result = await createDestination({
          nama: data.nama as string,
          provinsi: data.provinsi as string,
          deskripsi: (data.deskripsi as string) || undefined,
          type: (data.type as string) || undefined,
          image: (data.image as string) || undefined,
          latitude: data.latitude ? parseFloat(data.latitude as string) : undefined,
          longitude: data.longitude ? parseFloat(data.longitude as string) : undefined,
        });

        if (result.success) {
          setDestinations((prev) => ({
            ...prev,
            [result.data.id]: {
              id: result.data.id,
              nama: data.nama as string,
              provinsi: data.provinsi as string,
              deskripsi: (data.deskripsi as string) || undefined,
              type: (data.type as string) || undefined,
              image: (data.image as string) || undefined,
              latitude: data.latitude ? parseFloat(data.latitude as string) : undefined,
              longitude: data.longitude ? parseFloat(data.longitude as string) : undefined,
            },
          }));
          setSuccess('Destination created successfully');
        } else {
          setError('Failed to create destination');
        }
      }

      setIsModalOpen(false);
      setTimeout(() => setSuccess(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const destinationsArray = Object.entries(destinations)
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
                <p className="text-gray-400">Loading destinations...</p>
              </div>
            </div>
          ) : destinationsArray.length > 0 ? (
            <table className="w-full text-sm text-left">
              <thead className="text-[11px] uppercase bg-black/60 text-gray-300 font-extrabold tracking-widest sticky top-0 z-10 backdrop-blur-xl border-b border-white/10">
                <tr>
                  <th className="px-6 py-5 w-16 text-center">#</th>
                  <th className="px-6 py-5 w-[20%]">NAMA</th>
                  <th className="px-6 py-5 w-[15%]">PROVINSI</th>
                  <th className="px-6 py-5 w-[20%]">TIPE</th>
                  <th className="px-6 py-5 w-[25%]">DESKRIPSI</th>
                  <th className="px-6 py-5 text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {destinationsArray.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-5 font-black text-gray-400 text-center">
                      {idx + 1}
                    </td>
                    <td className="px-6 py-5 font-bold text-base text-gray-100 pr-8 leading-relaxed">
                      {item.nama}
                    </td>
                    <td className="px-6 py-5 text-gray-300 text-sm font-medium">
                      {item.provinsi}
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-3 py-1.5 bg-white/10 rounded-lg text-xs font-bold text-gray-200 uppercase tracking-wider border border-white/10 shadow-sm">
                        {item.type || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-gray-300 text-sm line-clamp-2">
                      {item.deskripsi || '-'}
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
                No destinations found. Create one to get started!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        title={editingId ? 'Edit Destination' : 'Add New Destination'}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        isLoading={isSaving}
        submitButtonText={editingId ? 'Update' : 'Create'}
        size="lg"
      >
        <FormField
          label="Nama Kota/Destinasi"
          name="nama"
          type="text"
          placeholder="Enter destination name"
          value={editingData?.nama}
          required
        />
        <FormField
          label="Provinsi"
          name="provinsi"
          type="select"
          value={editingData?.provinsi}
          required
        >
          {PROVINCES.map((prov) => (
            <option key={prov} value={prov}>
              {prov}
            </option>
          ))}
        </FormField>
        <FormField
          label="Tipe Destinasi"
          name="type"
          type="select"
          value={editingData?.type}
        >
          <option value="">Select Type (Optional)</option>
          {DESTINATION_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </FormField>
        <FormField
          label="Deskripsi"
          name="deskripsi"
          type="textarea"
          placeholder="Enter description"
          value={editingData?.deskripsi}
          rows={3}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Latitude (Optional)"
            name="latitude"
            type="number"
            placeholder="-6.1751"
            value={editingData?.latitude ? String(editingData.latitude) : ''}
          />
          <FormField
            label="Longitude (Optional)"
            name="longitude"
            type="number"
            placeholder="106.8650"
            value={editingData?.longitude ? String(editingData.longitude) : ''}
          />
        </div>
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
