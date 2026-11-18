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
      .filter((r) => !termo || `${r.operatorName} ${r.supervisorName}`.toLowerCase().includes(termo))
      // ranking 0/nulo vai para o fim
      .sort((a, b) => (a.ranking || Infinity) - (b.ranking || Infinity))
  }, [ranking.data, busca])

  if (!Number.isInteger(idCampaign) || idCampaign <= 0) return <NotFoundPage />

  const primeira = ranking.data?.[0]
  const titulo = resumo?.campaignDescription ?? primeira?.campaignDescription
  const tipo = resumo?.campaignTypeDescription ?? primeira?.campaignTypeDescription ?? ''
  const batida = (resumo?.percentageAchieved ?? 0) >= 100

  return (
    <div className="flex flex-col gap-4">
      <Link
        to={`/campaigns?competencia=${competencia}`}
        className="-ml-2 flex h-11 w-fit items-center gap-2 rounded-lg px-2 text-sm text-github-text-muted active:bg-github-bg-hover"
      >
        <ArrowLeft size={18} /> Campanhas
      </Link>

      <header>
        <p className="text-xs text-github-text-muted">
          #{idCampaign}
          {tipo && ` · ${tipo}`}
        </p>
        <h1 className="text-xl font-extrabold">{titulo ?? (ranking.loading ? 'Carregando…' : `Campanha #${idCampaign}`)}</h1>
      </header>

      {resumo && (
        <section className="rounded-xl border border-github-border bg-github-bg-card p-4" aria-label="Resumo da campanha">
          <div className="flex items-center gap-3">
            <ProgressBar percent={resumo.percentageAchieved} achieved={batida} />
            <span className={`shrink-0 text-sm font-semibold ${batida ? 'text-other-greenflag' : ''}`}>
              {formatPercent(resumo.percentageAchieved)}
            </span>
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-4">
            <Stat label="Meta" value={formatSummaryMetric(resumo.campaignTypeDescription, resumo.goalValue)} />
            <Stat label="Realizado" value={formatSummaryMetric(resumo.campaignTypeDescription, resumo.assessedValue)} />
            <Stat label="Premiação" value={formatCurrency(resumo.totalAward)} />
            <Stat label="Pote" value={formatCurrency(resumo.totalPot)} />
          </dl>
        </section>
      )}

      <section aria-label="Ranking" className="flex flex-col gap-3">
        <h2 className="text-base font-semibold">Ranking</h2>

        <label className="relative block">
          <span className="sr-only">Buscar por nome</span>
          <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-github-text-muted" />
          <input
            type="search"
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value)
              setLimite(PAGE_SIZE)
            }}
            placeholder="Buscar operador ou supervisor"
            className="h-11 w-full rounded-lg border border-github-border bg-github-bg-card pl-10 pr-3 text-base text-github-text placeholder:text-github-text-muted"
          />
        </label>

        {ranking.loading && (
          <div className="flex flex-col gap-3" aria-busy="true" aria-label="Carregando ranking">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl border border-github-border bg-github-bg-card" />
            ))}
          </div>
        )}
        {ranking.error && <ErrorState message={ranking.error} onRetry={ranking.reload} />}

        {ranking.data && !ranking.error &&
          (linhas.length === 0 ? (
            <EmptyState message={busca ? 'Ninguém encontrado para essa busca.' : 'Sem resultados apurados para esta campanha.'} />
          ) : (
            <>
              <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {linhas.slice(0, limite).map((r) => {
                  const bateu = r.percentageAchieved >= 100
                  return (
                    <li key={r.idPersonSales} className="rounded-xl border border-github-border bg-github-bg-card p-4">
                      <div className="flex items-start gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-github-bg-hover text-xs font-bold">
                          {r.ranking || '–'}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{r.operatorName}</p>
                          <p className="truncate text-xs text-github-text-muted">{r.supervisorName}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-3">
                        <ProgressBar percent={r.percentageAchieved} achieved={bateu} />
                        <span className={`shrink-0 text-xs font-semibold ${bateu ? 'text-other-greenflag' : ''}`}>
                          {formatPercent(r.percentageAchieved)}
                        </span>
                      </div>
                      <dl className="mt-3 grid grid-cols-3 gap-2">
                        <Stat label="Meta" value={formatDetailMetric(r.campaignTypeDescription, r.individualTarget)} />
                        <Stat label="Realizado" value={formatDetailMetric(r.campaignTypeDescription, r.assessedValue)} />
                        <Stat label="Prêmio" value={formatCurrency(r.award)} />
                      </dl>
                    </li>
                  )
                })}
              </ul>

              {linhas.length > limite && (
                <button
                  type="button"
                  onClick={() => setLimite((n) => n + PAGE_SIZE)}
                  className="h-11 rounded-lg border border-github-border bg-github-bg-card text-sm font-medium"
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
