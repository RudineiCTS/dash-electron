import { Link, useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import type { CampaignSummary } from '@shared/interfaces/CampaignSummary'
import { formatCurrency, formatPercent, formatSummaryMetric } from '../lib/format'
import type { PosicaoCampanha } from '../lib/posicoes'
import { statusDoCard, temMeta } from '../lib/status'
import type { VisibilidadeCampanha } from '../lib/visibilidade'
import { AvisoOcultoAdmin } from './AvisoOcultoAdmin'
import { PosicaoBadge } from './PosicaoBadge'
import { ProgressBar } from './ProgressBar'
import { ValorOculto } from './ValorOculto'

interface CampaignTableProps {
  campanhas: CampaignSummary[]
  /** Competência (YYYY-MM-DD) para o link de detalhe manter o mesmo mês. */
  competencia: string
  /** Minhas posições por campanha (só as que têm ranking). */
  posicoes: ReadonlyMap<number, PosicaoCampanha>
  /** Só para o administrador: o que de cada campanha está escondido dos usuários comuns. */
  regrasOcultas?: ReadonlyMap<number, VisibilidadeCampanha>
}

/**
 * Visão em lista das campanhas: uma linha por campanha, com as mesmas cores de status dos cards.
 * Mobile first: no celular só Campanha, Realizado e percentual; Meta, barra de progresso e Premiação entram
 * conforme a tela cresce. A linha inteira é clicável; o link do nome dá o foco/teclado.
 */
export function CampaignTable({ campanhas, competencia, posicoes, regrasOcultas }: CampaignTableProps) {
  const navigate = useNavigate()

  return (
    <div className="overflow-x-auto rounded-xl border border-github-border bg-github-bg-card">
      <table className="w-full text-left text-xs sm:text-sm">
        <caption className="sr-only">Campanhas rodando</caption>
        <thead className="bg-github-bg-hover text-[10px] uppercase tracking-tight text-github-text-muted sm:tracking-wide">
          <tr>
            <th className="py-2 pl-3 font-medium">Campanha</th>
            <th className="hidden whitespace-nowrap px-2 py-2 text-right font-medium sm:table-cell">Meta</th>
            <th className="whitespace-nowrap px-2 py-2 text-right font-medium">Realizado</th>
            <th className="px-2 py-2 text-right font-medium sm:text-left">Atingimento</th>
            <th className="hidden whitespace-nowrap px-2 py-2 text-right font-medium md:table-cell">Premiação</th>
            <th className="w-5 py-2 pr-1.5 sm:w-7 sm:pr-2" aria-hidden />
          </tr>
        </thead>
        <tbody>
          {campanhas.map((c) => {
            const apuradoOculto = !!c.assessedHidden
            const premioOculto = !!c.prizeHidden
            const comMeta = temMeta(c) && !apuradoOculto
            const percentual = c.percentageAchieved ?? 0
            const status = statusDoCard(percentual, comMeta)
            const destino = `/campaigns/details/${c.idCampaign}?competencia=${competencia}`
            const posicao = posicoes.get(c.idCampaign)
            const regraOculta = regrasOcultas?.get(c.idCampaign)

            return (
              <tr
                key={c.idCampaign}
                // clique em qualquer parte da linha abre a campanha; o clique no link já navega sozinho
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest('a')) return
                  navigate(destino)
                }}
                className="cursor-pointer border-t border-github-border hover:bg-github-bg-hover"
              >
                <td className={`min-w-[8.5rem] border-l-4 py-2 pl-2.5 pr-2 ${status.faixa}`}>
                  <Link to={destino} className="block">
                    <span className="block text-[11px] text-github-text-muted">
                      #{c.idCampaign} · {c.campaignTypeDescription}
                    </span>
                    <span className="line-clamp-2 block font-semibold text-github-text">{c.campaignDescription}</span>
                  </Link>
                  {posicao && <PosicaoBadge posicao={posicao} className="mt-1" />}
                  {regraOculta && <AvisoOcultoAdmin regra={regraOculta} className="mt-1" />}
                </td>
                <td className="hidden whitespace-nowrap px-2 py-2 text-right sm:table-cell">
                  {formatSummaryMetric(c.campaignTypeDescription, c.goalValue)}
                </td>
                <td className="whitespace-nowrap px-2 py-2 text-right font-medium">
                  {apuradoOculto ? <ValorOculto /> : formatSummaryMetric(c.campaignTypeDescription, c.assessedValue)}
                </td>
                <td className="px-2 py-2">
                  <div className="flex items-center justify-end gap-2 sm:justify-start">
                    <div className="hidden w-16 shrink-0 sm:block lg:w-24">
                      <ProgressBar percent={comMeta ? percentual : 0} colorClass={status.barra} />
                    </div>
                    <span className={`whitespace-nowrap font-semibold ${status.texto}`}>
                      {apuradoOculto ? <ValorOculto /> : comMeta ? formatPercent(percentual) : 'Sem meta'}
                    </span>
                  </div>
                </td>
                <td className="hidden whitespace-nowrap px-2 py-2 text-right md:table-cell">
                  {premioOculto ? <ValorOculto /> : formatCurrency(c.totalAward)}
                </td>
                <td className="py-2 pr-1.5 text-github-text-muted sm:pr-2">
                  <ChevronRight size={16} aria-hidden />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
