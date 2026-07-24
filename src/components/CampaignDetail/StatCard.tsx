interface StatCardProps {
  label: string;
  value: string;
  highlight?: boolean;
}

export function StatCard({ label, value, highlight = false }: StatCardProps) {
  return (
    <div className="flex flex-col gap-2 bg-other-card border border-other-border rounded-[9px] p-4 flex-1">
      <span className="text-[10px] font-medium tracking-widest text-[var(--text-faint)] uppercase">
        {label}
      </span>
      <span className={`text-2xl font-semibold ${highlight ? "text-[var(--accent)]" : "text-github-text"}`}>
        {value}
      </span>
    </div>
  );
}
