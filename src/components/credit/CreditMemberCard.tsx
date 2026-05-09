type CreditMemberCardProps = {
  name: string;
  role: string;
  onClick: () => void;
};

export default function CreditMemberCard({ name, role, onClick }: CreditMemberCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl border-2 border-orange-100/90 bg-gradient-to-b from-orange-300 via-orange-400 to-orange-600 p-3 text-left text-amber-950 shadow-[0_10px_0_rgba(138,64,13,0.45),0_16px_28px_rgba(0,0,0,0.3)] transition duration-300 [transform:perspective(900px)_rotateX(0deg)_rotateY(0deg)] hover:shadow-[0_14px_0_rgba(138,64,13,0.38),0_24px_34px_rgba(0,0,0,0.35)] hover:[transform:perspective(900px)_rotateX(2deg)_rotateY(-4deg)_translateY(-6px)] sm:p-4"
    >
      <div className="pointer-events-none absolute inset-x-3 top-2 h-10 rounded-full bg-white/35 blur-md transition group-hover:bg-white/50" />
      <div className="mb-3 aspect-square w-full rounded-xl border-2 border-dashed border-orange-50/90 bg-orange-50/45" />
      <h2 className="line-clamp-2 text-sm font-bold sm:text-base">{name}</h2>
      <p className="mt-1 text-xs font-semibold text-amber-900 sm:text-sm">{role}</p>
    </button>
  );
}
