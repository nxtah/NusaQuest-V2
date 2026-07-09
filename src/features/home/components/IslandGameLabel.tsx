'use client';

import { useGameFlowContext } from '../context/GameFlowContext';

interface IslandGameLabelProps {
  label: string;
  className?: string;
}

export default function IslandGameLabel({ label, className = '' }: IslandGameLabelProps) {
  const { onIslandClick } = useGameFlowContext();

  const baseClass =
    `absolute left-1/2 top-1/2 z-[60] inline-flex -translate-x-1/2 -translate-y-1/2 whitespace-nowrap ${className}`;

  return (
    <button
      onClick={() => onIslandClick(label)}
      aria-label={`Buka game dari ${label}`}
      className={`pointer-events-auto cursor-pointer transition-all duration-200 hover:scale-[1.05] active:scale-[0.97] ${baseClass} border-none p-0 rounded-[0.25rem] font-[family-name:var(--font-poppins)]`}
    >
      <span
        className="block px-5 py-3 text-base font-semibold"
        style={{
          background: 'linear-gradient(135deg, #FFC857 0%, #FFB703 70%)',
          color: '#1a1200',
          borderRadius: '0.25rem',
          boxShadow: '0 8px 22px rgba(255, 184, 0, 0.14)',
        }}
      >
        {label}
      </span>
      <span
        aria-hidden="true"
        className="absolute -bottom-[0.42rem] left-1/2 h-[0.7rem] w-[0.7rem] -translate-x-1/2 rotate-45"
        style={{
          background: 'linear-gradient(135deg, #FFDB6B 0%, #FFC857 100%)',
          boxShadow: '0 4px 10px rgba(255, 184, 0, 0.12)',
        }}
      />
    </button>
  );
}
