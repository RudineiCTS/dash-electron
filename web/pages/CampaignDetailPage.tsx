import { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ClipboardList, Search } from 'lucide-react'
import {
  getCampaignSummaryDetailsById,
  getCampaignSummaryPerPeriod,
} from '@shared/services/campaign.teleseler'
import { useUsuario } from '../auth/UsuarioContext'
import { useGestor } from '../auth/useGestor'
import { useOrdenacao } from '../lib/ordenar'
import { ThOrdenavel } from '../components/ThOrdenavel'
import { OportunidadesCampanha } from '../components/OportunidadesCampanha'
import { ParametrosCampanha } from '../components/ParametrosCampanha'
import { BotaoExportarExcel } from '../components/BotaoExportarExcel'
import { ProgressBar } from '../components/ProgressBar'
import { Stat } from '../components/Stat'
import { ValorOculto } from '../components/ValorOculto'
import { EmptyState, ErrorState } from '../components/StateViews'
import { defaultCompetencia, formatCurrency, formatDetailMetric, formatPercent, formatSummaryMetric } from '../lib/format'
import { exportarExcel } from '../lib/exportarExcel'
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
  const { idPessoa, administrador, supervisao } = useUsuario()
  const { ehGestor } = useGestor(idPessoa)
  const [busca, setBusca] = useState('')
  const [limite, setLimite] = useState(PAGE_SIZE)

  const resumos = useApiResource((signal) => getCampaignSummaryPerPeriod(competencia, signal), [competencia])
  const ranking = useApiResource((signal) => getCampaignSummaryDetailsById(idCampaign, signal), [idCampaign])

  const resumo = resumos.data?.find((s) => s.idCampaign === idCampaign)
  // O administrador vê todas as linhas; avisa quando há gestão no ranking, que os outros usuários não recebem
  const temGestao = (administrador || supervisao) && (ranking.data ?? []).some((r) => r.personType === 1 || r.personType === 2)
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

  // ordenar clicando no cabeçalho (sem clique, vale a posição no ranking)
  const tipoCampanhaRanking = resumo?.campaignTypeDescription ?? ranking.data?.[0]?.campaignTypeDescription ?? ''
  const { ordenadas, ord, alternar } = useOrdenacao(linhas, {
    posicao: (r) => r.ranking || null,
    operador: (r) => r.operatorName,
    atingimento: (r) => r.percentageAchieved,
    meta: (r) => r.individualTarget,
    realizado: (r) => r.assessedValue,
    premio: (r) => r.award,
  })

  /** Baixa o ranking (na ordem e com a busca que estão na tela). O que está oculto para o usuário sai em branco. */
  function baixarExcel() {
    const quantidade = tipoCampanhaRanking === 'QUANTIDADE VENDIDA' || tipoCampanhaRanking === 'POSITIVAÇÃO'
    const tipoValor = quantidade ? 'numero' : 'moeda'
    exportarExcel({
      arquivo: `ranking-campanha-${idCampaign}-${competencia}`,
      aba: 'Ranking',
      linhas: ordenadas,
      colunas: [
        { titulo: '#', tipo: 'numero', largura: 6, valor: (r) => r.ranking || null },
        { titulo: 'Operador', largura: 38, valor: (r) => r.operatorName },
        { titulo: 'Grupo', largura: 22, valor: (r) => etiquetaGrupo(r.personGroup, r.personSubGroup).label },
        { titulo: 'Atingimento (%)', tipo: 'moeda', largura: 16, valor: (r) => (r.assessedHidden ? null : r.percentageAchieved) },
        { titulo: 'Meta', tipo: tipoValor, largura: 16, valor: (r) => r.individualTarget },
        { titulo: 'Realizado', tipo: tipoValor, largura: 16, valor: (r) => (r.assessedHidden ? null : r.assessedValue) },
        { titulo: 'Prêmio', tipo: 'moeda', largura: 16, valor: (r) => (r.prizeHidden ? null : r.award) },
      ],
    })
  }

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

        {/* Pedidos só do usuário logado (precisa estar ligado a uma pessoa do televendas) */}
        {idPessoa ? (
          <Link
            to={`/campaigns/details/${idCampaign}/pedidos?competencia=${competencia}`}
            className="flex h-8 items-center gap-1.5 rounded-md bg-github-btn-green px-3 text-sm font-medium text-white hover:opacity-90 sm:ml-auto"
          >
            <ClipboardList size={15} /> Ver meus pedidos
          </Link>
        ) : (
          <button
            type="button"
            disabled
            title="Seu usuário não está ligado a uma pessoa do televendas"
            className="flex h-8 cursor-not-allowed items-center gap-1.5 rounded-md bg-github-btn-green px-3 text-sm font-medium text-white opacity-50 sm:ml-auto"
          >
            <ClipboardList size={15} /> Ver meus pedidos
          </button>
        )}
      </div>

      {/* Parâmetros (o que conta na campanha) à esquerda e o resumo à direita; em telas pequenas, um embaixo do outro */}
      <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-2">
      <ParametrosCampanha idCampaign={idCampaign} competencia={competencia} />
      {resumo && (
        <section
          className="mx-auto flex w-full max-w-2xl flex-col gap-2 rounded-xl border border-github-border bg-github-bg-card p-3"
          aria-label="Resumo da campanha"
        >
          <div className="flex items-center gap-2">
            {resumo.assessedHidden ? (
              <>
                <ProgressBar percent={0} colorClass="bg-[#888780]" />
                <span className="shrink-0 text-sm font-semibold">
                  <ValorOculto />
                </span>
              </>
            ) : (
              <>
                <ProgressBar percent={resumo.percentageAchieved} achieved={batida} />
                <span className={`shrink-0 text-sm font-semibold ${batida ? 'text-other-greenflag' : ''}`}>
                  {formatPercent(resumo.percentageAchieved)}
                </span>
              </>
            )}
          </div>
          <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-center sm:grid-cols-4">
            <Stat label="Meta" value={formatSummaryMetric(resumo.campaignTypeDescription, resumo.goalValue)} />
            <Stat
              label="Realizado"
              value={
                resumo.assessedHidden ? <ValorOculto /> : formatSummaryMetric(resumo.campaignTypeDescription, resumo.assessedValue)
              }
            />
            <Stat label="Premiação" value={resumo.prizeHidden ? <ValorOculto /> : formatCurrency(resumo.totalAward)} />
            <Stat label="Pote" value={resumo.prizeHidden ? <ValorOculto /> : formatCurrency(resumo.totalPot)} />
          </dl>
        </section>
      )}
      </div>

      <OportunidadesCampanha idCampaign={idCampaign} competencia={competencia} />

      <section aria-label="Ranking" className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold">
            Ranking
            {ranking.data && (
              <span className="ml-2 text-xs font-normal text-github-text-muted">{linhas.length} pessoas</span>
            )}
          </h2>
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
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
          <BotaoExportarExcel total={ordenadas.length} onClick={baixarExcel} />
          </div>
        </div>

        {temGestao && (
          <p className="text-xs text-github-text-muted">
            Supervisora e auxiliar de supervisão aparecem só para administradores; os demais usuários não veem essas linhas.
          </p>
        )}

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
                      <ThOrdenavel rotulo="#" chave="posicao" ord={ord} onAlternar={alternar} className="w-10 py-2 pl-3 font-medium" />
                      <ThOrdenavel rotulo="Operador" chave="operador" ord={ord} onAlternar={alternar} className="px-2 py-2 font-medium" />
                      <ThOrdenavel rotulo="Atingimento" chave="atingimento" ord={ord} onAlternar={alternar} className="hidden w-48 px-2 py-2 font-medium md:table-cell" />
                      <ThOrdenavel rotulo="Meta" chave="meta" ord={ord} onAlternar={alternar} direita className="hidden whitespace-nowrap px-2 py-2 text-right font-medium sm:table-cell" />
                      <ThOrdenavel rotulo="Realizado" chave="realizado" ord={ord} onAlternar={alternar} direita className="whitespace-nowrap px-2 py-2 text-right font-medium" />
                      <ThOrdenavel rotulo="Prêmio" chave="premio" ord={ord} onAlternar={alternar} direita className="whitespace-nowrap py-2 pl-2 pr-3 text-right font-medium" />
                    </tr>
                  </thead>
                  <tbody>
                    {ordenadas.slice(0, limite).map((r) => {
                      const bateu = !r.assessedHidden && r.percentageAchieved >= 100
                      // a linha da própria pessoa logada: é a única com o prêmio à vista quando ele está escondido
                      const souEu = !!idPessoa && r.idPersonSales === idPessoa
                      return (
                        <tr
                          key={r.idPersonSales}
                          className={`border-t border-github-border hover:bg-github-bg-hover ${
                            souEu ? 'bg-github-bg-hover/60' : ''
                          }`}
                        >
                          <td className="py-1.5 pl-3 text-xs font-bold text-github-text-muted">{r.ranking || '–'}</td>
                          <td className="max-w-[16rem] px-2 py-1.5">
                            <p className="truncate font-semibold">
                              {ehGestor || souEu ? (
                                <Link
                                  to={`/campaigns/details/${idCampaign}/pedidos?competencia=${competencia}&pessoa=${r.idPersonSales}`}
                                  title={`Ver os pedidos de ${r.operatorName}`}
                                  className="hover:underline"
                                >
                                  {r.operatorName}
                                </Link>
                              ) : (
                                r.operatorName
                              )}
                              {souEu && (
                                <span className="ml-1.5 rounded bg-github-btn-green px-1.5 py-px align-middle text-[10px] font-medium text-white">
                                  Você
                                </span>
                              )}
                            </p>
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
                            {r.assessedHidden ? (
                              <ValorOculto className="text-xs" />
                            ) : (
                              <div className="flex items-center gap-2">
                                <ProgressBar percent={r.percentageAchieved} achieved={bateu} />
                                <span
                                  className={`w-14 shrink-0 text-right text-xs font-semibold ${bateu ? 'text-other-greenflag' : ''}`}
                                >
                                  {formatPercent(r.percentageAchieved)}
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="hidden whitespace-nowrap px-2 py-1.5 text-right sm:table-cell">
                            {formatDetailMetric(r.campaignTypeDescription, r.individualTarget)}
                          </td>
                          <td className="whitespace-nowrap px-2 py-1.5 text-right">
                            {r.assessedHidden ? <ValorOculto /> : formatDetailMetric(r.campaignTypeDescription, r.assessedValue)}
                          </td>
                          <td className="whitespace-nowrap py-1.5 pl-2 pr-3 text-right font-semibold">
                            {r.prizeHidden ? <ValorOculto /> : formatCurrency(r.award)}
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
