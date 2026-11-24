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
  /** Este operador não positivou, mas outro operador da mesma indústria já tinha positivado o cliente. */
  positivadoPorOutro: boolean
}

/** Carteira de uma indústria exclusiva no mês (GET /api/exclusivas/carteira/resumo). */
export interface CarteiraResumo {
  industria: string | null
  carteira: number
  positivados: number
  /** Clientes da carteira que ainda não positivaram. */
  pendentes: number
}

export type SituacaoCarteira = 'todos' | 'positivados' | 'pendentes'

/** Cliente da carteira (GET /api/exclusivas/carteira/clientes). */
export interface CarteiraCliente {
  idPessoaCliente: number
  nomeCliente: string | null
  positivou: boolean
  /** Operador que positivou (vazio se ainda não positivou). */
  digitador: string | null
  pedidos: number
  totalVenda: number
  primeiraCompra: string | null
}

export interface CarteiraPagina {
  total: number
  pagina: number
  tamanho: number
  itens: CarteiraCliente[]
}

/** `idPessoaTelevendas`: só as indústrias dessa pessoa; `null` = todas (gestor). */
export async function getCarteiraResumo(
  referencia: string,
  idPessoaTelevendas: number | null,
  signal?: AbortSignal,
): Promise<CarteiraResumo[]> {
  const response = await api.get<CarteiraResumo[]>('exclusivas/carteira/resumo', {
    params: { referencia, ...(idPessoaTelevendas ? { idPessoaTelevendas } : {}) },
    signal,
  })
  return response.data
}

export async function getCarteiraClientes(
  params: {
    referencia: string
    industria: string
    situacao: SituacaoCarteira
    busca: string
    pagina: number
    tamanho: number
    idPessoaTelevendas: number | null
  },
  signal?: AbortSignal,
): Promise<CarteiraPagina> {
  const { idPessoaTelevendas, busca, ...resto } = params
  const response = await api.get<CarteiraPagina>('exclusivas/carteira/clientes', {
    params: { ...resto, ...(busca.trim() ? { busca: busca.trim() } : {}), ...(idPessoaTelevendas ? { idPessoaTelevendas } : {}) },
    signal,
  })
  return response.data
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
