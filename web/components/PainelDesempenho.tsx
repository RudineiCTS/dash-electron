import { CheckCircle2, Target, Trophy } from 'lucide-react'
import type { Desempenho } from '../lib/desempenho'
import { formatCurrency, formatDetailMetric, formatPercent } from '../lib/format'
import { statusDoCard } from '../lib/status'
import { ProgressBar } from './ProgressBar'
import { Stat } from './Stat'

interface PainelDesempenhoProps {
  desempenho: Desempenho
  /** Enquanto resumo/ranking ainda carregam, mostra um esqueleto em vez de piscar o painel. */
  carregando?: boolean
}

const cartao = 'rounded-xl border border-github-border bg-github-bg-card p-3'

/**
 * "Meu desempenho": ajuda o digitador a bater a meta e subir no ranking.
 * Cada bloco só aparece se houver dado; sem nenhum, o painel inteiro some.
 * Mostra apenas a posição do próprio usuário: nunca nome nem valores de colegas.
 */
export function PainelDesempenho({ desempenho, carregando }: PainelDesempenhoProps) {
  const { meta, posicao } = desempenho

  if (carregando) {
    return <div className="h-40 animate-pulse rounded-xl border border-github-border bg-github-bg-card" aria-busy="true" />
  }
  if (!meta && !posicao) return null

  const status = meta ? statusDoCard(meta.percentual, true) : null

  return (
    <section aria-label="Meu desempenho" className="flex flex-col gap-3">
      {meta && status && (
        <div className={cartao}>
          <h2 className="flex items-center gap-1.5 text-sm font-semibold">
            <Target size={15} className="text-github-text-muted" aria-hidden />
            {meta.origem === 'individual' ? 'Sua meta' : 'Meta da campanha (equipe)'}
          </h2>
          {meta.origem === 'equipe' && (
            <p className="mt-0.5 text-xs text-github-text-muted">
              Você não tem meta individual: a meta é do time, e cada pedido seu ajuda a bater.
            </p>
          )}

          <div className="mt-2 flex items-center gap-2">
            <ProgressBar percent={meta.percentual} colorClass={status.barra} />
            <span className={`shrink-0 text-xs font-semibold ${status.texto}`}>{formatPercent(meta.percentual)}</span>
          </div>

          <dl className="mt-2 grid grid-cols-3 gap-x-2">
            <Stat label="Meta" value={formatDetailMetric(meta.tipoCampanha, meta.meta)} />
            <Stat label="Realizado" value={formatDetailMetric(meta.tipoCampanha, meta.realizado)} />
            <Stat label="Falta" value={meta.batida ? '—' : formatDetailMetric(meta.tipoCampanha, meta.falta)} />
          </dl>

          <div className="mt-2 border-t border-github-border pt-2 text-sm">
            {meta.batida ? (
              <p className="flex items-center gap-1.5 font-semibold text-[#3B6D11]">
                <CheckCircle2 size={16} aria-hidden /> Meta batida
              </p>
            ) : meta.encerrada ? (
              <p className="text-github-text-muted">Campanha encerrada.</p>
            ) : meta.diasUteis === null ? null : meta.diasUteis === 0 ? (
              <p className="text-github-text-muted">Sem dias úteis restantes.</p>
            ) : (
              <p>
                <strong className="font-semibold">
                  {meta.diasUteis} {meta.diasUteis === 1 ? 'dia útil' : 'dias úteis'}
                </strong>{' '}
                restantes
                {meta.porDiaUtil !== null && (
                  <>
                    {' · '}
                    <span className="text-github-text-muted">para bater, cerca de </span>
                    <strong className="font-semibold">{formatDetailMetric(meta.tipoCampanha, meta.porDiaUtil)}</strong>
                    <span className="text-github-text-muted"> por dia útil</span>
                  </>
                )}
              </p>
            )}
          </div>
        </div>
      )}

      {posicao && (
        <div className={cartao}>
          <h2 className="flex items-center gap-1.5 text-sm font-semibold">
            <Trophy size={15} className="text-github-text-muted" aria-hidden />
            Minha posição
          </h2>
          <p className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold">{posicao.posicao}º</span>
            <span className="text-sm text-github-text-muted">de {posicao.de}</span>
          </p>
          <dl className="mt-2 border-t border-github-border pt-2">
            <Stat label="Prêmio apurado" value={formatCurrency(posicao.premio)} />
          </dl>
        </div>
      )}
    </section>
  )
}
