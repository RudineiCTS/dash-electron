import { api } from '@shared/services/api'

export interface Tela {
  caminho: string
  rotulo: string
}

export interface UsuarioAdmin {
  id: number
  loginAd: string
  nome: string
  idPessoaTelevendas: number | null
  administrador: boolean
  ativo: boolean
  telas: string[]
  dataCadastro: string
  dataUltimoAcesso: string | null
}

export interface UsuarioSalvar {
  /** Só na criação. */
  loginAd?: string
  nome: string
  idPessoaTelevendas: number | null
  administrador: boolean
  ativo: boolean
  telas: string[]
}

/** Perfis prontos: marcam as telas de partida; depois dá para ajustar uma a uma. */
export const PERFIS: { nome: string; telas: string[] }[] = [
  { nome: 'Fidelização', telas: ['/campaigns', '/fidelizacao'] },
  { nome: 'Exclusivas', telas: ['/campaigns', '/exclusivas'] },
  { nome: 'Prospecção', telas: ['/campaigns', '/prospeccao'] },
  { nome: 'SAC', telas: ['/sac'] },
  {
    nome: 'Supervisão',
    telas: ['/campaigns', '/prospeccao', '/fidelizacao', '/sac', '/exclusivas', '/oportunidades', '/parametros'],
  },
]

export async function getTelas(signal?: AbortSignal): Promise<Tela[]> {
  const response = await api.get<Tela[]>('usuarios/telas', { signal })
  return response.data
}

export async function getUsuarios(signal?: AbortSignal): Promise<UsuarioAdmin[]> {
  const response = await api.get<UsuarioAdmin[]>('usuarios', { signal })
  return response.data
}

export async function criarUsuario(dto: UsuarioSalvar): Promise<UsuarioAdmin> {
  const response = await api.post<UsuarioAdmin>('usuarios', dto)
  return response.data
}

export async function atualizarUsuario(id: number, dto: UsuarioSalvar): Promise<UsuarioAdmin> {
  const response = await api.put<UsuarioAdmin>(`usuarios/${id}`, dto)
  return response.data
}
