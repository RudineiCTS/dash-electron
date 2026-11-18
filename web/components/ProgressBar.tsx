interface ProgressBarProps {
  /** Percentual atingido (0–100+). Valores fora da faixa são limitados só na barra. */
  percent: number
  achieved?: boolean
}

export function ProgressBar({ percent, achieved }: ProgressBarProps) {
  const width = Math.min(Math.max(percent || 0, 0), 100)
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(width)}
      className="h-2 w-full overflow-hidden rounded-full bg-github-bg-hover"
    >
      <div
        className={`h-full rounded-full transition-[width] ${achieved ? 'bg-other-greenflag' : 'bg-github-btn-green'}`}
        style={{ width: `${width}%` }}
      />
    </div>
  )
}
