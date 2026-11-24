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

/** GET api/campaign-orders/{idCampaign}/person/{idPersonSales} */
export async function getPedidosDaPessoa(
  idCampaign: number,
  idPersonSales: number,
  signal?: AbortSignal,
): Promise<PedidosCampanha> {
  const response = await api.get<PedidosCampanha>(`campaign-orders/${idCampaign}/person/${idPersonSales}`, { signal })
  return response.data
}
