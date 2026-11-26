import { api } from '@shared/services/api'

/** Competência disponível no painel (GET /api/prospeccao/meses): a data de MesCompetencia, ex.: 2026-10-31. */
export interface ProspeccaoMes {
  competencia: string
  clientes: number
}

/** Cliente do painel de prospecção (GET /api/prospeccao/clientes). */
export interface ProspeccaoCliente {
  idCliente: number
  nomeCliente: string | null
  idPessoaTelevendas: number | null
  nomeDigitador: string | null
  /** Quantos meses seguidos em prospecção (1, 2 ou 3). */
  sequenciaMeses: number | null
  tipoProspeccao: string | null
  totalFaturado: number
  faturamentoLojaVirtual: number
  faturamentoInternet: number
  mesCompetencia: string
}

/** Totais por operadora no mês (GET /api/prospeccao/resumo). */
export interface ProspeccaoResumo {
  idPessoaTelevendas: number | null
  nomeDigitador: string | null
  /** Clientes distintos do painel no mês (mesma conta da planilha: TotalPositivado). */
  totalPositivado: number
  totalFaturado: number
  totalLojaVirtual: number
  totalInternet: number
  /** Positivados necessários para ganhar prêmio. */
  metaPositivados: number
  /** 0 enquanto não bater a meta de positivados. */
  premio: number
}

/** Cliente da carteira de prospecção de uma operadora (GET /api/prospeccao/carteira). */
export interface ProspeccaoCarteira {
  idPessoaTelevendas: number
  nomeDigitador: string | null
  idCliente: number
  nomeCliente: string | null
  dataCadastroCliente: string | null
  limiteUtilizado: number
  telefone: string | null
  telefone2: string | null
  /** Já aparece no painel de prospecção do mês (vendeu). */
  noPainel: boolean
  /** Vendas do cliente nos últimos 3 meses (pedidos faturados e com devolução parcial, de qualquer operador). */
  vendas3Meses: number
}

/** Carteira do mês atual inteiro; `idPessoaTelevendas`: só dessa operadora (o gestor escolhe uma). */
export async function getProspeccaoCarteira(
  idPessoaTelevendas: number | null,
  signal?: AbortSignal,
): Promise<ProspeccaoCarteira[]> {
  const response = await api.get<ProspeccaoCarteira[]>('prospeccao/carteira', {
    params: { ...(idPessoaTelevendas ? { idPessoaTelevendas } : {}) },
    signal,
  })
  return response.data
}

export async function getProspeccaoMeses(signal?: AbortSignal): Promise<ProspeccaoMes[]> {
  const response = await api.get<ProspeccaoMes[]>('prospeccao/meses', { signal })
  return response.data
}

/** `competencia`: a data de MesCompetencia (YYYY-MM-DD). `idPessoaTelevendas`: só os clientes dessa pessoa; `null` = de todos (gestor). */
export async function getProspeccaoClientes(
  competencia: string,
  idPessoaTelevendas: number | null,
  signal?: AbortSignal,
): Promise<ProspeccaoCliente[]> {
  const response = await api.get<ProspeccaoCliente[]>('prospeccao/clientes', {
    params: { competencia, ...(idPessoaTelevendas ? { idPessoaTelevendas } : {}) },
    signal,
  })
  return response.data
}

export async function getProspeccaoResumo(
  competencia: string,
  idPessoaTelevendas: number | null,
  signal?: AbortSignal,
): Promise<ProspeccaoResumo[]> {
  const response = await api.get<ProspeccaoResumo[]>('prospeccao/resumo', {
    params: { competencia, ...(idPessoaTelevendas ? { idPessoaTelevendas } : {}) },
    signal,
  })
  return response.data
}
