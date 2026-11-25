import { api } from '@shared/services/api'

/** Posição do usuário logado no ranking de uma campanha (GET api/campaign-ranking/mine). */
export interface PosicaoCampanha {
  idCampaign: number
  /** 1 = primeiro lugar. */
  ranking: number
  /** Total de posições do ranking ("7º de N"). */
  participants: number
}

/**
 * Minhas posições em todas as campanhas da competência, numa chamada só. A API identifica a pessoa pelo token
 * (login) e devolve só campanhas em que ela tem ranking; exige sessão, então só chame com usuário logado.
 */
export async function getMinhasPosicoes(competencia: string, signal?: AbortSignal): Promise<PosicaoCampanha[]> {
  const response = await api.get<PosicaoCampanha[]>('campaign-ranking/mine', {
    params: { competenceDateFrom: competencia },
    signal,
  })
  return response.data
}

/** Indexa por campanha para o card achar a sua posição direto. */
export function indexarPosicoes(posicoes: PosicaoCampanha[]): Map<number, PosicaoCampanha> {
  return new Map(posicoes.map((p) => [p.idCampaign, p]))
}
