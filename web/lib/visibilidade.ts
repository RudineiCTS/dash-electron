import { api } from '@shared/services/api'

/** Regra de ocultação de uma campanha: o que some para quem não é administrador. */
export interface VisibilidadeCampanha {
  idCampaign: number
  /** Esconde o prêmio (e o pote). */
  hidePrize: boolean
  /** Esconde o apurado (valor realizado e percentual). */
  hideAssessed: boolean
}

/** GET api/campaign-visibility — só administrador. Devolve só as campanhas com alguma regra. */
export async function getVisibilidades(signal?: AbortSignal): Promise<VisibilidadeCampanha[]> {
  const response = await api.get<VisibilidadeCampanha[]>('campaign-visibility', { signal })
  return response.data
}

/** PUT api/campaign-visibility/{id} — só administrador. Com os dois falsos a regra é removida. */
export async function salvarVisibilidade(idCampaign: number, hidePrize: boolean, hideAssessed: boolean): Promise<void> {
  await api.put(`campaign-visibility/${idCampaign}`, { hidePrize, hideAssessed })
}

/** Indexa as regras por campanha. */
export function indexarVisibilidades(regras: VisibilidadeCampanha[]): Map<number, VisibilidadeCampanha> {
  return new Map(regras.map((r) => [r.idCampaign, r]))
}
