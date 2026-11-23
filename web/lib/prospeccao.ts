import { api } from '@shared/services/api'

/** Mês disponível no painel (GET /api/prospeccao/meses). */
export interface ProspeccaoMes {
  ano: number
  mes: number
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
}

export async function getProspeccaoMeses(signal?: AbortSignal): Promise<ProspeccaoMes[]> {
  const response = await api.get<ProspeccaoMes[]>('prospeccao/meses', { signal })
  return response.data
}

/** `referencia`: qualquer dia do mês (YYYY-MM-DD). `idPessoaTelevendas`: só os clientes dessa pessoa; `null` = de todos (gestor). */
export async function getProspeccaoClientes(
  referencia: string,
  idPessoaTelevendas: number | null,
  signal?: AbortSignal,
): Promise<ProspeccaoCliente[]> {
  const response = await api.get<ProspeccaoCliente[]>('prospeccao/clientes', {
    params: { referencia, ...(idPessoaTelevendas ? { idPessoaTelevendas } : {}) },
    signal,
  })
  return response.data
}

export async function getProspeccaoResumo(
  referencia: string,
  idPessoaTelevendas: number | null,
  signal?: AbortSignal,
): Promise<ProspeccaoResumo[]> {
  const response = await api.get<ProspeccaoResumo[]>('prospeccao/resumo', {
    params: { referencia, ...(idPessoaTelevendas ? { idPessoaTelevendas } : {}) },
    signal,
  })
  return response.data
}
