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

/** `referencia`: qualquer dia do mês, em YYYY-MM-DD. */
export async function getExclusivasResumo(referencia: string, signal?: AbortSignal): Promise<ExclusivaResumo[]> {
  const response = await api.get<ExclusivaResumo[]>('exclusivas/resumo', { params: { referencia }, signal })
  return response.data
}

export async function getExclusivasClientes(referencia: string, signal?: AbortSignal): Promise<ExclusivaCliente[]> {
  const response = await api.get<ExclusivaCliente[]>('exclusivas/clientes', { params: { referencia }, signal })
  return response.data
}
