import { api } from '@shared/services/api'

/** Totais de uma indústria no mês (GET /api/exclusivas/resumo). */
export interface ExclusivaResumo {
  industria: string | null
  operadores: number
  clientes: number
  /** Clientes distintos positivados no mês. */
  positivados: number
  totalVenda: number
  geradoEm: string | null
}

/** Resultado de um cliente por indústria e operador (GET /api/exclusivas/clientes). */
export interface ExclusivaCliente {
  industria: string | null
  digitador: string | null
  idPessoaTelevendas: number | null
  idPessoaCliente: number | null
  razaoSocial: string | null
  pedidos: number
  venda: number
  devolucao: number
  totalVenda: number
  primeiraCompra: string | null
  ultimaCompra: string | null
  positivou: boolean
}

/** Um pré-pedido do cliente no mês (GET /api/exclusivas/pedidos). */
export interface ExclusivaPedido {
  industria: string | null
  digitador: string | null
  idPrePedido: number | null
  /** Pedidos do pré-pedido, separados por vírgula. */
  idPedido: string | null
  venda: number
  devolucao: number
  totalVenda: number
  dataFaturamento: string | null
  /** Este pré-pedido foi o que positivou o cliente no mês. */
  positivou: boolean
}

export async function getExclusivasPedidos(
  referencia: string,
  idPessoaCliente: number,
  industria: string | null,
  idPessoaTelevendas: number | null,
  signal?: AbortSignal,
): Promise<ExclusivaPedido[]> {
  const response = await api.get<ExclusivaPedido[]>('exclusivas/pedidos', {
    params: {
      referencia,
      idPessoaCliente,
      ...(industria ? { industria } : {}),
      ...(idPessoaTelevendas ? { idPessoaTelevendas } : {}),
    },
    signal,
  })
  return response.data
}

/**
 * `referencia`: qualquer dia do mês, em YYYY-MM-DD.
 * `idPessoaTelevendas`: só os resultados dessa pessoa; `null` = de todos (visão do gestor).
 */
export async function getExclusivasResumo(
  referencia: string,
  idPessoaTelevendas: number | null,
  signal?: AbortSignal,
): Promise<ExclusivaResumo[]> {
  const response = await api.get<ExclusivaResumo[]>('exclusivas/resumo', {
    params: { referencia, ...(idPessoaTelevendas ? { idPessoaTelevendas } : {}) },
    signal,
  })
  return response.data
}

export async function getExclusivasClientes(
  referencia: string,
  idPessoaTelevendas: number | null,
  signal?: AbortSignal,
): Promise<ExclusivaCliente[]> {
  const response = await api.get<ExclusivaCliente[]>('exclusivas/clientes', {
    params: { referencia, ...(idPessoaTelevendas ? { idPessoaTelevendas } : {}) },
    signal,
  })
  return response.data
}
