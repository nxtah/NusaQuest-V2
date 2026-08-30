type CreditMemberCardProps = {
  name: string;
  role: string;
  photoURL?: string;
  onClick: () => void;
};

export default function CreditMemberCard({ name, role, photoURL, onClick }: CreditMemberCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="nq-credit-card group relative overflow-hidden rounded-2xl p-3 text-left text-[#4a2a1a] transition duration-200 hover:-translate-y-1 sm:p-4"
    >
      <style>{`
        .nq-credit-card {
          background: linear-gradient(150deg, #fff6e0 0%, #f2dfae 100%);
          box-shadow:
            0 4px 10px rgba(139, 94, 42, 0.28),
            inset -2px -2px 4px rgba(139, 94, 42, 0.16),
            inset 2px 2px 4px rgba(255, 255, 255, 0.85);
        }
        .nq-credit-card:hover {
          filter: brightness(1.02);
          box-shadow:
            0 8px 16px rgba(139, 94, 42, 0.32),
            inset -2px -2px 4px rgba(139, 94, 42, 0.16),
            inset 2px 2px 4px rgba(255, 255, 255, 0.85);
        }
      `}</style>

      <div className="mb-3 aspect-square w-full overflow-hidden rounded-xl border-2 border-dashed border-[#c6841a]/50 bg-[#fdf6e3]">
        {photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoURL} alt={name} className="h-full w-full object-cover" />
        ) : null}
      </div>
      <h2 className="line-clamp-2 text-sm font-bold sm:text-base">{name}</h2>
      <p className="mt-1 text-xs font-semibold text-[#6b3f0a] sm:text-sm">{role}</p>
    </button>
  );
}
