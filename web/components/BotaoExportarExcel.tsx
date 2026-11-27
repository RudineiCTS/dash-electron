import { Download } from 'lucide-react'

/** Botão "Exportar Excel (N)" no mesmo estilo dos que já existem nas telas de cliente. */
export function BotaoExportarExcel({ total, onClick, className = '' }: { total: number; onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={total === 0}
      className={`flex h-9 items-center gap-1.5 rounded-md border border-github-border bg-github-bg-card px-3 text-sm font-medium hover:bg-github-bg-hover disabled:opacity-50 ${className}`}
    >
      <Download size={15} aria-hidden /> Exportar Excel ({total.toLocaleString('pt-BR')})
    </button>
  )
}
