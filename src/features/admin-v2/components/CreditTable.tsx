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
import {
  createCreditSection,
  deleteCreditSection,
  listenToCreditSections,
  updateCreditSection,
  type CreditSectionRecord,
} from '@/src/services/firebase/firestore/credit-sections.service';

const TEAM_VERSIONS = ['V1', 'V2'] as const;

export default function CreditTable() {
  const [members, setMembers] = useState<CreditMemberRecord[]>([]);
  const [sections, setSections] = useState<CreditSectionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamFilter, setTeamFilter] = useState<'all' | 'V1' | 'V2'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<CreditMemberRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [photoURL, setPhotoURL] = useState<string | undefined>(undefined);

  // `teamVersion`/`sectionId` dikontrol lewat state (bukan native FormField
  // uncontrolled) — sama kayak `photoURL` di atas — biar pilihan Divisi bisa
  // di-cascade ngikutin Tim yang lagi dipilih.
  const [formTeamVersion, setFormTeamVersion] = useState<'V1' | 'V2'>('V1');
  const [formSectionId, setFormSectionId] = useState<string>('');

  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [sectionTeamTab, setSectionTeamTab] = useState<'V1' | 'V2'>('V1');
  const [newSectionName, setNewSectionName] = useState('');
  const [renamingSectionId, setRenamingSectionId] = useState<string | null>(null);
  const [renamingValue, setRenamingValue] = useState('');
  const [isSectionSaving, setIsSectionSaving] = useState(false);

  // Realtime — perubahan dari admin lain (atau tab lain) langsung kelihatan.
  useEffect(() => {
    const unsub = listenToCreditMembers((result) => {
      setMembers(result);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = listenToCreditSections((result) => setSections(result));
    return () => unsub();
  }, []);

  const sectionsById = useMemo(() => {
    const map = new Map<string, CreditSectionRecord>();
    sections.forEach((s) => map.set(s.id, s));
    return map;
  }, [sections]);

  const sectionsForFormTeam = useMemo(
    () => sections.filter((s) => s.teamVersion === formTeamVersion).sort((a, b) => a.order - b.order),
    [sections, formTeamVersion],
  );

  const handleAddNew = () => {
    setEditingId(null);
    setEditingData(null);
    setPhotoURL(undefined);
    setFormTeamVersion('V1');
    setFormSectionId('');
    setIsModalOpen(true);
  };

  const handleEdit = (member: CreditMemberRecord) => {
    setEditingId(member.id);
    setEditingData(member);
    setPhotoURL(member.photoURL);
    setFormTeamVersion(member.teamVersion);
    setFormSectionId(member.sectionId ?? '');
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
    if (!formSectionId) {
      setError('Pilih divisi dulu sebelum menyimpan.');
      return;
    }

    setIsSaving(true);
    try {
      const sameGroupCount = members.filter(
        (m) => m.teamVersion === formTeamVersion && m.sectionId === formSectionId,
      ).length;

      const payload = {
        name: (data.name as string).trim(),
        role: (data.role as string).trim(),
        bio: (data.bio as string).trim(),
        photoURL,
        teamVersion: formTeamVersion,
        sectionId: formSectionId,
        order: editingData?.order ?? sameGroupCount,
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

  const handleAddSection = async () => {
    const name = newSectionName.trim();
    if (!name) return;
    setIsSectionSaving(true);
    try {
      const sameTeamCount = sections.filter((s) => s.teamVersion === sectionTeamTab).length;
      const result = await createCreditSection({ name, teamVersion: sectionTeamTab, order: sameTeamCount });
      if (result.success) {
        setNewSectionName('');
      } else {
        setError('Gagal menambahkan divisi');
      }
    } finally {
      setIsSectionSaving(false);
    }
  };

  const handleRenameSection = async (id: string) => {
    const name = renamingValue.trim();
    if (!name) return;
    setIsSectionSaving(true);
    try {
      const result = await updateCreditSection(id, { name });
      if (result.success) {
        setRenamingSectionId(null);
        setRenamingValue('');
      } else {
        setError('Gagal mengubah nama divisi');
      }
    } finally {
      setIsSectionSaving(false);
    }
  };

  const handleDeleteSection = async (id: string) => {
    if (!confirm('Yakin ingin menghapus divisi ini?')) return;
    setIsSectionSaving(true);
    try {
      const result = await deleteCreditSection(id);
      if (!result.success) {
        setError(result.error);
        setTimeout(() => setError(null), 4000);
      }
    } finally {
      setIsSectionSaving(false);
    }
  };

  const filteredMembers = useMemo(
    () => (teamFilter === 'all' ? members : members.filter((m) => m.teamVersion === teamFilter)),
    [members, teamFilter],
  );

  const sectionsForTab = useMemo(
    () => sections.filter((s) => s.teamVersion === sectionTeamTab).sort((a, b) => a.order - b.order),
    [sections, sectionTeamTab],
  );

  const memberCountBySection = useMemo(() => {
    const counts = new Map<string, number>();
    members.forEach((m) => {
      if (!m.sectionId) return;
      counts.set(m.sectionId, (counts.get(m.sectionId) ?? 0) + 1);
    });
    return counts;
  }, [members]);

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

          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => {
                setSectionTeamTab(teamFilter === 'V2' ? 'V2' : 'V1');
                setIsSectionModalOpen(true);
              }}
              className="nq-admin-btn-secondary px-5 py-2.5 rounded-full font-bold flex items-center gap-2 text-sm"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 6h16M4 12h10M4 18h6" />
              </svg>
              Kelola Divisi
            </button>
            <button
              onClick={handleAddNew}
              className="nq-admin-btn-primary px-5 py-2.5 rounded-full font-bold flex items-center gap-2 text-sm"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
              Tambah Anggota
            </button>
          </div>
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
                  <th className="px-6 py-5">Divisi</th>
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
                    <td className="px-6 py-5 opacity-80">
                      {m.sectionId ? sectionsById.get(m.sectionId)?.name ?? '—' : '—'}
                    </td>
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
          aspect={4 / 5}
          required
        />
        <FormField label="Nama" name="name" type="text" placeholder="Nama anggota" value={editingData?.name} required />
        <FormField label="Role" name="role" type="text" placeholder="Contoh: Frontend Developer" value={editingData?.role} required />
        <FormField label="Bio" name="bio" type="textarea" placeholder="Deskripsi singkat kontribusinya" value={editingData?.bio} required rows={3} />

        <div>
          <label className="block text-sm font-semibold text-[#4a2a1a] mb-2">
            Tim<span className="text-red-600 ml-1">*</span>
          </label>
          <select
            value={formTeamVersion}
            onChange={(e) => {
              const nextTeam = e.target.value as 'V1' | 'V2';
              setFormTeamVersion(nextTeam);
              // Reset divisi kalau divisi yang lagi kepilih bukan punya Tim yang baru.
              const stillValid = sections.some((s) => s.id === formSectionId && s.teamVersion === nextTeam);
              if (!stillValid) setFormSectionId('');
            }}
            className="nq-admin-field w-full px-4 py-2.5 rounded-xl"
          >
            {TEAM_VERSIONS.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#4a2a1a] mb-2">
            Divisi<span className="text-red-600 ml-1">*</span>
          </label>
          <select
            value={formSectionId}
            onChange={(e) => setFormSectionId(e.target.value)}
            className="nq-admin-field w-full px-4 py-2.5 rounded-xl"
            required
          >
            <option value="">Pilih divisi</option>
            {sectionsForFormTeam.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          {sectionsForFormTeam.length === 0 && (
            <p className="mt-1.5 text-xs font-semibold text-amber-700">
              Belum ada divisi untuk Tim {formTeamVersion}. Tambahkan lewat tombol &quot;Kelola Divisi&quot; dulu.
            </p>
          )}
        </div>
      </Modal>

      {isSectionModalOpen && (
        <div
          className="nq-admin-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setIsSectionModalOpen(false)}
        >
          <div
            className="nq-admin-modal-frame w-full max-w-lg rounded-[1.75rem] p-2 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="nq-admin-modal-inner rounded-[1.4rem] p-6 sm:p-8 max-h-[85vh] overflow-y-auto nq-admin-scrollbar">
              <button
                onClick={() => setIsSectionModalOpen(false)}
                aria-label="Tutup"
                className="absolute top-4 right-4 p-2 rounded-full text-[#4a2a1a]/60 hover:text-[#4a2a1a] hover:bg-black/5 transition-colors"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              <h2 className="font-bauhaus text-xl sm:text-2xl mb-6 pr-8 tracking-wide">Kelola Divisi</h2>

              <div className="flex gap-2 mb-5">
                {TEAM_VERSIONS.map((v) => (
                  <button
                    key={v}
                    onClick={() => setSectionTeamTab(v)}
                    className={`nq-admin-chip px-4 py-2 rounded-xl text-sm font-bold ${sectionTeamTab === v ? 'nq-admin-chip--active' : ''}`}
                  >
                    {v}
                  </button>
                ))}
              </div>

              <div className="space-y-2 mb-5">
                {sectionsForTab.length === 0 && (
                  <p className="text-sm opacity-60">Belum ada divisi untuk Tim {sectionTeamTab}.</p>
                )}
                {sectionsForTab.map((s) => (
                  <div key={s.id} className="flex items-center gap-2 nq-admin-field px-3 py-2 rounded-xl">
                    {renamingSectionId === s.id ? (
                      <>
                        <input
                          autoFocus
                          value={renamingValue}
                          onChange={(e) => setRenamingValue(e.target.value)}
                          className="flex-1 bg-transparent outline-none text-sm font-semibold"
                        />
                        <button
                          disabled={isSectionSaving}
                          onClick={() => handleRenameSection(s.id)}
                          className="nq-admin-btn-primary px-3 py-1 rounded-lg text-xs font-bold"
                        >
                          Simpan
                        </button>
                        <button
                          onClick={() => setRenamingSectionId(null)}
                          className="nq-admin-btn-secondary px-3 py-1 rounded-lg text-xs font-bold"
                        >
                          Batal
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 text-sm font-semibold">{s.name}</span>
                        <span className="text-xs opacity-50">{memberCountBySection.get(s.id) ?? 0} anggota</span>
                        <button
                          onClick={() => {
                            setRenamingSectionId(s.id);
                            setRenamingValue(s.name);
                          }}
                          className="nq-admin-icon-btn--edit p-1.5 rounded-lg"
                          aria-label="Ganti nama"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
                            <path d="m15 5 4 4" />
                          </svg>
                        </button>
                        <button
                          disabled={isSectionSaving}
                          onClick={() => handleDeleteSection(s.id)}
                          className="nq-admin-icon-btn--delete p-1.5 rounded-lg"
                          aria-label="Hapus divisi"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            <line x1="10" x2="10" y1="11" y2="17" />
                            <line x1="14" x2="14" y1="11" y2="17" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-4 border-t border-[#8b5e2a]/20">
                <input
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSection();
                    }
                  }}
                  placeholder={`Divisi baru untuk Tim ${sectionTeamTab} (mis. Ketua)`}
                  className="nq-admin-field flex-1 px-4 py-2.5 rounded-xl text-sm"
                />
                <button
                  disabled={isSectionSaving || !newSectionName.trim()}
                  onClick={handleAddSection}
                  className="nq-admin-btn-primary px-5 py-2.5 rounded-full font-bold text-sm shrink-0"
                >
                  Tambah
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
