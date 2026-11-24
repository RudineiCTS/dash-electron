import { api } from '@shared/services/api'

/** Perfil de acesso de uma pessoa (GET /api/acesso/{idPessoa}). */
export interface Acesso {
  idPessoa: number
  idTipoPessoa: number
  tipoPessoa: string | null
  /** Supervisora e auxiliar de supervisão: todos os acessos. */
  gestao: boolean
  /** Caminhos das abas liberadas (ex.: "/campaigns", "/fidelizacao"). */
  abas: string[]
}

/** A API responde 404 se a pessoa não está na base de televendas. */
export async function getAcesso(idPessoa: number, signal?: AbortSignal): Promise<Acesso> {
  const response = await api.get<Acesso>(`acesso/${idPessoa}`, { signal })
  return response.data
}
