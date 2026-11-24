import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import type { CampaignSummary } from '@shared/interfaces/CampaignSummary'
import { formatCurrency, formatPercent, formatSummaryMetric } from '../lib/format'
import {  temMeta } from '../lib/status'
import { ProgressBar } from './ProgressBar'
import { Stat } from './Stat'

interface CampaignCardProps {
  campaign: CampaignSummary
  /** Competência (YYYY-MM-DD) para o link de detalhe manter o mesmo mês. */
  competencia: string
}

/**
 * Cor por status: verde = bateu a meta (>= 100%), laranja = em andamento (50% a 99%),
 * vermelho = abaixo de 50%. Usada na faixa lateral, na barra e no percentual.
 */
function statusDoCard(percent: number, comMeta: boolean) {
  if (!comMeta) return { faixa: 'border-l-[#888780]', barra: 'bg-[#888780]', texto: 'text-github-text-muted' }
  if (percent >= 100) return { faixa: 'border-l-[#3B6D11]', barra: 'bg-[#3B6D11]', texto: 'text-[#3B6D11]' }
  if (percent >= 50) return { faixa: 'border-l-[#EF9F27]', barra: 'bg-[#EF9F27]', texto: 'text-github-text' }
  return { faixa: 'border-l-[#E24B4A]', barra: 'bg-[#E24B4A]', texto: 'text-[#E24B4A]' }
}

export function CampaignCard({ campaign: c, competencia }: CampaignCardProps) {
  const comMeta = temMeta(c)
  const status = statusDoCard(c.percentageAchieved, comMeta)

  return (
    <Link
      to={`/campaigns/details/${c.idCampaign}?competencia=${competencia}`}
      className={`block rounded-xl border border-l-4 border-github-border bg-github-bg-card p-3 transition-colors hover:bg-github-bg-hover active:bg-github-bg-hover ${status.faixa}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-github-text-muted">
            #{c.idCampaign} · {c.campaignTypeDescription}
          </p>
          <h2 className="mt-0.5 line-clamp-2 text-base font-semibold text-github-text">{c.campaignDescription}</h2>
        </div>
        <ChevronRight size={20} className="mt-1 shrink-0 text-github-text-muted" aria-hidden />
      </div>

      <div className="mt-2 flex items-center gap-2">
        <ProgressBar percent={comMeta ? c.percentageAchieved : 0} colorClass={status.barra} />
        <span className={`shrink-0 text-xs font-semibold ${status.texto}`}>
          {comMeta ? formatPercent(c.percentageAchieved) : 'Sem meta'}
        </span>
      </div>

      <dl className="mt-2 grid grid-cols-3 gap-x-2">
        <Stat label="Meta" value={formatSummaryMetric(c.campaignTypeDescription, c.goalValue)} />
        <Stat label="Realizado" value={formatSummaryMetric(c.campaignTypeDescription, c.assessedValue)} />
        <Stat label="Premiação" value={formatCurrency(c.totalAward)} />
      </dl>
    </Link>
  )
}
