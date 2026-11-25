import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import type { CampaignSummary } from '@shared/interfaces/CampaignSummary'
import { formatCurrency, formatPercent, formatSummaryMetric } from '../lib/format'
import type { PosicaoCampanha } from '../lib/posicoes'
import { statusDoCard, temMeta } from '../lib/status'
import type { VisibilidadeCampanha } from '../lib/visibilidade'
import { AvisoOcultoAdmin } from './AvisoOcultoAdmin'
import { PosicaoBadge } from './PosicaoBadge'
import { ProgressBar } from './ProgressBar'
import { Stat } from './Stat'
import { ValorOculto } from './ValorOculto'

interface CampaignCardProps {
  campaign: CampaignSummary
  /** Competência (YYYY-MM-DD) para o link de detalhe manter o mesmo mês. */
  competencia: string
  /** Posição do usuário logado no ranking desta campanha; sem ela (campanha sem ranking) não há selo. */
  posicao?: PosicaoCampanha
  /** Só para o administrador: o que desta campanha está escondido dos usuários comuns. */
  regraOculta?: VisibilidadeCampanha
}

export function CampaignCard({ campaign: c, competencia, posicao, regraOculta }: CampaignCardProps) {
  // Escondidos pelo administrador (usuário comum): os valores chegam null e não entram em nenhuma conta
  const apuradoOculto = !!c.assessedHidden
  const premioOculto = !!c.prizeHidden
  const comMeta = temMeta(c) && !apuradoOculto
  const percentual = c.percentageAchieved ?? 0
  const status = statusDoCard(percentual, comMeta)

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
        <div className="mt-0.5 flex shrink-0 items-center gap-1.5">
          {posicao && <PosicaoBadge posicao={posicao} />}
          <ChevronRight size={20} className="text-github-text-muted" aria-hidden />
        </div>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <ProgressBar percent={comMeta ? percentual : 0} colorClass={status.barra} />
        <span className={`shrink-0 text-xs font-semibold ${status.texto}`}>
          {apuradoOculto ? <ValorOculto /> : comMeta ? formatPercent(percentual) : 'Sem meta'}
        </span>
      </div>

      <dl className="mt-2 grid grid-cols-3 gap-x-2">
        <Stat label="Meta" value={formatSummaryMetric(c.campaignTypeDescription, c.goalValue)} />
        <Stat
          label="Realizado"
          value={apuradoOculto ? <ValorOculto /> : formatSummaryMetric(c.campaignTypeDescription, c.assessedValue)}
        />
        <Stat label="Premiação" value={premioOculto ? <ValorOculto /> : formatCurrency(c.totalAward)} />
      </dl>

      {regraOculta && <AvisoOcultoAdmin regra={regraOculta} className="mt-2" />}
    </Link>
  )
}
