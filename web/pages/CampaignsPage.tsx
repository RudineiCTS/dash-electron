import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getCampaignSummaryPerPeriod } from '@shared/services/campaign.teleseler'
import { CampaignCard } from '../components/CampaignCard'
import { CardListSkeleton, EmptyState, ErrorState } from '../components/StateViews'
import { Stat } from '../components/Stat'
import { defaultCompetencia, formatCurrency, monthToCompetencia } from '../lib/format'
import { useApiResource } from '../lib/useApiResource'

type Aba = 'valor' | 'pontos'

const ABAS: { id: Aba; label: string }[] = [
  { id: 'valor', label: 'Valor' },
  { id: 'pontos', label: 'Pontos' },
]

/**
 * "Campanhas Rodando" (equivale a /campaigns do app desktop).
 * Filtros vivem na URL (?competencia=&aba=&tipo=&bateram=1): dá para compartilhar
 * o link e o botão "voltar" do celular restaura o estado.
 */
export default function CampaignsPage() {
  const [params, setParams] = useSearchParams()
  const competencia = params.get('competencia') ?? defaultCompetencia()
  const aba: Aba = params.get('aba') === 'pontos' ? 'pontos' : 'valor'
  const tipo = params.get('tipo') ?? ''
  const somenteBateram = params.get('bateram') === '1'

  function updateParams(changes: Record<string, string | null>) {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        for (const [key, value] of Object.entries(changes)) {
          if (value) next.set(key, value)
          else next.delete(key)
        }
        return next
      },
      { replace: true },
    )
  }

  const { data, loading, error, reload } = useApiResource(
    (signal) => getCampaignSummaryPerPeriod(competencia, signal),
    [competencia],
  )

  const daAba = useMemo(() => (data ?? []).filter((c) => c.typeCampaign === aba), [data, aba])
  const tipos = useMemo(() => [...new Set(daAba.map((c) => c.campaignTypeDescription))].sort(), [daAba])
  const visiveis = useMemo(
    () =>
      daAba
        .filter((c) => !tipo || c.campaignTypeDescription === tipo)
        .filter((c) => !somenteBateram || c.percentageAchieved >= 100),
    [daAba, tipo, somenteBateram],
  )
  const premiacaoTotal = visiveis.reduce((acc, c) => acc + c.totalAward, 0)

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xs font-medium tracking-[0.2em] text-github-btn-green-hover">APURAÇÃO</p>
        <h1 className="text-xl font-extrabold">Campanhas Rodando</h1>
      </div>

      {/* Filtros: empilhados no mobile, em linha a partir de sm */}
      <section aria-label="Filtros" className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex flex-col gap-1 text-xs font-medium text-github-text-muted sm:w-60">
          Competência
          <input
            type="month"
            value={competencia.slice(0, 7)}
            onChange={(e) => {
              const next = monthToCompetencia(e.target.value)
              if (next) updateParams({ competencia: next })
            }}
            className="h-11 rounded-lg border border-github-border bg-github-bg-card px-3 text-base text-github-text"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs font-medium text-github-text-muted sm:w-56">
          Tipo de campanha
          <select
            value={tipo}
            onChange={(e) => updateParams({ tipo: e.target.value || null })}
            className="h-11 rounded-lg border border-github-border bg-github-bg-card px-3 text-base text-github-text"
          >
            <option value="">Todos</option>
            {tipos.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          aria-pressed={somenteBateram}
          onClick={() => updateParams({ bateram: somenteBateram ? null : '1' })}
          className={`h-11 rounded-lg border px-4 text-sm font-medium ${
            somenteBateram
              ? 'border-github-btn-green bg-github-btn-green text-white'
              : 'border-github-border bg-github-bg-card text-github-text-muted'
          }`}
        >
          Somente bateram
        </button>
      </section>

      {/* Abas Valor / Pontos (segmented control com alvo de toque de 44px) */}
      <div role="tablist" aria-label="Tipo de apuração" className="grid grid-cols-2 gap-1 rounded-xl bg-github-bg-hover p-1 sm:w-64">
        {ABAS.map((a) => (
          <button
            key={a.id}
            role="tab"
            type="button"
            aria-selected={aba === a.id}
            onClick={() => updateParams({ aba: a.id === 'valor' ? null : a.id, tipo: null })}
            className={`h-10 rounded-lg text-sm font-medium ${
              aba === a.id ? 'bg-github-bg-card text-github-text shadow-sm' : 'text-github-text-muted'
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>

      {loading && <CardListSkeleton />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {data && !error && (
        <>
          <dl className="grid grid-cols-2 gap-3 rounded-xl border border-github-border bg-github-bg-card p-4">
            <Stat label="Campanhas" value={visiveis.length} />
            <Stat label="Premiação total" value={formatCurrency(premiacaoTotal)} />
          </dl>

          {visiveis.length === 0 ? (
            <EmptyState message="Nenhuma campanha encontrada para esses filtros." />
          ) : (
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {visiveis.map((c) => (
                <li key={c.idCampaign}>
                  <CampaignCard campaign={c} competencia={competencia} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}
