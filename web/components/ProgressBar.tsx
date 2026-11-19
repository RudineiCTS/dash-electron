interface ProgressBarProps {
  /** Percentual atingido (0–100+). Valores fora da faixa são limitados só na barra. */
  percent: number
  achieved?: boolean
  /** Classe de cor do preenchimento (ex: "bg-[#E24B4A]"). Se omitida, usa verde/laranja por `achieved`. */
  colorClass?: string
}

export function ProgressBar({ percent, achieved, colorClass }: ProgressBarProps) {
  const width = Math.min(Math.max(percent || 0, 0), 100)
  const cor = colorClass ?? (achieved ? 'bg-other-greenflag' : 'bg-github-btn-green')
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(width)}
      className="h-2 w-full overflow-hidden rounded-full bg-github-bg-hover"
    >
      <div className={`h-full rounded-full transition-[width] ${cor}`} style={{ width: `${width}%` }} />
    </div>
  )
}
