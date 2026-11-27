import { api } from '@shared/services/api'

/** Quem está logado e o que enxerga (resposta de POST /api/auth/login e GET /api/auth/me). */
export interface UsuarioSessao {
  login: string
  nome: string
  idPessoaTelevendas: number | null
  administrador: boolean
  /** Perfil Supervisão: vê tudo (todas as pessoas) menos Usuários e Parâmetros; não precisa de pessoa do televendas. */
  supervisao: boolean
  /** Caminhos das telas liberadas (ex.: "/campaigns", "/fidelizacao"). */
  telas: string[]
}

export interface Sessao {
  token: string
  /** ISO 8601 (UTC). */
  expiraEm: string
  usuario: UsuarioSessao
}

const CHAVE = 'compass-web:sessao'

/** Evento disparado quando a API recusa o token (sessão expirada): o contexto limpa a sessão e volta ao login. */
export const EVENTO_SESSAO_EXPIRADA = 'compass:sessao-expirada'

/** Lê a sessão guardada nesta aba; descarta se já expirou. A senha nunca é guardada, só o token. */
export function lerSessao(): Sessao | null {
  try {
    const bruto = sessionStorage.getItem(CHAVE)
    if (!bruto) return null
    const sessao = JSON.parse(bruto) as Sessao
    if (!sessao.token || new Date(sessao.expiraEm).getTime() <= Date.now()) {
      sessionStorage.removeItem(CHAVE)
      return null
    }
    return sessao
  } catch {
    return null
  }
}

export function salvarSessao(sessao: Sessao | null) {
  try {
    if (sessao) sessionStorage.setItem(CHAVE, JSON.stringify(sessao))
    else sessionStorage.removeItem(CHAVE)
  } catch {
    // sem sessionStorage (modo privado etc.): a sessão só vale até recarregar
  }
}

export function tokenAtual(): string | null {
  return lerSessao()?.token ?? null
}

/** Usuário e senha do Windows. A API confere no Active Directory; erros trazem `mensagem`. */
export async function entrar(login: string, senha: string): Promise<Sessao> {
  const response = await api.post<{ token: string; expiraEm: string; usuario: UsuarioSessao }>('auth/login', { login, senha })
  return response.data
}

/** Dados atuais do usuário do token (as telas refletem o cadastro de agora). */
export async function getMe(signal?: AbortSignal): Promise<UsuarioSessao> {
  const response = await api.get<UsuarioSessao>('auth/me', { signal })
  return response.data
}
