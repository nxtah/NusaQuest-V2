'use client';
import {Fragment, useEffect, useMemo, useState} from 'react';
import Modal, {FormField} from './Modal';
import {
  listenToGameQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  type AdminQuestion as Question,
} from '@/src/services/firebase/firestore/admin-questions.service';
import {getMaps} from '@/src/features/maps/services/maps.service';
import {getRegions} from '@/src/features/destination/services/regions.service';
import type {GameMap, Region} from '@/src/types/firestore';

function getQuestionText(question: Question) {
  return question.question;
}

export default function QuestionsTable() {
  const [maps, setMaps] = useState<GameMap[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedGame, setSelectedGame] = useState('');
  const [questions, setQuestions] = useState<Record<string, Question>>({});
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Question | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState('');

  // ── Generate soal pakai AI ────────────────────────────────────────────
  // Alur: admin isi prompt bebas + region + jumlah -> panggil
  // /api/admin/questions/generate (server-side, OpenRouter) -> hasilnya
  // ANTRE di sini, ditampilin SATU-SATU di modal create yang udah ada buat
  // di-review/edit sebelum beneran ke-simpan (dikonfirmasi user: gak
  // auto-simpan langsung).
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiCount, setAiCount] = useState(3);
  const [aiRegionId, setAiRegionId] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiQueue, setAiQueue] = useState<{ text: string; options: [string, string, string, string]; correctIndex: 0 | 1 | 2 | 3 }[]>([]);
  const [aiQueueIndex, setAiQueueIndex] = useState(0);

  // Peta beneran (`maps` collection) — sebelumnya daftar `GAMES` di-hardcode
  // pake id kayak `map_kuliner` yang gak pernah match `mapId` asli manapun
  // di Firestore (yang beneran cuma `kuliner`, `pariwisata`, dst), jadi
  // query soal selalu balik kosong biarpun soalnya ada.
  useEffect(() => {
    getMaps()
      .then((result) => {
        setMaps(result);
        if (result.length > 0) setSelectedGame((prev) => prev || result[0].mapId);
      })
      .catch(() => setError('Gagal memuat daftar map'));
  }, []);

  // Region beneran (`regions` collection, di-scope ke map yang lagi dipilih)
  // — sebelumnya "Topik" cuma label bebas (DAERAH/KULINER/dst) yang gak
  // nyambung ke `regionId` asli yang dipake query game (`getQuestionsByRegion`).
  useEffect(() => {
    if (!selectedGame) return;
    getRegions(selectedGame)
      .then(setRegions)
      .catch(() => setError('Gagal memuat daftar region'));
    // Region ke-scope per map — filter provinsi dari map sebelumnya gak
    // relevan lagi begitu ganti map (kategori), reset biar gak nyangkut
    // nunjukin tabel kosong padahal cuma filter basi.
    setRegionFilter('');
  }, [selectedGame]);

  const regionNameById = useMemo(
    () => Object.fromEntries(regions.map((r) => [r.regionId, r.name])),
    [regions],
  );

  // Load questions — realtime, biar soal baru/edit dari tab/admin lain
  // (termasuk hasil AI yang baru disimpan) langsung kelihatan.
  useEffect(() => {
    if (!selectedGame) return;
    setLoading(true);
    const unsub = listenToGameQuestions(selectedGame, (result) => {
      setQuestions(result);
      setLoading(false);
    });
    return () => unsub();
  }, [selectedGame]);

  const handleAddNew = () => {
    setEditingId(null);
    setEditingData(null);
    setAiQueue([]);
    setIsModalOpen(true);
  };

  const openAiModal = () => {
    setAiError(null);
    setAiPrompt('');
    setAiCount(3);
    setAiRegionId(regions[0]?.regionId ?? '');
    setIsAiModalOpen(true);
  };

  // `queue` diterima sebagai parameter (bukan baca state `aiQueue`) — dipanggil
  // tepat setelah `setAiQueue(...)`, dan state React belum ke-update di
  // render/closure yang sama, jadi baca `aiQueue` langsung di sini bakal
  // dapet array lama (kosong).
  const loadQueueItem = (queue: typeof aiQueue, index: number, regionId: string) => {
    const item = queue[index];
    if (!item) return;
    setEditingId(null);
    setEditingData({
      question: item.text,
      options: item.options,
      correctIndex: item.correctIndex,
      regionId,
    });
    setAiQueueIndex(index);
    setIsModalOpen(true);
  };

  const handleGenerateWithAi = async (data: Record<string, unknown>) => {
    // `FormField type="select"` (buat region) itu native <select> uncontrolled
    // (defaultValue doang, gak ada onChange) — nilainya dibaca dari FormData
    // yang Modal kumpulin, bukan dari state `aiRegionId` (yang cuma dipake
    // buat nge-set NILAI AWAL dropdown pas modal dibuka).
    const regionId = String(data.aiRegionId ?? aiRegionId ?? '');
    if (!regionId || !aiPrompt.trim()) {
      setAiError('Isi region dan prompt dulu.');
      return;
    }
    setAiRegionId(regionId);
    setAiGenerating(true);
    setAiError(null);
    try {
      const map = maps.find((m) => m.mapId === selectedGame);
      const region = regions.find((r) => r.regionId === regionId);
      const res = await fetch('/api/admin/questions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mapId: selectedGame,
          regionId,
          regionName: region?.name ?? regionId,
          mapCategory: map?.name ?? selectedGame,
          prompt: aiPrompt.trim(),
          count: aiCount,
        }),
      });
      const resJson = await res.json();
      if (!resJson.ok) throw new Error(resJson.error || 'Gagal generate soal.');

      setAiQueue(resJson.questions);
      setIsAiModalOpen(false);
      loadQueueItem(resJson.questions, 0, regionId);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Gagal generate soal.');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleEdit = (id: string, data: Question) => {
    setEditingId(id);
    setEditingData(data);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    setLoading(true);
    const result = await deleteQuestion(selectedGame, id);

    if (result.success) {
      setQuestions((prev) => {
        const updated = {...prev};
        delete updated[id];
        return updated;
      });
      setSuccess('Question deleted successfully');
    } else {
      setError('Failed to delete question');
    }
    setLoading(false);

    setTimeout(() => setSuccess(null), 3000);
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    setIsSaving(true);
    setError(null);

    try {
      const options: [string, string, string, string] = [
        String(data.option0 ?? ''),
        String(data.option1 ?? ''),
        String(data.option2 ?? ''),
        String(data.option3 ?? ''),
      ];
      const correctIndex = Number(data.correctIndex ?? 0);
      const payload = {
        question: data.question as string,
        options,
        correctIndex,
        regionId: data.regionId as string,
      };

      if (editingId) {
        // Update existing
        const result = await updateQuestion(selectedGame, editingId, payload);

        if (result.success) {
          setQuestions((prev) => ({
            ...prev,
            [editingId]: {
              ...editingData,
              ...payload,
              updatedAt: result.data.updatedAt,
            } as Question,
          }));
          setSuccess('Question updated successfully');
        } else {
          setError('Failed to update question');
        }
      } else {
        // Create new
        const result = await createQuestion(selectedGame, payload);

        if (result.success) {
          setQuestions((prev) => ({
            ...prev,
            [result.data.id]: {
              id: result.data.id,
              ...payload,
              gameId: selectedGame,
            },
          }));
          setSuccess('Question created successfully');
        } else {
          setError('Failed to create question');
        }
      }

      // Kalau lagi nge-review antrean hasil AI dan masih ada soal berikutnya
      // yang belum di-review, lanjut ke soal berikutnya (modal tetep kebuka)
      // alih-alih nutup modal — biar admin gak perlu klik "Add New" +
      // "Generate" ulang buat tiap soal.
      const hasNextInQueue = aiQueue.length > 0 && aiQueueIndex + 1 < aiQueue.length;
      if (hasNextInQueue) {
        loadQueueItem(aiQueue, aiQueueIndex + 1, aiRegionId);
      } else {
        setIsModalOpen(false);
        setAiQueue([]);
      }
      setTimeout(() => setSuccess(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const questionsArray = Object.entries(questions)
    .map(([id, q]) => ({
      id,
      ...q,
      question: getQuestionText(q),
    }))
    .filter((q) => {
      if (regionFilter && q.regionId !== regionFilter) return false;
      const query = searchQuery.trim().toLowerCase();
      if (!query) return true;
      return (
        q.question.toLowerCase().includes(query) ||
        q.options.some((opt) => opt.toLowerCase().includes(query)) ||
        (regionNameById[q.regionId] ?? q.regionId).toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      const aTime = (a as Question & {createdAt?: number}).createdAt || 0;
      const bTime = (b as Question & {createdAt?: number}).createdAt || 0;
      return bTime - aTime;
    });

  return (
    <>
      <div className="nq-admin-panel flex-1 rounded-[1.75rem] p-5 sm:p-8 overflow-hidden flex flex-col relative">
        {/* Alerts */}
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

        {/* Top Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-6 sm:mb-8">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {maps.map((map) => (
              <button
                key={map.mapId}
                onClick={() => setSelectedGame(map.mapId)}
                className={`nq-admin-chip px-5 py-2.5 font-bold rounded-xl whitespace-nowrap text-sm ${selectedGame === map.mapId ? 'nq-admin-chip--active' : ''}`}
              >
                {map.icon} {map.name}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={openAiModal}
              disabled={regions.length === 0}
              className="nq-admin-btn-secondary px-5 py-2.5 rounded-full font-bold text-sm flex items-center gap-2"
            >
              ✨ Generate dengan AI
            </button>
            <button
              onClick={handleAddNew}
              disabled={regions.length === 0}
              className="nq-admin-btn-primary px-5 py-2.5 rounded-full font-bold flex items-center gap-2 text-sm"
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
              Tambah Soal
            </button>
          </div>
        </div>

        {/* Search Bar + Filter Provinsi */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4 sm:mb-6">
          <div className="relative flex-1">
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
              placeholder="Cari soal, pilihan jawaban, atau region..."
              className="nq-admin-field w-full pl-11 pr-4 py-2.5 rounded-xl text-sm"
            />
          </div>

          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="nq-admin-field px-4 py-2.5 rounded-xl text-sm font-semibold sm:w-56"
          >
            <option value="">Semua Provinsi</option>
            {regions.map((region) => (
              <option key={region.regionId} value={region.regionId}>
                {region.name}
              </option>
            ))}
          </select>
        </div>

        {/* Table Container */}
        <div className="nq-admin-table-wrap nq-admin-scrollbar flex-1 overflow-auto rounded-2xl">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-3 border-[#f5a916]/40 border-t-[#f5a916] rounded-full animate-spin" />
                <p className="opacity-60">Memuat soal...</p>
              </div>
            </div>
          ) : questionsArray.length > 0 ? (
            <table className="nq-admin-table w-full text-sm text-left">
              <thead className="text-[11px] uppercase font-extrabold tracking-widest sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-5 w-16 text-center">#</th>
                  <th className="px-6 py-5 w-[35%]">Pertanyaan</th>
                  <th className="px-6 py-5 w-[30%]">Pilihan (✓ = benar)</th>
                  <th className="px-6 py-5">Region</th>
                  <th className="px-6 py-5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {questionsArray.map((q, idx) => (
                  <tr key={q.id} className="group">
                    <td className="px-6 py-5 font-black opacity-50 text-center">
                      {idx + 1}
                    </td>
                    <td className="px-6 py-5 font-bold text-base pr-8 leading-relaxed">
                      {q.question}
                    </td>
                    <td className="px-6 py-5 text-xs space-y-0.5 opacity-80">
                      {q.options.map((opt, i) => (
                        <div key={i} className={i === q.correctIndex ? 'font-bold text-emerald-700 opacity-100' : ''}>
                          {i === q.correctIndex ? '✓ ' : '· '}
                          {opt || <span className="italic opacity-50">(kosong)</span>}
                        </div>
                      ))}
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-3 py-1.5 bg-black/5 rounded-lg text-xs font-bold uppercase tracking-wider">
                        {regionNameById[q.regionId] ?? q.regionId}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleEdit(q.id, q)}
                          className="nq-admin-icon-btn--edit p-2.5 rounded-xl"
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
                          onClick={() => handleDelete(q.id)}
                          className="nq-admin-icon-btn--delete p-2.5 rounded-xl"
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
              <p className="opacity-60 text-lg">
                {searchQuery.trim()
                  ? `Gak ada soal yang cocok dengan "${searchQuery}".`
                  : 'Belum ada soal. Tambahkan atau generate dengan AI untuk mulai.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        title={
          editingId
            ? 'Edit Question'
            : aiQueue.length > 0
              ? `Review Soal AI (${aiQueueIndex + 1}/${aiQueue.length})`
              : 'Add New Question'
        }
        onClose={() => { setIsModalOpen(false); setAiQueue([]); }}
        onSubmit={handleSubmit}
        isLoading={isSaving}
        submitButtonText={editingId ? 'Update' : aiQueueIndex + 1 < aiQueue.length ? 'Simpan & Lanjut' : 'Simpan'}
        size="lg"
      >
        {/* `key` di sini SENGAJA — field-field di bawah pake defaultValue/
            defaultChecked (uncontrolled), yang cuma kebaca sekali pas mount.
            Pas antrean AI maju ke soal berikutnya, modal-nya TETEP kebuka
            (gak unmount), jadi tanpa key ini isinya bakal nyangkut di soal
            sebelumnya walau `editingData` state-nya udah keganti. */}
        <Fragment key={editingId ?? `ai-${aiQueueIndex}-${aiQueue.length}`}>
        <FormField
          label="Question"
          name="question"
          type="textarea"
          placeholder="Enter the question"
          value={editingData?.question}
          required
          rows={3}
        />

        <div>
          <label className="block text-sm font-semibold text-[#4a2a1a] mb-2">
            Pilihan Jawaban (4 opsi, pilih 1 yang benar)
            <span className="text-red-600 ml-1">*</span>
          </label>
          <div className="space-y-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <input
                  type="radio"
                  name="correctIndex"
                  value={i}
                  defaultChecked={(editingData?.correctIndex ?? 0) === i}
                  required
                  className="h-4 w-4 shrink-0 accent-[#2f8f74]"
                  aria-label={`Opsi ${i + 1} adalah jawaban benar`}
                />
                <input
                  type="text"
                  name={`option${i}`}
                  defaultValue={editingData?.options?.[i] ?? ''}
                  placeholder={`Pilihan ${i + 1}`}
                  required
                  className="nq-admin-field flex-1 px-4 py-2.5 rounded-xl"
                />
              </div>
            ))}
          </div>
        </div>

        <FormField
          label="Region"
          name="regionId"
          type="select"
          value={editingData?.regionId}
          required
        >
          {regions.map((region) => (
            <option key={region.regionId} value={region.regionId}>
              {region.name}
            </option>
          ))}
        </FormField>
        </Fragment>
      </Modal>

      {/* Modal Generate dengan AI */}
      <Modal
        isOpen={isAiModalOpen}
        title="Generate Soal dengan AI"
        onClose={() => setIsAiModalOpen(false)}
        onSubmit={handleGenerateWithAi}
        isLoading={aiGenerating}
        submitButtonText={aiGenerating ? 'Menghasilkan...' : 'Generate'}
        size="md"
      >
        {aiError && (
          <div className="mb-2 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm font-semibold">
            {aiError}
          </div>
        )}
        <FormField
          label="Region"
          name="aiRegionId"
          type="select"
          value={aiRegionId}
          required
        >
          {regions.map((region) => (
            <option key={region.regionId} value={region.regionId}>
              {region.name}
            </option>
          ))}
        </FormField>
        <div>
          <label className="block text-sm font-semibold text-[#4a2a1a] mb-2">
            Prompt buat AI <span className="text-red-600 ml-1">*</span>
          </label>
          <textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            rows={3}
            placeholder="Contoh: fokus ke makanan khas & cara penyajiannya, buat anak SD"
            className="nq-admin-field w-full px-4 py-2.5 rounded-xl"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#4a2a1a] mb-2">Jumlah soal</label>
          <input
            type="number"
            min={1}
            max={10}
            value={aiCount}
            onChange={(e) => setAiCount(Math.max(1, Math.min(10, Number(e.target.value) || 1)))}
            className="nq-admin-field w-full px-4 py-2.5 rounded-xl"
          />
        </div>
      </Modal>
    </>
  );
}
