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
      className={`pointer-events-auto cursor-pointer transition-all duration-200 hover:scale-[1.05] active:scale-[0.97] ${baseClass} border-none p-0 rounded-[0.6rem] font-[family-name:var(--font-poppins)]`}
      style={{
        // filter (not box-shadow) so the tail is included in one continuous
        // ground shadow instead of the bubble and tail casting two separate ones.
        filter: 'drop-shadow(0 10px 14px rgba(0, 0, 0, 0.4))',
      }}
    >
      <span
        className="block px-5 py-2.5 text-base font-extrabold italic"
        style={{
          background: 'linear-gradient(180deg, #2E82B5 0%, #1C5D87 100%)',
          border: '2px solid rgba(255, 255, 255, 0.85)',
          color: '#fff',
          borderRadius: '0.6rem',
        }}
      >
        {label}
      </span>
      <span
        aria-hidden="true"
        className="absolute -bottom-[0.42rem] left-1/2 h-[0.7rem] w-[0.7rem] -translate-x-1/2 rotate-45 rounded-sm"
        style={{
          background: '#1C5D87',
          borderBottom: '2px solid rgba(255, 255, 255, 0.85)',
          borderRight: '2px solid rgba(255, 255, 255, 0.85)',
        }}
      />
    </button>
  );
}
