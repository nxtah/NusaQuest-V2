'use client';

import { useGameFlowContext } from '../context/GameFlowContext';

interface InteractiveIslandLabelProps {
  label: string;
  className?: string;
}

export default function InteractiveIslandLabel({
  label,
  className = '',
}: InteractiveIslandLabelProps) {
  const { onIslandClick } = useGameFlowContext();

  const baseClassName = `absolute left-1/2 top-1/2 z-[60] inline-flex -translate-x-1/2 -translate-y-1/2 whitespace-nowrap ${className} home-label-game`;

  return (
    <button
      onClick={() => onIslandClick(label)}
      aria-label={`Buka game dari ${label}`}
      className={`pointer-events-auto cursor-pointer transition-transform hover:scale-[1.04] active:scale-[0.98] ${baseClassName} border-none p-0`}
    >
      {label}
      <span
        aria-hidden="true"
        className="absolute -bottom-[0.42rem] left-1/2 h-[0.7rem] w-[0.7rem] -translate-x-1/2 rotate-45 home-label-tail-game"
      />
    </button>
  );
}
