'use client';

import Link from 'next/link';

interface HeaderProps {
  showBackIcon?: boolean;
}

export default function Header({ showBackIcon }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="flex items-center gap-3">
        {showBackIcon && (
          <button
            onClick={() => window.history.back()}
            className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Kembali"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
        )}
        <Link href="/home" className="font-bold text-lg text-slate-800">
          NusaQuest
        </Link>
      </div>

      <Link href="/profile" className="h-9 w-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
        N
      </Link>
    </header>
  );
}
