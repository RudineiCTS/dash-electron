import { api } from '@shared/services/api'

export type CaminhoOportunidade = 'RECOMPRA' | 'OPORTUNIDADE_MES' | 'NOVO'

export interface ResumoCaminho {
  caminho: CaminhoOportunidade
  clientes: number
  prontos: number
  potencialMensal: number
  dataReferencia: string
}

export interface ClienteOportunidade {
  idCampanhaOportunidade: number
  idPessoaCliente: number
  nome: string | null
  caminho: CaminhoOportunidade
  /** OK | SEM_CREDITO | BLOQUEADO */
  situacao: string
  score: number
  porte: string
  curva: string | null
  potencialMensal: number
  maiorPrePedidoMes: number | null
  diasSemComprar: number | null
  cicloDias: number | null
  ticketMedio: number | null
  creditoDisponivel: number | null
  motivos: string | null
  alertas: string | null
}

export interface PaginaOportunidades {
  total: number
  pagina: number
  tamanho: number
  itens: ClienteOportunidade[]
}

export interface ItemSugerido {
  ordem: number
  idProduto: number
  produto: string | null
  quantidade: number
  valorUnitario: number
  /** REPETIR | REPOSICAO | AINDA_NAO_LEVOU */
  origem: string
  estoqueDisponivel: number | null
}

export interface ContatoCliente {
  idPessoaCliente: number
  nome: string | null
  razaoSocial: string | null
  telefones: { tipo: string; numero: string; principal: boolean }[]
}

/** Nome e telefones do cliente de uma oportunidade (cadastro do ERP). */
export async function getContatoOportunidade(idCampaign: number, idOportunidade: number, signal?: AbortSignal): Promise<ContatoCliente> {
  const response = await api.get<ContatoCliente>(`campanhas/${idCampaign}/oportunidades/${idOportunidade}/cliente`, { signal })
  return response.data
}

export async function getResumoOportunidades(idCampaign: number, signal?: AbortSignal): Promise<ResumoCaminho[]> {
  const response = await api.get<ResumoCaminho[]>(`campanhas/${idCampaign}/oportunidades/resumo`, { signal })
  return response.data
}

export async function getClientesOportunidades(
  idCampaign: number,
  caminho: CaminhoOportunidade,
  opcoes: {
    somenteProntos: boolean
    busca: string
    pagina: number
    tamanho: number
    /** chance (padrão), potencial, ticket, dias, nome ou codigo; a ordenação é feita no servidor. */
    ordenar?: string
    direcao?: 'asc' | 'desc'
  },
  signal?: AbortSignal,
): Promise<PaginaOportunidades> {
  const response = await api.get<PaginaOportunidades>(`campanhas/${idCampaign}/oportunidades`, {
    params: { caminho, ...opcoes, busca: opcoes.busca || undefined },
    signal,
  })
  return response.data
}

export async function getItensOportunidade(idCampaign: number, idOportunidade: number, signal?: AbortSignal): Promise<ItemSugerido[]> {
  const response = await api.get<ItemSugerido[]>(`campanhas/${idCampaign}/oportunidades/${idOportunidade}/itens`, { signal })
  return response.data
}
