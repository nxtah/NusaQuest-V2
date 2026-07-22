'use client';
import {useEffect, useState} from 'react';
import Modal, {FormField} from './Modal';
import {
  getGameQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  type AdminQuestion as Question,
} from '@/src/services/firebase/firestore/admin-questions.service';

const GAMES = [
  {id: 'map_kuliner', name: 'Kuliner Tradisional'},
  {id: 'map_sejarah', name: 'Sejarah'},
  {id: 'map_budaya', name: 'Seni Budaya'},
  {id: 'map_wisata', name: 'Destinasi Wisata'},
  {id: 'map_pahlawan', name: 'Pahlawan & Tokoh'},
];

const TOPICS = [
  'DAERAH',
  'KULINER',
  'MUSIK',
  'TARI',
  'SEJARAH',
  'ALAM',
  'OLAHRAGA',
  'TRADISI',
];

function getQuestionText(question: Question) {
  return question.question;
}

function getQuestionAnswer(question: Question) {
  return question.answer;
}

function getQuestionTopic(question: Question) {
  return question.topic;
}

export default function QuestionsTable() {
  const [selectedGame, setSelectedGame] = useState('map_kuliner');
  const [questions, setQuestions] = useState<Record<string, Question>>({});
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Question | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load questions
  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      setError(null);
      const result = await getGameQuestions(selectedGame);

      if (result.success) {
        setQuestions(result.data || {});
      } else {
        setError('Failed to load questions');
      }
      setLoading(false);
    };

    loadQuestions();
  }, [selectedGame]);

  const handleAddNew = () => {
    setEditingId(null);
    setEditingData(null);
    setIsModalOpen(true);
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
      if (editingId) {
        // Update existing
        const result = await updateQuestion(selectedGame, editingId, {
          question: data.question as string,
          answer: data.answer as string,
          topic: data.topic as string,
        });

        if (result.success) {
          setQuestions((prev) => ({
            ...prev,
            [editingId]: {
              ...editingData,
              question: (result.data.question ?? editingData?.question) as string,
              answer: (result.data.answer ?? editingData?.answer) as string,
              topic: (result.data.topic ?? editingData?.topic) as string,
              updatedAt: result.data.updatedAt,
            } as Question,
          }));
          setSuccess('Question updated successfully');
        } else {
          setError('Failed to update question');
        }
      } else {
        // Create new
        const result = await createQuestion(selectedGame, {
          question: data.question as string,
          answer: data.answer as string,
          topic: data.topic as string,
        });

        if (result.success) {
          setQuestions((prev) => ({
            ...prev,
            [result.data.id]: {
              id: result.data.id,
              question: data.question as string,
              answer: data.answer as string,
              topic: data.topic as string,
              gameId: selectedGame,
            },
          }));
          setSuccess('Question created successfully');
        } else {
          setError('Failed to create question');
        }
      }

      setIsModalOpen(false);
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
      answer: getQuestionAnswer(q),
      topic: getQuestionTopic(q),
    }))
    .sort((a, b) => {
      const aTime = (a as Question & {createdAt?: number}).createdAt || 0;
      const bTime = (b as Question & {createdAt?: number}).createdAt || 0;
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
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-3 bg-black/40 p-1.5 rounded-2xl border border-white/10">
            {GAMES.map((game) => (
              <button
                key={game.id}
                onClick={() => setSelectedGame(game.id)}
                className={`px-6 py-2.5 font-bold rounded-xl transition-all ${selectedGame === game.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'hover:bg-white/10 text-gray-300'
                  }`}
              >
                {game.name}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
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
        </div>

        {/* Table Container */}
        <div className="flex-1 overflow-auto rounded-2xl border border-white/10 bg-black/30 backdrop-blur-md custom-scrollbar">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-3 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                <p className="text-gray-400">Loading questions...</p>
              </div>
            </div>
          ) : questionsArray.length > 0 ? (
            <table className="w-full text-sm text-left">
              <thead className="text-[11px] uppercase bg-black/60 text-gray-300 font-extrabold tracking-widest sticky top-0 z-10 backdrop-blur-xl border-b border-white/10">
                <tr>
                  <th className="px-6 py-5 w-16 text-center">#</th>
                  <th className="px-6 py-5 w-[40%]">PERTANYAAN</th>
                  <th className="px-6 py-5 w-[30%]">JAWABAN</th>
                  <th className="px-6 py-5">TOPIK</th>
                  <th className="px-6 py-5 text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {questionsArray.map((q, idx) => (
                  <tr key={q.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-5 font-black text-gray-400 text-center">
                      {idx + 1}
                    </td>
                    <td className="px-6 py-5 font-bold text-base text-gray-100 pr-8 leading-relaxed">
                      {q.question}
                    </td>
                    <td className="px-6 py-5 font-bold text-blue-300 text-base">
                      {q.answer}
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-3 py-1.5 bg-white/10 rounded-lg text-xs font-bold text-gray-200 uppercase tracking-wider border border-white/10 shadow-sm">
                        {q.topic}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleEdit(q.id, q)}
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
                          onClick={() => handleDelete(q.id)}
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
              <p className="text-gray-400 text-lg">No questions found. Create one to get started!</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        title={editingId ? 'Edit Question' : 'Add New Question'}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        isLoading={isSaving}
        submitButtonText={editingId ? 'Update' : 'Create'}
        size="lg"
      >
        <FormField
          label="Question"
          name="question"
          type="textarea"
          placeholder="Enter the question"
          value={editingData?.question}
          required
          rows={3}
        />
        <FormField
          label="Answer"
          name="answer"
          type="text"
          placeholder="Enter the answer"
          value={editingData?.answer}
          required
        />
        <FormField
          label="Topic"
          name="topic"
          type="select"
          value={editingData?.topic}
          required
        >
          {TOPICS.map((topic) => (
            <option key={topic} value={topic} className="text-gray-900">
              {topic}
            </option>
          ))}
        </FormField>
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
