import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import type { CampaignSummary } from '@shared/interfaces/CampaignSummary'
import { formatCurrency, formatPercent, formatSummaryMetric } from '../lib/format'
import { ProgressBar } from './ProgressBar'
import { Stat } from './Stat'

interface CampaignCardProps {
  campaign: CampaignSummary
  /** Competência (YYYY-MM-DD) para o link de detalhe manter o mesmo mês. */
  competencia: string
}

export function CampaignCard({ campaign: c, competencia }: CampaignCardProps) {
  const achieved = c.percentageAchieved >= 100

  return (
    <Link
      to={`/campaigns/details/${c.idCampaign}?competencia=${competencia}`}
      className="block rounded-xl border border-github-border bg-github-bg-card p-4 transition-colors active:bg-github-bg-hover"
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

      <div className="mt-3 flex items-center gap-3">
        <ProgressBar percent={c.percentageAchieved} achieved={achieved} />
        <span className={`shrink-0 text-xs font-semibold ${achieved ? 'text-other-greenflag' : 'text-github-text'}`}>
          {formatPercent(c.percentageAchieved)}
        </span>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-3">
        <Stat label="Meta" value={formatSummaryMetric(c.campaignTypeDescription, c.goalValue)} />
        <Stat label="Realizado" value={formatSummaryMetric(c.campaignTypeDescription, c.assessedValue)} />
        <Stat label="Premiação" value={formatCurrency(c.totalAward)} className="col-span-2 sm:col-span-1" />
      </dl>
    </Link>
  )
}
