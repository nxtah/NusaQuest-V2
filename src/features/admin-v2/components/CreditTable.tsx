'use client';
import { useEffect, useMemo, useState } from 'react';
import Modal, { FormField } from './Modal';
import CloudinaryUploadField from './CloudinaryUploadField';
import {
  createCreditMember,
  deleteCreditMember,
  listenToCreditMembers,
  updateCreditMember,
  type CreditMemberRecord,
} from '@/src/services/firebase/firestore/credits.service';

const TEAM_VERSIONS = ['V1', 'V2'] as const;

export default function CreditTable() {
  const [members, setMembers] = useState<CreditMemberRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamFilter, setTeamFilter] = useState<'all' | 'V1' | 'V2'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<CreditMemberRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [photoURL, setPhotoURL] = useState<string | undefined>(undefined);

  // Realtime — perubahan dari admin lain (atau tab lain) langsung kelihatan.
  useEffect(() => {
    const unsub = listenToCreditMembers((result) => {
      setMembers(result);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleAddNew = () => {
    setEditingId(null);
    setEditingData(null);
    setPhotoURL(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (member: CreditMemberRecord) => {
    setEditingId(member.id);
    setEditingData(member);
    setPhotoURL(member.photoURL);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus anggota ini?')) return;
    const result = await deleteCreditMember(id);
    if (result.success) {
      setSuccess('Anggota berhasil dihapus');
    } else {
      setError('Gagal menghapus anggota');
    }
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    setError(null);
    if (!photoURL) {
      setError('Unggah foto dulu sebelum menyimpan.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: (data.name as string).trim(),
        role: (data.role as string).trim(),
        bio: (data.bio as string).trim(),
        photoURL,
        teamVersion: data.teamVersion as 'V1' | 'V2',
        order: editingData?.order ?? members.length,
      };

      if (editingId) {
        const result = await updateCreditMember(editingId, payload);
        if (result.success) {
          setSuccess('Anggota berhasil diperbarui');
        } else {
          setError('Gagal memperbarui anggota');
        }
      } else {
        const result = await createCreditMember(payload);
        if (result.success) {
          setSuccess('Anggota berhasil ditambahkan');
        } else {
          setError('Gagal menambahkan anggota');
        }
      }

      setIsModalOpen(false);
      setTimeout(() => setSuccess(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredMembers = useMemo(
    () => (teamFilter === 'all' ? members : members.filter((m) => m.teamVersion === teamFilter)),
    [members, teamFilter],
  );

  return (
    <>
      <div className="nq-admin-panel flex-1 rounded-[1.75rem] p-5 sm:p-8 overflow-hidden flex flex-col relative">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm font-semibold">{error}</div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-emerald-100 border border-emerald-300 rounded-lg text-emerald-700 text-sm font-semibold">{success}</div>
        )}

        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-6 sm:mb-8">
          <div className="flex gap-2">
            {(['all', 'V1', 'V2'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setTeamFilter(v)}
                className={`nq-admin-chip px-4 py-2 rounded-xl text-sm font-bold ${teamFilter === v ? 'nq-admin-chip--active' : ''}`}
              >
                {v === 'all' ? 'Semua Tim' : v}
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
            Tambah Anggota
          </button>
        </div>

        <div className="nq-admin-table-wrap nq-admin-scrollbar flex-1 overflow-auto rounded-2xl">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-3 border-[#f5a916]/40 border-t-[#f5a916] rounded-full animate-spin" />
                <p className="opacity-60">Memuat...</p>
              </div>
            </div>
          ) : filteredMembers.length > 0 ? (
            <table className="nq-admin-table w-full text-sm text-left">
              <thead className="text-[11px] uppercase font-extrabold tracking-widest sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-5 w-16 text-center">Foto</th>
                  <th className="px-6 py-5">Nama</th>
                  <th className="px-6 py-5">Role</th>
                  <th className="px-6 py-5">Tim</th>
                  <th className="px-6 py-5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredMembers.map((m) => (
                  <tr key={m.id} className="group">
                    <td className="px-6 py-5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={m.photoURL} alt={m.name} className="w-12 h-12 rounded-full object-cover border border-black/10 mx-auto" />
                    </td>
                    <td className="px-6 py-5 font-bold">{m.name}</td>
                    <td className="px-6 py-5 opacity-80">{m.role}</td>
                    <td className="px-6 py-5">
                      <span className="px-3 py-1.5 bg-black/5 rounded-lg text-xs font-bold uppercase tracking-wider">
                        {m.teamVersion}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleEdit(m)}
                          className="nq-admin-icon-btn--edit p-2.5 rounded-xl"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
                            <path d="m15 5 4 4" />
                          </svg>
                        </button>
                        <button
                          onClick={() => m.id && handleDelete(m.id)}
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
              <p className="opacity-60 text-lg">Belum ada anggota. Tambahkan untuk mulai mengisi halaman Credit!</p>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        title={editingId ? 'Edit Anggota' : 'Tambah Anggota'}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        isLoading={isSaving}
        submitButtonText={editingId ? 'Update' : 'Create'}
        size="lg"
      >
        <CloudinaryUploadField
          label="Foto"
          value={photoURL}
          onChange={setPhotoURL}
          folder="nusaquest/credits"
          required
        />
        <FormField label="Nama" name="name" type="text" placeholder="Nama anggota" value={editingData?.name} required />
        <FormField label="Role" name="role" type="text" placeholder="Contoh: Frontend Developer" value={editingData?.role} required />
        <FormField label="Bio" name="bio" type="textarea" placeholder="Deskripsi singkat kontribusinya" value={editingData?.bio} required rows={3} />
        <FormField label="Tim" name="teamVersion" type="select" value={editingData?.teamVersion} required>
          {TEAM_VERSIONS.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </FormField>
      </Modal>
    </>
  );
}
