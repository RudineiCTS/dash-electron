import { api } from '@shared/services/api'

/** Um pedido/produto apurado (tblCampanhaTelevendasRetornoPedido, só ConsideradoNoApurado = 1). */
export interface PedidoCampanha {
  idOrder: number
  idProduct: number
  /** IDCliente; null se o pedido não tiver cliente. */
  idClient: number | null
  origin: number
  /** Coluna ValorCampanha. */
  total: number
  /** Coluna ValorDevolucao. */
  returnValue: number
}

export interface PedidosCampanha {
  /** Data da apuração (igual para todas as linhas); null se a pessoa não tem pedidos. */
  appraisalDate: string | null
  orders: PedidoCampanha[]
}

/** Um pedido (linhas agrupadas por pedido + cliente + origem), com os produtos dele. */
export interface PedidoAgrupado {
  /** Chave estável da linha: "pedido|cliente|origem". */
  chave: string
  idOrder: number
  idClient: number | null
  origin: number
  /** Soma de `total` dos produtos do pedido. */
  total: number
  /** Soma de `returnValue` dos produtos do pedido. */
  returnValue: number
  /** Produtos do pedido (as linhas originais), na ordem que a API mandou. */
  itens: PedidoCampanha[]
}

/**
 * Agrupa as linhas (uma por produto) por pedido + cliente + origem, somando total e devolução.
 * A ordem dos pedidos é a da API (por pedido). Soma em centavos para não acumular erro de ponto flutuante.
 */
export function agruparPedidos(linhas: PedidoCampanha[]): PedidoAgrupado[] {
  const grupos = new Map<string, PedidoAgrupado & { centavosTotal: number; centavosDevolucao: number }>()

  for (const linha of linhas) {
    const chave = `${linha.idOrder}|${linha.idClient ?? ''}|${linha.origin}`
    let grupo = grupos.get(chave)
    if (!grupo) {
      grupo = {
        chave,
        idOrder: linha.idOrder,
        idClient: linha.idClient,
        origin: linha.origin,
        total: 0,
        returnValue: 0,
        itens: [],
        centavosTotal: 0,
        centavosDevolucao: 0,
      }
      grupos.set(chave, grupo)
    }
    grupo.centavosTotal += Math.round(linha.total * 100)
    grupo.centavosDevolucao += Math.round(linha.returnValue * 100)
    grupo.itens.push(linha)
  }

  return [...grupos.values()].map(({ centavosTotal, centavosDevolucao, ...grupo }) => ({
    ...grupo,
    total: centavosTotal / 100,
    returnValue: centavosDevolucao / 100,
  }))
}

/** GET api/campaign-orders/{idCampaign}/person/{idPersonSales} */
export async function getPedidosDaPessoa(
  idCampaign: number,
  idPersonSales: number,
  signal?: AbortSignal,
): Promise<PedidosCampanha> {
  const response = await api.get<PedidosCampanha>(`campaign-orders/${idCampaign}/person/${idPersonSales}`, { signal })
  return response.data
}
