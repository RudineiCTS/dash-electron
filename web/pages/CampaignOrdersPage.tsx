import { Fragment, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react'
import dayjs from 'dayjs'
import { getCampaignSummaryDetailsById, getCampaignSummaryPerPeriod } from '@shared/services/campaign.teleseler'
import { PERMITIR_TROCA_USUARIO, useUsuario } from '../auth/UsuarioContext'
import { Stat } from '../components/Stat'
import { EmptyState, ErrorState } from '../components/StateViews'
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
  const [limite, setLimite] = useState(PAGE_SIZE)
  const [abertos, setAbertos] = useState<ReadonlySet<string>>(new Set())

  const resumos = useApiResource((signal) => getCampaignSummaryPerPeriod(competencia, signal), [competencia])
  // O ranking tem uma linha por pessoa: a do usuário logado dá o realizado e o percentual dele.
  const ranking = useApiResource((signal) => getCampaignSummaryDetailsById(idCampaign, signal), [idCampaign])
  const pedidos = useApiResource(
    (signal) => (idPessoa ? getPedidosDaPessoa(idCampaign, idPessoa, signal) : Promise.resolve(null)),
    [idCampaign, idPessoa],
  )

  const agrupados = useMemo(() => agruparPedidos(pedidos.data?.orders ?? []), [pedidos.data])

  if (!Number.isInteger(idCampaign) || idCampaign <= 0) return <NotFoundPage />

  const resumo = resumos.data?.find((s) => s.idCampaign === idCampaign)
  const meu = idPessoa ? ranking.data?.find((r) => r.idPersonSales === idPessoa) : undefined
  const totalItens = pedidos.data?.orders.length ?? 0
  const dataApuracao = pedidos.data?.appraisalDate ? dayjs(pedidos.data.appraisalDate).format('DD/MM/YYYY HH:mm') : '—'

  const semDadosDoUsuario = ranking.loading ? 'Carregando…' : '—'
  // Sem meta individual não há percentual a mostrar (o ranking devolve 0,00%, que enganaria).
  const temPercentual = !!meu && (meu.individualTarget > 0 || meu.percentageAchieved > 0)

  function alternar(chave: string) {
    setAbertos((atual) => {
      const novo = new Set(atual)
      if (novo.has(chave)) novo.delete(chave)
      else novo.add(chave)
      return novo
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <Link
          to={`/campaigns/details/${idCampaign}?competencia=${competencia}`}
          aria-label="Voltar para a campanha"
          className="flex h-8 items-center gap-1 rounded-md border border-github-border bg-github-bg-card px-2.5 text-sm text-github-text-muted hover:bg-github-bg-hover"
        >
          <ArrowLeft size={16} /> Campanha
        </Link>
        <h1 className="min-w-0 text-lg font-extrabold">Meus pedidos</h1>
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
            label="Meu realizado"
            value={meu ? formatDetailMetric(meu.campaignTypeDescription, meu.assessedValue) : semDadosDoUsuario}
          />
          <Stat
            label="Meu percentual"
            value={meu ? (temPercentual ? formatPercent(meu.percentageAchieved) : 'Sem meta') : semDadosDoUsuario}
          />
          <Stat label="Data da apuração" value={dataApuracao} />
          <Stat
            label="Usuário"
            value={usuario?.operatorName ?? '—'}
            className="col-span-2 sm:col-span-1 [&_dd]:whitespace-normal [&_dd]:break-words"
          />
        </dl>
      </section>

      {!idPessoa && (
        <EmptyState
          message={
            PERMITIR_TROCA_USUARIO
              ? 'Seu usuário não está ligado a uma pessoa do televendas, então não há pedidos para mostrar.'
              : 'Você precisa estar logado para ver os seus pedidos.'
          }
        />
      )}

      {idPessoa && pedidos.loading && (
        <div className="h-40 animate-pulse rounded-xl border border-github-border bg-github-bg-card" aria-busy="true" />
      )}
      {idPessoa && pedidos.error && <ErrorState message={pedidos.error} onRetry={pedidos.reload} />}

      {idPessoa && pedidos.data && !pedidos.error &&
        (agrupados.length === 0 ? (
          <EmptyState message="Nenhum pedido apurado para este usuário nesta campanha." />
        ) : (
          <section aria-label="Pedidos" className="flex flex-col gap-2">
            <h2 className="text-base font-semibold">
              Pedidos
              <span className="ml-2 text-xs font-normal text-github-text-muted">
                {agrupados.length} pedidos · {totalItens} itens · toque no pedido para ver os produtos
              </span>
            </h2>

            <div className="max-w-3xl overflow-x-auto rounded-xl border border-github-border bg-github-bg-card">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-github-bg-hover text-[10px] uppercase tracking-tight text-github-text-muted sm:tracking-wide">
                  <tr>
                    <th className="py-2 pl-1.5 font-medium sm:pl-3">Pedido</th>
                    <th className="px-1 py-2 font-medium sm:px-2">Cliente</th>
                    <th className="px-1 py-2 font-medium sm:px-2">Origem</th>
                    <th className="whitespace-nowrap px-1 py-2 text-right font-medium sm:px-2">Total</th>
                    <th className="whitespace-nowrap py-2 pl-1 pr-1.5 text-right font-medium sm:pl-2 sm:pr-3">Devolução</th>
                  </tr>
                </thead>
                <tbody>
                  {agrupados.slice(0, limite).map((p) => {
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
                            {formatCurrency(p.total)}
                          </td>
                          <td
                            className={`whitespace-nowrap py-1.5 pl-1 pr-1.5 text-right sm:pl-2 sm:pr-3 ${
                              p.returnValue > 0 ? 'text-other-redflag' : 'text-github-text-muted'
                            }`}
                          >
                            {formatCurrency(p.returnValue)}
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
                                        {formatCurrency(item.total)}
                                      </td>
                                      <td
                                        className={`whitespace-nowrap py-1 pl-1 text-right ${
                                          item.returnValue > 0 ? 'text-other-redflag' : 'text-github-text-muted'
                                        }`}
                                      >
                                        {formatCurrency(item.returnValue)}
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
  )
}
