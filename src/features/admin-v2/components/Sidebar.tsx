import { Dispatch, SetStateAction } from 'react';

interface SidebarProps {
  activeMenu: string;
  setActiveMenu: Dispatch<SetStateAction<string>>;
  onLogout: () => void;
}

export default function Sidebar({ activeMenu, setActiveMenu, onLogout }: SidebarProps) {
  return (
    <aside className="w-[340px] bg-[#1e2532]/90 backdrop-blur-2xl flex flex-col justify-between py-8 px-6 border-r border-white/10 shrink-0 z-10 relative shadow-2xl">
      <div>
        <div className="flex items-center justify-center mb-10 mt-2 px-2">
          <img 
            src="https://res.cloudinary.com/dprxjzfxp/image/upload/q_auto/f_auto/v1776085647/logo_ywb81o.webp" 
            alt="NusaQuest Logo" 
            className="w-56 drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
          />
        </div>

        <nav className="space-y-3">
          <button 
            onClick={() => setActiveMenu('pertanyaan')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all whitespace-nowrap ${
              activeMenu === 'pertanyaan' 
              ? 'bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)] text-white' 
              : 'hover:bg-white/10 text-gray-300'
            }`}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
            <span className="truncate">Pertanyaan & Jawaban</span>
          </button>
          <button 
            onClick={() => setActiveMenu('informasi')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all whitespace-nowrap ${
              activeMenu === 'informasi' 
              ? 'bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)] text-white' 
              : 'hover:bg-white/10 text-gray-300'
            }`}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            <span className="truncate">Informasi</span>
          </button>
          <button 
            onClick={() => setActiveMenu('kota')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all whitespace-nowrap ${
              activeMenu === 'kota' 
              ? 'bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)] text-white' 
              : 'hover:bg-white/10 text-gray-300'
            }`}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            <span className="truncate">Kota & Provinsi</span>
          </button>
        </nav>
      </div>

      <button 
        onClick={onLogout}
        className="flex items-center gap-4 px-5 py-4 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-2xl font-bold transition-all mt-10"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
        Sign Out
      </button>
    </aside>
  );
}
