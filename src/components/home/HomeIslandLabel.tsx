import Link from 'next/link';

type HomeIslandLabelProps = {
  label: string;
  className?: string;
  href?: string;
};

export default function HomeIslandLabel({ label, className = '', href }: HomeIslandLabelProps) {
  const baseClassName = `absolute left-1/2 top-1/2 z-[60] inline-flex -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border-2 border-white/95 bg-gradient-to-br from-[#4b9bff] to-[#2575fc] px-4 py-2 text-[clamp(0.74rem,0.95vw,0.98rem)] font-bold tracking-[0.015em] text-white shadow-[0_8px_20px_rgba(22,78,176,0.3)] ${className}`;

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
          className="absolute -bottom-[0.42rem] left-1/2 h-[0.7rem] w-[0.7rem] -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-white/95 bg-[#2575fc]"
        />
      </Link>
    );
  }

  return (
    <span className={`pointer-events-none ${baseClassName}`}>
      {label}
      <span
        aria-hidden="true"
        className="absolute -bottom-[0.42rem] left-1/2 h-[0.7rem] w-[0.7rem] -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-white/95 bg-[#2575fc]"
      />
    </span>
  );
}
