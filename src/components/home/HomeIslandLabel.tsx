'use client';

import Link from 'next/link';

type HomeIslandLabelProps = {
  label: string;
  className?: string;
  href?: string;
  onClick?: () => void;
};

export default function HomeIslandLabel({ label, className = '', href, onClick }: HomeIslandLabelProps) {
  const baseClassName = `absolute left-1/2 top-1/2 z-[60] inline-flex -translate-x-1/2 -translate-y-1/2 whitespace-nowrap ${className} home-label-game`;

  if (onClick) {
    return (
      <button
        onClick={onClick}
        aria-label={`Buka ${label}`}
        className={`pointer-events-auto cursor-pointer transition-transform hover:scale-[1.04] ${baseClassName} border-none p-0`}
      >
        {label}
        <span
          aria-hidden="true"
          className="absolute -bottom-[0.42rem] left-1/2 h-[0.7rem] w-[0.7rem] -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-white/95 home-label-tail-game"
        />
      </button>
    );
  }

  if (href) {
    return (
      <Link
        href={href}
        aria-label={`Buka ${label}`}
        className={`pointer-events-auto cursor-pointer transition-transform hover:scale-[1.04] ${baseClassName}`}
      >
        {label}
        <span
          aria-hidden="true"
          className="absolute -bottom-[0.42rem] left-1/2 h-[0.7rem] w-[0.7rem] -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-white/95 home-label-tail-game"
        />
      </Link>
    );
  }

  return (
    <span className={`pointer-events-none ${baseClassName}`}>
      {label}
        <span
          aria-hidden="true"
          className="absolute -bottom-[0.42rem] left-1/2 h-[0.7rem] w-[0.7rem] -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-white/95 home-label-tail-game"
        />
    </span>
  );
}
