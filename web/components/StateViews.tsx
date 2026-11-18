import { AlertCircle, Inbox } from 'lucide-react'

export function CardListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Carregando">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-40 animate-pulse rounded-xl border border-github-border bg-github-bg-card" />
      ))}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 rounded-xl border border-github-border bg-github-bg-card px-4 py-10 text-center">
      <AlertCircle className="text-other-redflag" size={28} />
      <p className="text-sm text-github-text">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="h-11 rounded-lg bg-github-btn-green px-5 text-sm font-medium text-white active:opacity-80"
        >
          Tentar de novo
        </button>
      )}
    </div>
  )
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-github-border px-4 py-10 text-center">
      <Inbox className="text-github-text-muted" size={28} />
      <p className="text-sm text-github-text-muted">{message}</p>
    </div>
  )
}
