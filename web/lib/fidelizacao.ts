import { api } from '@shared/services/api'

/** Período de apuração (GET /api/fidelizacao/periodos). */
export interface FidelizacaoPeriodo {
  idPeriodo: number
  dataInicio: string
  dataFim: string
}

/** Uma pessoa em um KPI no período (GET /api/fidelizacao/resultado). */
export interface FidelizacaoLinha {
  idPessoa: number
  pessoa: string | null
  idSupervisor: number | null
  tipoPessoa: string | null
  idKpi: number | null
  codigoKpi: string | null
  nomeKpi: string | null
  descricaoKpi: string | null
  valorPremio: number
  valorApurado: number
  valorMeta: number
  /** Percentual realizado (100 = meta batida). */
  realizado: number
  dataCalculo: string | null
}

export async function getFidelizacaoPeriodos(signal?: AbortSignal): Promise<FidelizacaoPeriodo[]> {
  const response = await api.get<FidelizacaoPeriodo[]>('fidelizacao/periodos', { params: { quantidade: 12 }, signal })
  return response.data
}

/** `idPessoa`: só o resultado dessa pessoa; `null` = do time todo (visão do gestor). */
export async function getFidelizacaoResultado(
  idPeriodo: number,
  idPessoa: number | null,
  signal?: AbortSignal,
): Promise<FidelizacaoLinha[]> {
  const response = await api.get<FidelizacaoLinha[]>('fidelizacao/resultado', {
    params: { idPeriodo, ...(idPessoa ? { idPessoa } : {}) },
    signal,
  })
  return response.data
}
