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
      className="rounded-2xl border-2 border-green-500 bg-yellow-300 p-3 text-left text-green-950 transition duration-200 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(0,0,0,0.35)] sm:p-4"
    >
      <div className="mb-3 aspect-square w-full rounded-xl border-2 border-dashed border-green-600 bg-green-100/70" />
      <h2 className="line-clamp-2 text-sm font-bold sm:text-base">{name}</h2>
      <p className="mt-1 text-xs font-medium sm:text-sm">{role}</p>
    </button>
  );
}
