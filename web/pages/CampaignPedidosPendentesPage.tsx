import { Fragment, useState } from 'react'
import dayjs from 'dayjs'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react'
import { getCampaignSummaryPerPeriod } from '@shared/services/campaign.teleseler'
import { useUsuario } from '../auth/UsuarioContext'
import { useGestor } from '../auth/useGestor'
import { BotaoExportarExcel } from '../components/BotaoExportarExcel'
import { EmptyState, ErrorState } from '../components/StateViews'
import { ThOrdenavel } from '../components/ThOrdenavel'
import { getItensPedidoPendente, getPedidosPendentes, type TipoPedidos } from '../lib/campanhaPedidosPendentes'
import { exportarExcel } from '../lib/exportarExcel'
import { defaultCompetencia, formatCurrency } from '../lib/format'
import { useOrdenacao } from '../lib/ordenar'
import { useApiResource } from '../lib/useApiResource'
import NotFoundPage from './NotFoundPage'

/** Produtos de um pedido pendente: o que é da campanha vem primeiro e é marcado; o resto do pedido aparece esmaecido. */
function ItensDoPedido({ idCampaign, idPedido, idPessoa }: { idCampaign: number; idPedido: number; idPessoa: number }) {
  const itens = useApiResource((signal) => getItensPedidoPendente(idCampaign, idPedido, idPessoa, signal), [idCampaign, idPedido, idPessoa])

  if (itens.loading) return <div className="h-12 animate-pulse rounded-lg bg-github-bg-hover" aria-busy="true" />
  if (itens.error) return <ErrorState message={itens.error} onRetry={itens.reload} />
  if (!itens.data?.length) return <EmptyState message="Sem itens para mostrar." />

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="text-[10px] uppercase tracking-wide text-github-text-muted">
          <tr>
            <th className="py-1 pr-2 font-medium">Produto</th>
            <th className="hidden px-2 py-1 font-medium sm:table-cell">Fabricante</th>
            <th className="px-2 py-1 text-right font-medium">Qtd</th>
            <th className="px-2 py-1 text-right font-medium">Valor unit.</th>
            <th className="py-1 pl-2 text-right font-medium">Total</th>
          </tr>
        </thead>
        <tbody>
          {itens.data.map((i) => (
            <tr key={i.idProduto} className={`border-t border-github-border ${i.daCampanha ? '' : 'text-github-text-muted'}`}>
              <td className="py-1 pr-2">
                <span className={i.daCampanha ? 'font-semibold' : ''}>{i.descProduto ?? `Produto ${i.idProduto}`}</span>
                <span className="ml-1.5 text-[10px] text-github-text-muted">{i.idProduto}</span>
                {i.daCampanha && (
                  <span className="ml-1.5 rounded bg-[#639922]/15 px-1.5 text-[10px] font-medium text-[#639922]">da campanha</span>
                )}
              </td>
              <td className="hidden max-w-[14rem] truncate px-2 py-1 sm:table-cell" title={i.fabricante ?? ''}>
                {i.fabricante ?? '-'}
              </td>
              <td className="px-2 py-1 text-right tabular-nums">{i.quantidade.toLocaleString('pt-BR')}</td>
              <td className="px-2 py-1 text-right tabular-nums">{formatCurrency(i.valorUnitario)}</td>
              <td className="py-1 pl-2 text-right tabular-nums">{formatCurrency(i.valorTotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/**
 * Pedidos pendentes de uma pessoa na campanha: digitados por ela, ainda não faturados e com produtos da campanha.
 * O valor de cada pedido é só o dos itens da campanha; os produtos aparecem ao clicar no pedido.
 */
export default function CampaignPedidosPendentesPage({ tipo = 'pendentes' }: { tipo?: TipoPedidos }) {
  const excluidos = tipo === 'excluidos'
  const { id } = useParams<{ id: string }>()
  const idCampaign = Number(id)
  const [params] = useSearchParams()
  const competencia = params.get('competencia') ?? defaultCompetencia()
  const { idPessoa } = useUsuario()
  const { ehGestor, carregando: carregandoGestor } = useGestor(idPessoa)
  const pessoaParam = Number(params.get('pessoa')) || null
  const idAlvo = pessoaParam ? (ehGestor ? pessoaParam : carregandoGestor ? null : idPessoa) : idPessoa
  const [abertos, setAbertos] = useState<ReadonlySet<number>>(new Set())

  const resumos = useApiResource((signal) => getCampaignSummaryPerPeriod(competencia, signal), [competencia])
  const pendentes = useApiResource(
    (signal) => (idAlvo ? getPedidosPendentes(idCampaign, idAlvo, signal, tipo) : Promise.resolve(null)),
    [idCampaign, idAlvo, tipo],
  )
  const linhas = pendentes.data?.itens ?? []
  const { ordenadas, ord, alternar } = useOrdenacao(linhas, {
    pedido: (p) => p.idPedido,
    cliente: (p) => p.nomeCliente,
    data: (p) => p.dataPedido,
    situacao: (p) => p.situacao,
    valor: (p) => p.valorCampanha,
  })

  if (!Number.isInteger(idCampaign) || idCampaign <= 0) return <NotFoundPage />

  const titulo = resumos.data?.find((s) => s.idCampaign === idCampaign)?.campaignDescription
  const voltar = `/campaigns/details/${idCampaign}/pedidos?competencia=${competencia}${pessoaParam ? `&pessoa=${pessoaParam}` : ''}`

  /** Baixa os pedidos da lista (na ordem da tela). */
  function baixarExcel() {
    exportarExcel({
      arquivo: `pedidos-${excluidos ? 'excluidos' : 'pendentes'}-campanha-${idCampaign}-${competencia}`,
      aba: excluidos ? 'Excluídos' : 'Pendentes',
      linhas: ordenadas,
      totalizar: true,
      colunas: [
        { titulo: 'Pedido', tipo: 'numero', largura: 12, valor: (p) => p.idPedido },
        { titulo: 'Pré-pedido', tipo: 'numero', largura: 12, valor: (p) => p.idPrePedido },
        { titulo: 'Cód. cliente', tipo: 'numero', largura: 12, valor: (p) => p.idCliente },
        { titulo: 'Cliente', largura: 40, valor: (p) => p.nomeCliente },
        { titulo: 'Data do pedido', largura: 14, valor: (p) => dayjs(p.dataPedido).format('DD/MM/YYYY') },
        { titulo: 'Situação', largura: 18, valor: (p) => p.situacao },
        { titulo: 'Itens da campanha', tipo: 'numero', largura: 12, valor: (p) => p.itens },
        { titulo: 'Valor da campanha', tipo: 'moeda', largura: 16, valor: (p) => p.valorCampanha },
        { titulo: 'Valor do pedido', tipo: 'moeda', largura: 16, valor: (p) => p.valorPedido },
      ],
    })
  }

  function alternarPedido(idPedido: number) {
    setAbertos((atual) => {
      const novo = new Set(atual)
      if (novo.has(idPedido)) novo.delete(idPedido)
      else novo.add(idPedido)
      return novo
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <Link
          to={voltar}
          aria-label="Voltar para os pedidos"
          className="flex h-8 items-center gap-1 rounded-md border border-github-border bg-github-bg-card px-2.5 text-sm text-github-text-muted hover:bg-github-bg-hover"
        >
          <ArrowLeft size={15} /> Pedidos
        </Link>
        <h1 className="text-lg font-semibold">{excluidos ? 'Pedidos excluídos' : 'Pedidos pendentes'}{titulo ? ` · ${titulo}` : ''}</h1>
      </div>

      <p className="text-sm text-github-text-muted">
        {excluidos ? 'Pedidos digitados e excluídos' : 'Pedidos digitados, ainda não faturados'}, com produtos desta campanha. O valor é só o dos itens da campanha; toque no pedido para ver os produtos.
      </p>

      {pendentes.loading && <div className="h-40 animate-pulse rounded-xl border border-github-border bg-github-bg-card" aria-busy="true" />}
      {pendentes.error && <ErrorState message={pendentes.error} onRetry={pendentes.reload} />}
      {!idAlvo && !carregandoGestor && <EmptyState message="Seu usuário não está ligado a uma pessoa do televendas." />}
      {pendentes.data && linhas.length === 0 && <EmptyState message={excluidos ? 'Nenhum pedido excluído com produtos desta campanha.' : 'Nenhum pedido pendente com produtos desta campanha.'} />}

      {pendentes.data && linhas.length > 0 && idAlvo && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-github-text-muted">
              <strong className="font-semibold text-github-text">{pendentes.data.totalPedidos.toLocaleString('pt-BR')}</strong>{' '}
              {pendentes.data.totalPedidos === 1 ? 'pedido' : 'pedidos'} · valor da campanha{' '}
              <strong className="font-semibold text-github-text">{formatCurrency(pendentes.data.valorCampanha)}</strong>
            </p>
            <BotaoExportarExcel total={ordenadas.length} onClick={baixarExcel} />
          </div>
          <div className="overflow-x-auto rounded-xl border border-github-border bg-github-bg-card">
            <table className="w-full text-left text-sm">
              <thead className="text-[11px] uppercase tracking-wide text-github-text-muted">
                <tr className="border-b border-github-border">
                  <ThOrdenavel rotulo="Pedido" chave="pedido" ord={ord} onAlternar={alternar} className="py-2 pl-3 font-medium" />
                  <ThOrdenavel rotulo="Cliente" chave="cliente" ord={ord} onAlternar={alternar} className="px-2 py-2 font-medium" />
                  <ThOrdenavel rotulo="Data" chave="data" ord={ord} onAlternar={alternar} className="hidden px-2 py-2 font-medium sm:table-cell" />
                  <ThOrdenavel rotulo="Situação" chave="situacao" ord={ord} onAlternar={alternar} className="hidden px-2 py-2 font-medium md:table-cell" />
                  <ThOrdenavel rotulo="Valor da campanha" chave="valor" ord={ord} onAlternar={alternar} direita className="whitespace-nowrap py-2 pl-2 pr-3 text-right font-medium" />
                </tr>
              </thead>
              <tbody>
                {ordenadas.map((p) => {
                  const aberto = abertos.has(p.idPedido)
                  return (
                    <Fragment key={p.idPedido}>
                      <tr className="border-b border-github-border hover:bg-github-bg-hover">
                        <td className="py-2 pl-3">
                          <button
                            type="button"
                            onClick={() => alternarPedido(p.idPedido)}
                            aria-expanded={aberto}
                            className="flex items-center gap-1 font-medium"
                          >
                            {aberto ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            {p.idPedido}
                          </button>
                        </td>
                        <td className="max-w-[16rem] truncate px-2 py-2" title={p.nomeCliente ?? ''}>
                          {p.nomeCliente ?? '-'} <span className="text-xs text-github-text-muted">{p.idCliente}</span>
                        </td>
                        <td className="hidden whitespace-nowrap px-2 py-2 text-github-text-muted sm:table-cell">{dayjs(p.dataPedido).format('DD/MM/YYYY')}</td>
                        <td className="hidden whitespace-nowrap px-2 py-2 md:table-cell">
                          <span className="inline-block rounded bg-github-bg-hover px-1.5 text-[11px] font-medium text-github-text-muted">{p.situacao}</span>
                        </td>
                        <td className="whitespace-nowrap py-2 pl-2 pr-3 text-right">
                          <span className="font-semibold">{formatCurrency(p.valorCampanha)}</span>
                          <span className="block text-[10px] text-github-text-muted">
                            {p.itens} {p.itens === 1 ? 'item' : 'itens'} · pedido {formatCurrency(p.valorPedido)}
                          </span>
                        </td>
                      </tr>
                      {aberto && (
                        <tr className="border-b border-github-border bg-github-bg-hover/50">
                          <td colSpan={5} className="px-3 py-2">
                            <ItensDoPedido idCampaign={idCampaign} idPedido={p.idPedido} idPessoa={idAlvo} />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
