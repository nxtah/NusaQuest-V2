const MOCK_QUESTIONS = [
  { id: 1, question: 'Apa ibu kota dari provinsi Jawa Barat?', answer: 'Bandung', topic: 'Daerah' },
  { id: 2, question: 'Makanan khas dari daerah Palembang yang terbuat dari ikan dan sagu adalah?', answer: 'Pempek', topic: 'Kuliner' },
  { id: 3, question: 'Alat musik angklung berasal dari provinsi mana?', answer: 'Jawa Barat', topic: 'Musik' },
  { id: 4, question: 'Tari Kecak merupakan tarian tradisional dari daerah mana?', answer: 'Bali', topic: 'Tari' },
  { id: 5, question: 'Gunung tertinggi di pulau Jawa adalah gunung apa?', answer: 'Gunung Semeru', topic: 'Daerah' },
];

export default function QuestionsTable() {
  return (
    <div className="flex-1 bg-[#1e2532]/80 backdrop-blur-2xl rounded-[2rem] border border-white/20 p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col relative">
      
      {/* Top Actions Bar */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex gap-3 bg-black/40 p-1.5 rounded-2xl border border-white/10">
          <button className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg transition-all">Game Ular Tangga</button>
          <button className="px-6 py-2.5 hover:bg-white/10 text-gray-300 font-bold rounded-xl transition-all">Game Nusa Card</button>
        </div>

        <div className="flex gap-3">
          <button className="px-6 py-3 bg-[#2d3748]/80 border border-white/20 hover:bg-[#3a4556] text-white rounded-xl font-bold transition-all shadow-md text-sm backdrop-blur-sm">
            Save Changes
          </button>
          <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(37,99,235,0.6)] text-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            Add New
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-auto rounded-2xl border border-white/10 bg-black/30 backdrop-blur-md custom-scrollbar">
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
            {MOCK_QUESTIONS.map((q, idx) => (
              <tr key={q.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-6 py-5 font-black text-gray-400 text-center">{idx + 1}</td>
                <td className="px-6 py-5 font-bold text-base text-gray-100 pr-8 leading-relaxed">{q.question}</td>
                <td className="px-6 py-5 font-bold text-blue-300 text-base">{q.answer}</td>
                <td className="px-6 py-5">
                  <span className="px-3 py-1.5 bg-white/10 rounded-lg text-xs font-bold text-gray-200 uppercase tracking-wider border border-white/10 shadow-sm">
                    {q.topic}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center justify-center gap-3">
                    <button className="p-2.5 bg-blue-500/20 hover:bg-blue-500 text-blue-300 hover:text-white rounded-xl transition-all border border-blue-500/30 hover:border-transparent shadow-sm">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>
                    </button>
                    <button className="p-2.5 bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white rounded-xl transition-all border border-red-500/30 hover:border-transparent shadow-sm">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
