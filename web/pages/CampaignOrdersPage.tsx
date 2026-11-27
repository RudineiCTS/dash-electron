import { Fragment, useMemo, useState } from 'react'
import { useOrdenacao } from '../lib/ordenar'
import { ThOrdenavel } from '../components/ThOrdenavel'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react'
import dayjs from 'dayjs'
import { getCampaignSummaryDetailsById, getCampaignSummaryPerPeriod } from '@shared/services/campaign.teleseler'
import { PERMITIR_TROCA_USUARIO, useUsuario } from '../auth/UsuarioContext'
import { useGestor } from '../auth/useGestor'
import { PainelDesempenho } from '../components/PainelDesempenho'
import { PedidosPendentesCard } from '../components/PedidosPendentesCard'
import { Stat } from '../components/Stat'
import { ValorOculto } from '../components/ValorOculto'
import { EmptyState, ErrorState } from '../components/StateViews'
import { montarDesempenho } from '../lib/desempenho'
import { defaultCompetencia, formatCurrency, formatDetailMetric, formatPercent } from '../lib/format'
import { agruparPedidos, getPedidosDaPessoa } from '../lib/pedidos'
import { useApiResource } from '../lib/useApiResource'
import NotFoundPage from './NotFoundPage'

const PAGE_SIZE = 50

/**
 * "Meus pedidos": pedidos apurados do usuário logado na campanha.
 * Acima da tabela: dados da campanha, o realizado e o percentual DO USUÁRIO (não os da campanha
 * inteira) e a data da apuração. A tabela agrupa por pedido + cliente + origem, somando total e
 * devolução; os produtos de cada pedido aparecem ao clicar nele.
 */
