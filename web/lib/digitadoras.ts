import { api } from '@shared/services/api'

/** Linha de GET api/televendas-base-digitadoras (tblCampanhaTelevendasBaseDigitadoras). */
export interface Digitadora {
  idPersonSales: number
  operatorName: string
  idSupervisor: number
  supervisorName: string
  idSector: number
}

/** Todas as digitadoras, em ordem alfabética, uma por pessoa. */
export async function getDigitadoras(signal?: AbortSignal): Promise<Digitadora[]> {
  const response = await api.get<Digitadora[]>('televendas-base-digitadoras', { signal })
  return response.data
}

/** Consulta uma pessoa pelo IDPessoaTelevendas. A API responde 404 se ela não existir na base. */
export async function getDigitadora(idPersonSales: number, signal?: AbortSignal): Promise<Digitadora> {
  const response = await api.get<Digitadora>(`televendas-base-digitadoras/${idPersonSales}`, { signal })
  return response.data
}
