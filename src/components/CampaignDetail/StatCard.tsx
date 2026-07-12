interface StatCardProps {
  label: string;
  value: string;
  highlight?: boolean;
}

export function StatCard({ label, value, highlight = false }: StatCardProps) {
  return (
    <div className="flex flex-col gap-2 bg-[#10171f] border border-white/[0.07] rounded-[9px] p-4 flex-1">
      <span className="text-[10px] font-medium tracking-widest text-white/40 uppercase">
        {label}
      </span>
      <span className={`text-2xl font-semibold ${highlight ? "text-[#3fb950]" : "text-white"}`}>
        {value}
      </span>
    </div>
  );
}
