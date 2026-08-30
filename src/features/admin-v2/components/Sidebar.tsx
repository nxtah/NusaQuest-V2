import { Dispatch, SetStateAction } from 'react';

interface SidebarProps {
  activeMenu: string;
  setActiveMenu: Dispatch<SetStateAction<string>>;
  onLogout: () => void;
}

const NAV_ITEMS = [
  {
    id: 'pertanyaan',
    label: 'Pertanyaan & Jawaban',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></svg>
    ),
  },
  {
    id: 'informasi',
    label: 'Informasi',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
    ),
  },
  {
    id: 'kota',
    label: 'Kota & Provinsi',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
    ),
  },
  {
    id: 'credit',
    label: 'Credit',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
    ),
  },
];

export default function Sidebar({ activeMenu, setActiveMenu, onLogout }: SidebarProps) {
  return (
    <aside className="nq-admin-sidebar shrink-0 z-10 relative flex lg:flex-col lg:justify-between lg:w-[300px] lg:py-8 lg:px-5">
      {/* Logo — cuma keliatan di desktop, biar top-bar mobile gak sesak. */}
      <div className="hidden lg:flex items-center justify-center mb-8 mt-1 px-2">
        <img
          src="https://res.cloudinary.com/dprxjzfxp/image/upload/q_auto/f_auto/v1776085647/logo_ywb81o.webp"
          alt="NusaQuest Logo"
          className="w-48 drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
        />
      </div>

      {/* Nav — full label di desktop (vertikal), icon-only scrollable row di mobile (horizontal, ngambil pola "top bar" biasa buat admin tool responsive). */}
      <nav className="flex lg:flex-col gap-2 lg:gap-2.5 overflow-x-auto lg:overflow-visible px-3 py-2.5 lg:p-0 flex-1 lg:flex-none">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveMenu(item.id)}
            className={`nq-admin-navbtn shrink-0 flex items-center gap-3 px-4 py-3 lg:px-5 lg:py-3.5 rounded-2xl font-bold whitespace-nowrap text-sm lg:text-base ${
              activeMenu === item.id ? 'nq-admin-navbtn--active' : ''
            }`}
          >
            {item.icon}
            <span className="hidden sm:inline truncate">{item.label}</span>
          </button>
        ))}
      </nav>

      <button
        onClick={onLogout}
        className="nq-admin-signout shrink-0 flex items-center gap-3 px-4 py-3 lg:px-5 lg:py-4 font-bold text-sm lg:text-base lg:mt-6 mr-3 lg:mr-0"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
        <span className="hidden sm:inline">Keluar</span>
      </button>
    </aside>
  );
}
