import dayjs from 'dayjs'
import { ErrorState } from './StateViews'
import { getExclusivasPedidos } from '../lib/exclusivas'
import { formatCurrency } from '../lib/format'
import { useApiResource } from '../lib/useApiResource'

interface PedidosDoClienteExclusivaProps {
  referencia: string
  idPessoaCliente: number
  industria: string | null
  /** Só os pedidos desse operador; `null` = de todos. */
  idPessoa: number | null
}

function data(valor: string | null) {
  return valor ? dayjs(valor).format('DD/MM/YYYY') : '-'
}

/** Pré-pedidos do cliente no mês, em uma indústria; carrega só quando a linha é aberta. */
export function PedidosDoClienteExclusiva({ referencia, idPessoaCliente, industria, idPessoa }: PedidosDoClienteExclusivaProps) {
  const pedidos = useApiResource(
    (signal) => getExclusivasPedidos(referencia, idPessoaCliente, industria, idPessoa, signal),
    [referencia, idPessoaCliente, industria, idPessoa],
  )

  if (pedidos.loading) return <div className="h-12 animate-pulse rounded-lg bg-github-bg-hover" aria-busy="true" />
  if (pedidos.error) return <ErrorState message={pedidos.error} onRetry={pedidos.reload} />
  if (!pedidos.data || pedidos.data.length === 0) {
    return <p className="text-sm text-github-text-muted">Nenhum pedido encontrado para este cliente.</p>
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-github-border bg-github-bg">
      <table className="w-full text-left text-xs">
        <thead className="bg-github-bg-hover text-[10px] uppercase tracking-wide text-github-text-muted">
          <tr>
            <th className="py-1.5 pl-3 font-medium">Pré-pedido</th>
            <th className="px-2 py-1.5 font-medium">Pedidos</th>
            <th className="px-2 py-1.5 font-medium">Faturamento</th>
            <th className="px-2 py-1.5 text-right font-medium">Venda</th>
            <th className="px-2 py-1.5 text-right font-medium">Devolução</th>
            <th className="px-2 py-1.5 text-right font-medium">Líquido</th>
            <th className="py-1.5 pl-2 pr-3 font-medium">Situação</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.data.map((p) => (
            <tr key={`${p.idPrePedido}-${p.idPedido}`} className="border-t border-github-border">
              <td className="py-1.5 pl-3 font-medium">{p.idPrePedido ?? '-'}</td>
              <td className="max-w-[14rem] truncate px-2 py-1.5" title={p.idPedido ?? ''}>
                {p.idPedido ?? '-'}
              </td>
              <td className="whitespace-nowrap px-2 py-1.5">{data(p.dataFaturamento)}</td>
              <td className="whitespace-nowrap px-2 py-1.5 text-right">{formatCurrency(p.venda)}</td>
              <td className="whitespace-nowrap px-2 py-1.5 text-right">{formatCurrency(p.devolucao)}</td>
              <td className="whitespace-nowrap px-2 py-1.5 text-right font-semibold">{formatCurrency(p.totalVenda)}</td>
              <td className="py-1.5 pl-2 pr-3">
                {p.positivou ? (
                  <span className="inline-block whitespace-nowrap rounded bg-[#639922]/15 px-1.5 text-[11px] font-medium text-[#639922]">
                    Positivou
                  </span>
                ) : (
                  <span className="text-github-text-muted">-</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
