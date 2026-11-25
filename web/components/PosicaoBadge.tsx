import { Trophy } from 'lucide-react'
import type { PosicaoCampanha } from '../lib/posicoes'

interface PosicaoBadgeProps {
  posicao: PosicaoCampanha
  className?: string
}

/** Selo "1º de 11" com a posição do usuário logado no ranking da campanha (1º lugar em destaque dourado). */
export function PosicaoBadge({ posicao, className = '' }: PosicaoBadgeProps) {
  const primeiro = posicao.ranking === 1

  return (
    <span
      title={`Você está em ${posicao.ranking}º lugar de ${posicao.participants} neste ranking`}
      aria-label={`Sua posição no ranking: ${posicao.ranking}º de ${posicao.participants}`}
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium ${
        primeiro
          ? 'border-[#EF9F27] bg-[#EF9F27]/15 text-github-text'
          : 'border-github-border bg-github-bg-hover text-github-text-muted'
      } ${className}`}
    >
      <Trophy size={12} className={primeiro ? 'text-[#BA7517]' : undefined} aria-hidden />
      {posicao.ranking}º de {posicao.participants}
    </span>
  )
}
