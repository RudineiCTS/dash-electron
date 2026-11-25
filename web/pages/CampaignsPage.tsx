import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getCampaignSummaryPerPeriod } from '@shared/services/campaign.teleseler'
import { useUsuario } from '../auth/UsuarioContext'
import { CampaignCard } from '../components/CampaignCard'
import { CampaignTable } from '../components/CampaignTable'
import { CardListSkeleton, EmptyState, ErrorState } from '../components/StateViews'
import { VisaoToggle } from '../components/VisaoToggle'
import { calcularTotaisCampanhas } from '@shared/utils/totaisCampanhas'
import { defaultCompetencia, formatCurrency, formatPercent, monthToCompetencia } from '../lib/format'
import { getMinhasPosicoes, indexarPosicoes } from '../lib/posicoes'
import { getVisibilidades, indexarVisibilidades } from '../lib/visibilidade'
import { temMeta } from '../lib/status'
import { useApiResource } from '../lib/useApiResource'
import { ehVisao, lerVisaoSalva, salvarVisao, type Visao } from '../lib/visao'

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
  // Cards ou lista: vale o ?visao= da URL (link compartilhável); sem ele, a última escolha deste navegador.
  const visaoUrl = params.get('visao')
  const visao: Visao = ehVisao(visaoUrl) ? visaoUrl : lerVisaoSalva()

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

  function mudarVisao(nova: Visao) {
    salvarVisao(nova)
    updateParams({ visao: nova === 'cards' ? null : nova })
  }

  const { data, loading, error, reload } = useApiResource(
    (signal) => getCampaignSummaryPerPeriod(competencia, signal),
    [competencia],
  )

  // Minhas posições nos rankings (selo nos cards). A API identifica a pessoa pelo token, então só com login.
  // É um complemento: se falhar (ou não houver sessão) os cards aparecem normais, sem selo e sem aviso de erro.
  const { sessao, administrador } = useUsuario()
  const posicoesApi = useApiResource(
    (signal) => (sessao ? getMinhasPosicoes(competencia, signal) : Promise.resolve([])),
    [competencia, !!sessao],
  )
  const posicoes = useMemo(() => indexarPosicoes(posicoesApi.data ?? []), [posicoesApi.data])

  // Só o administrador vê tudo; para ele, marca as campanhas que estão escondidas dos usuários comuns.
  const regrasApi = useApiResource(
    (signal) => (administrador ? getVisibilidades(signal) : Promise.resolve([])),
    [administrador],
  )
  const regrasOcultas = useMemo(() => indexarVisibilidades(regrasApi.data ?? []), [regrasApi.data])

  const daAba = useMemo(() => (data ?? []).filter((c) => c.typeCampaign === aba), [data, aba])
  const tipos = useMemo(() => [...new Set(daAba.map((c) => c.campaignTypeDescription))].sort(), [daAba])
  const visiveis = useMemo(
    () =>
      daAba
        .filter((c) => !tipo || c.campaignTypeDescription === tipo)
        .filter((c) => !somenteBateram || c.percentageAchieved >= 100),
    [daAba, tipo, somenteBateram],
  )
  // Campanha com apurado escondido (usuário comum) chega sem valores: fica fora de totais e contagens por status
  const comApurado = useMemo(() => visiveis.filter((c) => !c.assessedHidden), [visiveis])
  const ocultas = visiveis.length - comApurado.length
  const premiacaoTotal = visiveis.reduce((acc, c) => acc + (c.totalAward ?? 0), 0)
  // Totais de vendas (R$) só das campanhas com meta; sem meta e positivação ficam fora (utils/totaisCampanhas)
  const totais = useMemo(() => calcularTotaisCampanhas(comApurado), [comApurado])

  // Resumo por status (mesmas cores e cortes dos cards).
  const resumoStatus = useMemo(() => {
    const conta = (min: number, max: number) =>
      comApurado.filter((c) => temMeta(c) && c.percentageAchieved >= min && c.percentageAchieved < max).length
    return [
      { label: 'Batidas', qtd: conta(100, Infinity), cor: 'bg-[#3B6D11]' },
      { label: 'Em andamento', qtd: conta(50, 100), cor: 'bg-[#EF9F27]' },
      { label: 'Abaixo de 50%', qtd: conta(-Infinity, 50), cor: 'bg-[#E24B4A]' },
    ]
  }, [comApurado])
  // Sem meta (ex: quantidade vendida) fica fora dos percentuais: o atingimento não se aplica
  const semMeta = comApurado.filter((c) => !temMeta(c)).length
  const comMeta = comApurado.length - semMeta
  const pctDeComMeta = (qtd: number) => (comMeta > 0 ? Math.round((qtd / comMeta) * 100) : 0)

  const campo =
    'h-9 rounded-md border border-github-border bg-github-bg-card px-2.5 text-sm text-github-text'

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h1 className="text-lg font-extrabold">
          Campanhas Rodando
          <span className="ml-2 text-xs font-medium tracking-[0.15em] text-github-btn-green-hover">APURAÇÃO</span>
        </h1>
        {data && !error && (
          <p className="text-sm text-github-text-muted">
            <strong className="font-semibold text-github-text">{visiveis.length}</strong> campanhas ·{' '}
            premiação total{' '}
            <strong className="font-semibold text-github-text">{formatCurrency(premiacaoTotal)}</strong>
          </p>
        )}
      </div>

      {/* Barra de filtros numa linha só (quebra no mobile) */}
      <section aria-label="Filtros" className="flex flex-wrap items-center gap-2">
        <div role="tablist" aria-label="Tipo de apuração" className="flex gap-0.5 rounded-lg bg-github-bg-hover p-0.5">
          {ABAS.map((a) => (
            <button
              key={a.id}
              role="tab"
              type="button"
              aria-selected={aba === a.id}
              onClick={() => updateParams({ aba: a.id === 'valor' ? null : a.id, tipo: null })}
              className={`h-8 rounded-md px-4 text-sm font-medium ${
                aba === a.id ? 'bg-github-bg-card text-github-text shadow-sm' : 'text-github-text-muted'
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>

        <input
          type="month"
          aria-label="Competência"
          value={competencia.slice(0, 7)}
          onChange={(e) => {
            const next = monthToCompetencia(e.target.value)
            if (next) updateParams({ competencia: next })
          }}
          className={campo}
        />

        <select
          aria-label="Tipo de campanha"
          value={tipo}
          onChange={(e) => updateParams({ tipo: e.target.value || null })}
          className={`${campo} max-w-[14rem]`}
        >
          <option value="">Todos os tipos</option>
          {tipos.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <button
          type="button"
          aria-pressed={somenteBateram}
          onClick={() => updateParams({ bateram: somenteBateram ? null : '1' })}
          className={`h-9 rounded-md border px-3 text-sm font-medium ${
            somenteBateram
              ? 'border-github-btn-green bg-github-btn-green text-white'
              : 'border-github-border bg-github-bg-card text-github-text-muted'
          }`}
        >
          Somente bateram
        </button>

        <VisaoToggle visao={visao} onChange={mudarVisao} className="ml-auto" />
      </section>


      {data && !error && totais.vendasComMeta > 0 && (
        <section
          aria-label="Totais de vendas"
          className="mx-auto grid w-full max-w-xl grid-cols-3 gap-2 rounded-xl border border-github-border bg-github-bg-card p-3 text-center"
        >
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wide text-github-text-muted">Meta (vendas)</p>
            <p className="whitespace-nowrap text-sm font-semibold sm:text-base">{formatCurrency(totais.meta)}</p>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wide text-github-text-muted">Realizado</p>
            <p className="whitespace-nowrap text-sm font-semibold sm:text-base">{formatCurrency(totais.realizado)}</p>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wide text-github-text-muted">Atingimento</p>
            <p className="whitespace-nowrap text-sm font-semibold sm:text-base">
              {totais.percentual === null ? '—' : formatPercent(totais.percentual)}
            </p>
          </div>
          <p className="col-span-3 text-xs text-github-text-muted">
            {totais.vendasComMeta} campanhas de vendas com meta
            {(totais.semMeta > 0 || totais.outrasUnidades > 0 || ocultas > 0) && (
              <span title="Ficam fora do cálculo: campanhas sem meta e as medidas em unidades (positivação e quantidade vendida)">
                {' · '}fora: {totais.semMeta} sem meta, {totais.outrasUnidades} em unidades
                {ocultas > 0 && `, ${ocultas} com apurado oculto`}
              </span>
            )}
          </p>
        </section>
      )}

      {loading && <CardListSkeleton />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {data && !error && (
        <>
          {visiveis.length === 0 ? (
            <EmptyState message="Nenhuma campanha encontrada para esses filtros." />
          ) : visao === 'lista' ? (
            <CampaignTable campanhas={visiveis} competencia={competencia} posicoes={posicoes} regrasOcultas={regrasOcultas} />
          ) : (
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(19rem,1fr))] gap-2.5">
              {visiveis.map((c) => (
                <li key={c.idCampaign}>
                  <CampaignCard
                    campaign={c}
                    competencia={competencia}
                    posicao={posicoes.get(c.idCampaign)}
                    regraOculta={regrasOcultas.get(c.idCampaign)}
                  />
                </li>
              ))}
            </ul>
          )}

          {visiveis.length > 0 && (
            <footer
              aria-label="Resumo por status"
              className="sticky bottom-2 z-[5] flex flex-col gap-2 rounded-xl border border-github-border bg-github-bg-card px-4 py-2.5 text-sm shadow-sm"
            >
              <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
                <span className="text-github-text-muted">
                  Com meta <strong className="text-base font-semibold text-github-text">{comMeta}</strong>
                </span>
                {resumoStatus.map((s) => (
                  <span key={s.label} className="flex items-center gap-1.5 text-github-text-muted">
                    <span className={`h-2.5 w-2.5 rounded-full ${s.cor}`} aria-hidden />
                    {s.label}{' '}
                    <strong className="text-base font-semibold text-github-text">{s.qtd}</strong>
                    <span className="text-xs">({pctDeComMeta(s.qtd)}%)</span>
                  </span>
                ))}
                {ocultas > 0 && (
                  <span
                    className="flex items-center gap-1.5 border-l border-github-border pl-6 text-github-text-muted"
                    title="O administrador escondeu o apurado destas campanhas: ficam fora das contas"
                  >
                    <span className="h-2.5 w-2.5 rounded-full border border-github-border" aria-hidden />
                    Apurado oculto <strong className="text-base font-semibold text-github-text">{ocultas}</strong>
                  </span>
                )}
                {semMeta > 0 && (
                  <span className="flex items-center gap-1.5 border-l border-github-border pl-6 text-github-text-muted">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#888780]" aria-hidden />
                    Sem meta <strong className="text-base font-semibold text-github-text">{semMeta}</strong>
                  </span>
                )}
              </div>
              {/* Barra proporcional: só campanhas com meta (as sem meta ficam de fora) */}
              <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-github-bg-hover" aria-hidden>
                {comMeta > 0 &&
                  resumoStatus.map((s) => (
                    <div key={s.label} className={s.cor} style={{ width: `${(s.qtd / comMeta) * 100}%` }} />
                  ))}
              </div>
            </footer>
          )}
        </>
      )}
    </div>
  )
}
