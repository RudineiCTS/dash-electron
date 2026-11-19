import { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Search } from 'lucide-react'
import {
  getCampaignSummaryDetailsById,
  getCampaignSummaryPerPeriod,
} from '@shared/services/campaign.teleseler'
import { ProgressBar } from '../components/ProgressBar'
import { Stat } from '../components/Stat'
import { EmptyState, ErrorState } from '../components/StateViews'
import { defaultCompetencia, formatCurrency, formatDetailMetric, formatPercent, formatSummaryMetric } from '../lib/format'
import { etiquetaGrupo } from '../lib/grupo'
import { useApiResource } from '../lib/useApiResource'
import NotFoundPage from './NotFoundPage'

const PAGE_SIZE = 30

/**
 * Detalhe de uma campanha (equivale a /campaigns/details/:id do app desktop).
 * Funciona por link direto: o resumo é buscado pela competência da URL, em vez de
 * depender do `location.state` que o app desktop usa.
 *
 * Não inclui o "resumo de vendas" (campaign-resume-sellout), que traz CPF/CNPJ de
 * clientes; avalie com cuidado antes de expor isso na web.
 */
export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>()
  const idCampaign = Number(id)
  const [params] = useSearchParams()
  const competencia = params.get('competencia') ?? defaultCompetencia()
  const [busca, setBusca] = useState('')
  const [limite, setLimite] = useState(PAGE_SIZE)

  const resumos = useApiResource((signal) => getCampaignSummaryPerPeriod(competencia, signal), [competencia])
  const ranking = useApiResource((signal) => getCampaignSummaryDetailsById(idCampaign, signal), [idCampaign])

  const resumo = resumos.data?.find((s) => s.idCampaign === idCampaign)
  const linhas = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return [...(ranking.data ?? [])]
      .filter(
        (r) =>
          !termo ||
          `${r.operatorName} ${etiquetaGrupo(r.personGroup, r.personSubGroup).label}`.toLowerCase().includes(termo),
      )
      // ranking 0/nulo vai para o fim
      .sort((a, b) => (a.ranking || Infinity) - (b.ranking || Infinity))
  }, [ranking.data, busca])

  if (!Number.isInteger(idCampaign) || idCampaign <= 0) return <NotFoundPage />

  const primeira = ranking.data?.[0]
  const titulo = resumo?.campaignDescription ?? primeira?.campaignDescription
  const tipo = resumo?.campaignTypeDescription ?? primeira?.campaignTypeDescription ?? ''
  const batida = (resumo?.percentageAchieved ?? 0) >= 100

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <Link
          to={`/campaigns?competencia=${competencia}`}
          aria-label="Voltar para campanhas"
          className="flex h-8 items-center gap-1 rounded-md border border-github-border bg-github-bg-card px-2.5 text-sm text-github-text-muted hover:bg-github-bg-hover"
        >
          <ArrowLeft size={16} /> Campanhas
        </Link>
        <h1 className="min-w-0 text-lg font-extrabold">
          {titulo ?? (ranking.loading ? 'Carregando…' : `Campanha #${idCampaign}`)}
        </h1>
        <span className="text-xs text-github-text-muted">
          #{idCampaign}
          {tipo && ` · ${tipo}`}
        </span>
      </div>

      {resumo && (
        <section
          className="mx-auto flex w-full max-w-2xl flex-col gap-2 rounded-xl border border-github-border bg-github-bg-card p-3"
          aria-label="Resumo da campanha"
        >
          <div className="flex items-center gap-2">
            <ProgressBar percent={resumo.percentageAchieved} achieved={batida} />
            <span className={`shrink-0 text-sm font-semibold ${batida ? 'text-other-greenflag' : ''}`}>
              {formatPercent(resumo.percentageAchieved)}
            </span>
          </div>
          <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-center sm:grid-cols-4">
            <Stat label="Meta" value={formatSummaryMetric(resumo.campaignTypeDescription, resumo.goalValue)} />
            <Stat label="Realizado" value={formatSummaryMetric(resumo.campaignTypeDescription, resumo.assessedValue)} />
            <Stat label="Premiação" value={formatCurrency(resumo.totalAward)} />
            <Stat label="Pote" value={formatCurrency(resumo.totalPot)} />
          </dl>
        </section>
      )}

      <section aria-label="Ranking" className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold">
            Ranking
            {ranking.data && (
              <span className="ml-2 text-xs font-normal text-github-text-muted">{linhas.length} pessoas</span>
            )}
          </h2>
          <label className="relative block w-full sm:w-72">
            <span className="sr-only">Buscar por nome</span>
            <Search size={16} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-github-text-muted" />
            <input
              type="search"
              value={busca}
              onChange={(e) => {
                setBusca(e.target.value)
                setLimite(PAGE_SIZE)
              }}
              placeholder="Buscar operador ou grupo"
              className="h-9 w-full rounded-md border border-github-border bg-github-bg-card pl-8 pr-3 text-sm text-github-text placeholder:text-github-text-muted"
            />
          </label>
        </div>

        {ranking.loading && (
          <div className="flex flex-col gap-1.5" aria-busy="true" aria-label="Carregando ranking">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-11 animate-pulse rounded-lg border border-github-border bg-github-bg-card" />
            ))}
          </div>
        )}
        {ranking.error && <ErrorState message={ranking.error} onRetry={ranking.reload} />}

        {ranking.data && !ranking.error &&
          (linhas.length === 0 ? (
            <EmptyState message={busca ? 'Ninguém encontrado para essa busca.' : 'Sem resultados apurados para esta campanha.'} />
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border border-github-border bg-github-bg-card">
                <table className="w-full text-left text-sm">
                  <thead className="bg-github-bg-hover text-[10px] uppercase tracking-wide text-github-text-muted">
                    <tr>
                      <th className="w-10 py-2 pl-3 font-medium">#</th>
                      <th className="px-2 py-2 font-medium">Operador</th>
                      <th className="hidden w-48 px-2 py-2 font-medium md:table-cell">Atingimento</th>
                      <th className="hidden whitespace-nowrap px-2 py-2 text-right font-medium sm:table-cell">Meta</th>
                      <th className="whitespace-nowrap px-2 py-2 text-right font-medium">Realizado</th>
                      <th className="whitespace-nowrap py-2 pl-2 pr-3 text-right font-medium">Prêmio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {linhas.slice(0, limite).map((r) => {
                      const bateu = r.percentageAchieved >= 100
                      return (
                        <tr key={r.idPersonSales} className="border-t border-github-border hover:bg-github-bg-hover">
                          <td className="py-1.5 pl-3 text-xs font-bold text-github-text-muted">{r.ranking || '–'}</td>
                          <td className="max-w-[16rem] px-2 py-1.5">
                            <p className="truncate font-semibold">{r.operatorName}</p>
                            {(() => {
                              const g = etiquetaGrupo(r.personGroup, r.personSubGroup)
                              return (
                                <span className={`mt-0.5 inline-block rounded px-1.5 text-[11px] font-medium ${g.classe}`}>
                                  {g.label}
                                </span>
                              )
                            })()}
                          </td>
                          <td className="hidden px-2 py-1.5 md:table-cell">
                            <div className="flex items-center gap-2">
                              <ProgressBar percent={r.percentageAchieved} achieved={bateu} />
                              <span
                                className={`w-14 shrink-0 text-right text-xs font-semibold ${bateu ? 'text-other-greenflag' : ''}`}
                              >
                                {formatPercent(r.percentageAchieved)}
                              </span>
                            </div>
                          </td>
                          <td className="hidden whitespace-nowrap px-2 py-1.5 text-right sm:table-cell">
                            {formatDetailMetric(r.campaignTypeDescription, r.individualTarget)}
                          </td>
                          <td className="whitespace-nowrap px-2 py-1.5 text-right">
                            {formatDetailMetric(r.campaignTypeDescription, r.assessedValue)}
                          </td>
                          <td className="whitespace-nowrap py-1.5 pl-2 pr-3 text-right font-semibold">
                            {formatCurrency(r.award)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {linhas.length > limite && (
                <button
                  type="button"
                  onClick={() => setLimite((n) => n + PAGE_SIZE)}
                  className="h-9 rounded-md border border-github-border bg-github-bg-card text-sm font-medium"
                >
                  Mostrar mais ({linhas.length - limite})
                </button>
              )}
            </>
          ))}
      </section>
    </div>
  )
}
