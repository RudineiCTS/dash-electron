import axios, { isAxiosError } from 'axios'
import { api } from '@shared/services/api'
import type { UsuarioSessao } from './sessao'

/** Resposta das rotas de login da API (api/web-auth/*). */
export interface ResultadoAuth {
  success: boolean
  errorMessage?: string | null
  /** "autenticado" | "confirmar-email" | "codigo-enviado" */
  etapa?: string | null
  accessToken?: string | null
  expiraEm?: string | null
  desafioToken?: string | null
  emailMascarado?: string | null
  esperarSegundos?: number | null
  usuario?: UsuarioSessao | null
}

/** Falha de login já com texto pronto para mostrar. */
export class ErroAuth extends Error {
  readonly status?: number
  readonly esperarSegundos?: number

  constructor(mensagem: string, status?: number, esperarSegundos?: number) {
    super(mensagem)
    this.name = 'ErroAuth'
    this.status = status
    this.esperarSegundos = esperarSegundos
  }
}

/**
 * As rotas de login usam o axios "puro" (não o `api` com interceptors): lá, 401 é só "senha errada" e não
 * pode disparar o "sessão expirada". A URL base é a mesma, definida em `configureHttp`.
 */
async function post(caminho: string, corpo: object): Promise<ResultadoAuth> {
  try {
    const { data } = await axios.post<ResultadoAuth>(`${api.defaults.baseURL ?? ''}/web-auth/${caminho}`, corpo)
    return data
  } catch (e) {
    if (isAxiosError(e)) {
      const dados = e.response?.data as Partial<ResultadoAuth> | undefined
      if (e.response) {
        const padrao =
          e.response.status === 429
            ? 'Muitas tentativas. Aguarde um pouco e tente de novo.'
            : 'Não foi possível concluir. Tente de novo.'
        throw new ErroAuth(dados?.errorMessage || padrao, e.response.status, dados?.esperarSegundos ?? undefined)
      }
      throw new ErroAuth('Sem conexão com o servidor. Verifique se você está na rede da empresa.')
    }
    throw e
  }
}

export const login = (identificador: string, senha: string) => post('login', { identificador, senha })
export const confirmarLogin = (desafioToken: string, codigo: string) => post('login/confirmar', { desafioToken, codigo })
export const reenviarCodigo = (desafioToken: string) => post('login/reenviar', { desafioToken })
export const solicitarSenha = (identificador: string) => post('senha/solicitar', { identificador })
export const definirSenha = (desafioToken: string, codigo: string, novaSenha: string) =>
  post('senha/definir', { desafioToken, codigo, novaSenha })

/** Usuário da sessão atual (exige o token; 401 dispara o "sessão expirada" do interceptor). */
export async function buscarUsuarioAtual(signal?: AbortSignal): Promise<UsuarioSessao> {
  const { data } = await api.get<UsuarioSessao>('web-auth/me', { signal })
  return data
}

/**
 * Avisa a API que o usuário saiu (só auditoria). O token vai explícito porque, quando isto roda, a sessão local já
 * foi apagada e o interceptor não teria mais de onde ler.
 */
export async function registrarLogout(accessToken: string): Promise<void> {
  await api.post('web-auth/logout', null, { headers: { Authorization: `Bearer ${accessToken}` } })
}
