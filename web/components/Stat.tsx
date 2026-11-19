interface StatProps {
  label: string
  value: string | number
  className?: string
}

/** Rótulo + valor em coluna. `min-w-0`/`break-words` evitam estourar em telas de 320px. */
export function Stat({ label, value, className = '' }: StatProps) {
  return (
    <div className={`min-w-0 ${className}`}>
      <dt className="text-[10px] font-medium uppercase tracking-wide text-github-text-muted">{label}</dt>
      <dd className="whitespace-nowrap text-[13px] font-semibold text-github-text">{value}</dd>
    </div>
  )
}