export default function CampaignOrdersPage() {
  const { id } = useParams<{ id: string }>()
  const idCampaign = Number(id)
  const [params] = useSearchParams()
  const competencia = params.get('competencia') ?? defaultCompetencia()
  const { idPessoa, usuario } = useUsuario()
  // Supervisão e administrador abrem os pedidos de qualquer pessoa do ranking (?pessoa=ID); os demais, só os próprios.
  const { ehGestor, carregando: carregandoGestor } = useGestor(idPessoa)
  const pessoaParam = Number(params.get('pessoa')) || null
  const idAlvo = pessoaParam ? (ehGestor ? pessoaParam : carregandoGestor ? null : idPessoa) : idPessoa
  const deOutraPessoa = !!idAlvo && idAlvo !== idPessoa
  const [limite, setLimite] = useState(PAGE_SIZE)
  const [abertos, setAbertos] = useState<ReadonlySet<string>>(new Set())

  const resumos = useApiResource((signal) => getCampaignSummaryPerPeriod(competencia, signal), [competencia])
  // O ranking tem uma linha por pessoa: a do usuário logado dá o realizado e o percentual dele.
  const ranking = useApiResource((signal) => getCampaignSummaryDetailsById(idCampaign, signal), [idCampaign])
  const pedidos = useApiResource(
    (signal) => (idAlvo ? getPedidosDaPessoa(idCampaign, idAlvo, signal) : Promise.resolve(null)),
    [idCampaign, idAlvo],
  )

  const agrupados = useMemo(() => agruparPedidos(pedidos.data?.orders ?? []), [pedidos.data])
  const { ordenadas, ord, alternar: alternarOrdem } = useOrdenacao(agrupados, {
    pedido: (p) => p.idOrder,
    cliente: (p) => p.idClient,
    origem: (p) => p.origin,
    total: (p) => p.total,
    devolucao: (p) => p.returnValue,
  })

  if (!Number.isInteger(idCampaign) || idCampaign <= 0) return <NotFoundPage />

  const resumo = resumos.data?.find((s) => s.idCampaign === idCampaign)
  const meu = idAlvo ? ranking.data?.find((r) => r.idPersonSales === idAlvo) : undefined
  const totalItens = pedidos.data?.orders.length ?? 0
  const dataApuracao = pedidos.data?.appraisalDate ? dayjs(pedidos.data.appraisalDate).format('DD/MM/YYYY HH:mm') : '—'

  const semDadosDoUsuario = ranking.loading ? 'Carregando…' : '—'
  // O administrador escondeu o apurado desta campanha: realizado, percentual e valores dos pedidos não existem para este usuário.
  // O total da campanha (resumo) escondido é da equipe: o que vale aqui é a linha da pessoa e os pedidos dela, que a API já mascara.
  const apuradoOculto = !!(meu?.assessedHidden || pedidos.data?.assessedHidden)
  // Sem meta individual não há percentual a mostrar (o ranking devolve 0,00%, que enganaria).
  const temPercentual = !!meu && (meu.individualTarget > 0 || meu.percentageAchieved > 0)

  // Painel "Meu desempenho": meta/prazo e posição, só com o que a tela já carregou
  // "de N" conta só quem tem ranking (> 0): o mesmo critério do selo nos cards da lista de campanhas
  const desempenho = montarDesempenho(resumo, meu, ranking.data?.filter((r) => r.ranking > 0).length ?? 0)
  const carregandoPainel = !!idAlvo && (ranking.loading || resumos.loading)
  // Sem meta e sem ranking (e sem carregar) não há painel: nem o contêiner entra, para não sobrar espaço vazio
  const temPainel = carregandoPainel || !!desempenho.meta || !!desempenho.posicao
  const painel = <PainelDesempenho desempenho={desempenho} carregando={carregandoPainel} />
  // pedidos digitados, ainda não faturados, da campanha (só aparece quando há uma pessoa para consultar)
  const pendentes = idAlvo ? (
    <>
      <PedidosPendentesCard idCampaign={idCampaign} competencia={competencia} idPessoa={idAlvo} />
      <PedidosPendentesCard idCampaign={idCampaign} competencia={competencia} idPessoa={idAlvo} tipo="excluidos" />
    </>
  ) : null

  function alternar(chave: string) {
    setAbertos((atual) => {
      const novo = new Set(atual)
      if (novo.has(chave)) novo.delete(chave)
      else novo.add(chave)
      return novo
    })
  }

  return (
    <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:gap-4">
      <div className="flex min-w-0 flex-col gap-3 xl:max-w-3xl xl:flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <Link
            to={`/campaigns/details/${idCampaign}?competencia=${competencia}`}
            aria-label="Voltar para a campanha"
            className="flex h-8 items-center gap-1 rounded-md border border-github-border bg-github-bg-card px-2.5 text-sm text-github-text-muted hover:bg-github-bg-hover"
          >
            <ArrowLeft size={16} /> Campanha
          </Link>
          <h1 className="min-w-0 text-lg font-extrabold">
            {deOutraPessoa ? `Pedidos de ${meu?.operatorName ?? 'pessoa ' + idAlvo}` : 'Meus pedidos'}
          </h1>
        </div>

        {/* Tudo que fica acima da tabela */}
        <section
          aria-label="Dados da campanha"
          className="flex w-full max-w-3xl flex-col gap-2 rounded-xl border border-github-border bg-github-bg-card p-3"
        >
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wide text-github-text-muted">Campanha</p>
            <p className="break-words text-sm font-semibold">
              {resumo?.campaignDescription ?? (resumos.loading ? 'Carregando…' : `Campanha #${idCampaign}`)}
              <span className="ml-2 text-xs font-normal text-github-text-muted">#{idCampaign}</span>
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-4">
            <Stat
              label={deOutraPessoa ? 'Realizado' : 'Meu realizado'}
              value={
                apuradoOculto ? (
                  <ValorOculto />
                ) : meu ? (
                  formatDetailMetric(meu.campaignTypeDescription, meu.assessedValue)
                ) : (
                  semDadosDoUsuario
                )
              }
            />
            <Stat
              label={deOutraPessoa ? 'Percentual' : 'Meu percentual'}
              value={
                apuradoOculto ? (
                  <ValorOculto />
                ) : meu ? (
                  temPercentual ? formatPercent(meu.percentageAchieved) : 'Sem meta'
                ) : (
                  semDadosDoUsuario
                )
              }
            />
            <Stat label="Data da apuração" value={dataApuracao} />
            <Stat
              label={deOutraPessoa ? 'Pessoa' : 'Usuário'}
              value={(deOutraPessoa ? meu?.operatorName : usuario?.operatorName) ?? '—'}
              className="col-span-2 sm:col-span-1 [&_dd]:whitespace-normal [&_dd]:break-words"
            />
          </dl>
        </section>

        {/* Celular/tablet: entre o cartão e a tabela */}
        {(temPainel || pendentes) && (
          <div className="flex w-full max-w-3xl flex-col gap-3 xl:hidden">
            {temPainel && painel}
            {pendentes}
          </div>
        )}

        {!idAlvo && !carregandoGestor && (
          <EmptyState
            message={
              PERMITIR_TROCA_USUARIO
                ? 'Seu usuário não está ligado a uma pessoa do televendas, então não há pedidos para mostrar.'
                : 'Você precisa estar logado para ver os seus pedidos.'
            }
          />
        )}

        {(idAlvo ? pedidos.loading : carregandoGestor) && (
          <div className="h-40 animate-pulse rounded-xl border border-github-border bg-github-bg-card" aria-busy="true" />
        )}
        {idAlvo && pedidos.error && <ErrorState message={pedidos.error} onRetry={pedidos.reload} />}

        {idAlvo && pedidos.data && !pedidos.error &&
          (agrupados.length === 0 ? (
            <EmptyState message="Nenhum pedido apurado para este usuário nesta campanha." />
          ) : (
            <section aria-label="Pedidos" className="flex flex-col gap-2">
              <h2 className="text-base font-semibold">
                Pedidos
                <span className="ml-2 text-xs font-normal text-github-text-muted">
                  {agrupados.length} {agrupados.length === 1 ? 'pedido' : 'pedidos'} · {totalItens}{' '}
                  {totalItens === 1 ? 'item' : 'itens'} · toque no pedido para ver os produtos
                </span>
              </h2>

              <div className="max-w-3xl overflow-x-auto rounded-xl border border-github-border bg-github-bg-card">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-github-bg-hover text-[10px] uppercase tracking-tight text-github-text-muted sm:tracking-wide">
                    <tr>
                      <ThOrdenavel rotulo="Pedido" chave="pedido" ord={ord} onAlternar={alternarOrdem} className="py-2 pl-1.5 font-medium sm:pl-3" />
                      <ThOrdenavel rotulo="Cliente" chave="cliente" ord={ord} onAlternar={alternarOrdem} className="px-1 py-2 font-medium sm:px-2" />
                      <ThOrdenavel rotulo="Origem" chave="origem" ord={ord} onAlternar={alternarOrdem} className="px-1 py-2 font-medium sm:px-2" />
                      <ThOrdenavel rotulo="Total" chave="total" ord={ord} onAlternar={alternarOrdem} direita className="whitespace-nowrap px-1 py-2 text-right font-medium sm:px-2" />
                      <ThOrdenavel rotulo="Devolução" chave="devolucao" ord={ord} onAlternar={alternarOrdem} direita className="whitespace-nowrap py-2 pl-1 pr-1.5 text-right font-medium sm:pl-2 sm:pr-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {ordenadas.slice(0, limite).map((p) => {
                      const aberto = abertos.has(p.chave)
                      const painel = `produtos-${p.chave}`
                      return (
                        <Fragment key={p.chave}>
                          {/* A linha inteira é clicável (toque); o botão da 1ª célula dá o foco/teclado e o clique sobe até a linha. */}
                          <tr
                            onClick={() => alternar(p.chave)}
                            className="cursor-pointer border-t border-github-border hover:bg-github-bg-hover"
                          >
                            <td className="whitespace-nowrap py-1.5 pl-1.5 font-medium sm:pl-3">
                              <button
                                type="button"
                                aria-expanded={aberto}
                                aria-controls={painel}
                                aria-label={`Pedido ${p.idOrder}: ${aberto ? 'ocultar' : 'ver'} produtos`}
                                className="flex items-center gap-0.5"
                              >
                                {aberto ? <ChevronDown size={14} aria-hidden /> : <ChevronRight size={14} aria-hidden />}
                                {p.idOrder}
                              </button>
                            </td>
                            <td className="whitespace-nowrap px-1 py-1.5 sm:px-2">{p.idClient ?? '—'}</td>
                            <td className="px-1 py-1.5 text-github-text-muted sm:px-2">{p.origin}</td>
                            <td className="whitespace-nowrap px-1 py-1.5 text-right font-semibold sm:px-2">
                              {apuradoOculto ? <ValorOculto /> : formatCurrency(p.total)}
                            </td>
                            <td
                              className={`whitespace-nowrap py-1.5 pl-1 pr-1.5 text-right sm:pl-2 sm:pr-3 ${
                                p.returnValue > 0 ? 'text-other-redflag' : 'text-github-text-muted'
                              }`}
                            >
                              {apuradoOculto ? <ValorOculto /> : formatCurrency(p.returnValue)}
                            </td>
                          </tr>

                          {aberto && (
                            <tr id={painel} className="bg-github-bg-hover/50">
                              <td colSpan={5} className="px-2 py-2 sm:px-3">
                                <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-github-text-muted">
                                  Produtos do pedido {p.idOrder} ({p.itens.length})
                                </p>
                                <table className="w-full max-w-sm text-left text-xs sm:text-sm">
                                  <thead className="text-[10px] uppercase tracking-tight text-github-text-muted">
                                    <tr>
                                      <th className="py-1 font-medium">Produto</th>
                                      <th className="px-1 py-1 text-right font-medium">Total</th>
                                      <th className="py-1 pl-1 text-right font-medium">Devolução</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {p.itens.map((item, i) => (
                                      <tr key={`${item.idProduct}-${i}`} className="border-t border-github-border/60">
                                        <td className="whitespace-nowrap py-1">{item.idProduct}</td>
                                        <td className="whitespace-nowrap px-1 py-1 text-right font-semibold">
                                          {apuradoOculto ? <ValorOculto /> : formatCurrency(item.total)}
                                        </td>
                                        <td
                                          className={`whitespace-nowrap py-1 pl-1 text-right ${
                                            (item.returnValue ?? 0) > 0 ? 'text-other-redflag' : 'text-github-text-muted'
                                          }`}
                                        >
                                          {apuradoOculto ? <ValorOculto /> : formatCurrency(item.returnValue)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {agrupados.length > limite && (
                <button
                  type="button"
                  onClick={() => setLimite((n) => n + PAGE_SIZE)}
                  className="h-9 max-w-3xl rounded-md border border-github-border bg-github-bg-card text-sm font-medium"
                >
                  Mostrar mais ({agrupados.length - limite})
                </button>
              )}
            </section>
          ))}
      </div>

      {/* Desktop largo: coluna fixa à direita, ao lado da tabela */}
      {(temPainel || pendentes) && (
        <aside className="hidden xl:sticky xl:top-[4.5rem] xl:flex xl:w-80 xl:shrink-0 xl:flex-col xl:gap-3">
          {temPainel && painel}
          {pendentes}
        </aside>
      )}
    </div>
  )
}
