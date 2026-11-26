import { api } from '@shared/services/api'

/** Pedido que a operadora digitou, ainda não foi faturado e tem itens da campanha. */
export interface PedidoPendenteCampanha {
  idPedido: number
  idPrePedido: number | null
  idCliente: number
  nomeCliente: string | null
  dataPedido: string
  idSituacao: number
  situacao: string
  /** Quantos itens do pedido são da campanha. */
  itens: number
  /** Soma só dos itens da campanha. */
  valorCampanha: number
  /** Total do pedido (informativo). */
  valorPedido: number
}

export interface PedidosPendentesCampanha {
  totalPedidos: number
  valorCampanha: number
  itens: PedidoPendenteCampanha[]
}

/** Item de um pedido pendente: o fabricante e se conta para a campanha. */
export interface ItemPedidoPendente {
  idProduto: number
  descProduto: string | null
  fabricante: string | null
  quantidade: number
  valorUnitario: number
  valorTotal: number
  daCampanha: boolean
}

export async function getPedidosPendentes(idCampaign: number, idPessoa: number, signal?: AbortSignal): Promise<PedidosPendentesCampanha> {
  const response = await api.get<PedidosPendentesCampanha>(`campanhas/${idCampaign}/pedidos-pendentes`, { params: { idPessoa }, signal })
  return response.data
}

export async function getItensPedidoPendente(
  idCampaign: number,
  idPedido: number,
  idPessoa: number,
  signal?: AbortSignal,
): Promise<ItemPedidoPendente[]> {
  const response = await api.get<ItemPedidoPendente[]>(`campanhas/${idCampaign}/pedidos-pendentes/${idPedido}/itens`, { params: { idPessoa }, signal })
  return response.data
}
