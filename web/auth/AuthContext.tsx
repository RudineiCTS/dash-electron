import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { buscarUsuarioAtual, confirmarLogin, definirSenha, login, registrarLogout, reenviarCodigo, solicitarSenha, type ResultadoAuth } from './authApi'
import { assinarSessao, atualizarUsuario, definirSessao, obterSessao, type Sessao, type UsuarioSessao } from './sessao'

/** Etapa entre a senha (ou o pedido de nova senha) e o código do e-mail. Fica só em memória: F5 recomeça. */
export interface Desafio {
  token: string
  /** "login" = confirmar o e-mail do dia; "senha" = primeiro acesso / esqueci a senha. */
  tipo: 'login' | 'senha'
  emailMascarado: string
  /** Quando (ms desde 1970) dá para pedir outro código. */
  reenviarEm: number
}

interface AuthContextValue {
  sessao: Sessao | null
  usuario: UsuarioSessao | null
  desafio: Desafio | null
  /** Devolve "autenticado" ou "confirmar-email". Lança ErroAuth com o texto para mostrar. */
  entrar: (identificador: string, senha: string) => Promise<'autenticado' | 'confirmar-email'>
  confirmar: (codigo: string) => Promise<void>
  reenviar: () => Promise<void>
  solicitarSenha: (identificador: string) => Promise<void>
  definirSenha: (codigo: string, novaSenha: string) => Promise<void>
  sair: () => void
  cancelarDesafio: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function semSessaoValida(): never {
  throw new Error('Etapa de confirmação expirada. Volte e entre de novo.')
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const sessao = useSyncExternalStore(assinarSessao, obterSessao)
  const [desafio, setDesafio] = useState<Desafio | null>(null)

  const aplicar = useCallback((resultado: ResultadoAuth, tipo: Desafio['tipo']) => {
    if (resultado.etapa === 'autenticado' && resultado.accessToken && resultado.expiraEm && resultado.usuario) {
      setDesafio(null)
      definirSessao({ accessToken: resultado.accessToken, expiraEm: resultado.expiraEm, usuario: resultado.usuario })
      return
    }
    if (resultado.desafioToken) {
      setDesafio({
        token: resultado.desafioToken,
        tipo,
        emailMascarado: resultado.emailMascarado ?? '',
        reenviarEm: Date.now() + (resultado.esperarSegundos ?? 60) * 1000,
      })
    }
  }, [])

  // a sessão acaba sozinha quando o token vence (fim do dia)
  useEffect(() => {
    if (!sessao) return
    const faltam = Date.parse(sessao.expiraEm) - Date.now()
    if (faltam <= 0) {
      definirSessao(null)
      return
    }
    const timer = setTimeout(() => definirSessao(null), Math.min(faltam, 2_147_000_000))
    return () => clearTimeout(timer)
  }, [sessao])

  // ao recarregar a página com sessão guardada, confere com a API e traz o usuário atualizado (ex.: idPessoa)
  const token = sessao?.accessToken
  useEffect(() => {
    if (!token) return
    const controller = new AbortController()
    buscarUsuarioAtual(controller.signal)
      .then((usuario) => atualizarUsuario(usuario))
      .catch(() => {
        // 401 já encerra a sessão pelo interceptor; outro erro (rede) mantém a sessão como está
      })
    return () => controller.abort()
  }, [token])

  const entrar = useCallback(
    async (identificador: string, senha: string) => {
      const resultado = await login(identificador.trim(), senha)
      aplicar(resultado, 'login')
      return resultado.etapa === 'autenticado' ? ('autenticado' as const) : ('confirmar-email' as const)
    },
    [aplicar]
  )

  const confirmar = useCallback(
    async (codigo: string) => {
      if (!desafio || desafio.tipo !== 'login') return semSessaoValida()
      aplicar(await confirmarLogin(desafio.token, codigo.trim()), 'login')
    },
    [desafio, aplicar]
  )

  const reenviar = useCallback(async () => {
    if (!desafio) return semSessaoValida()
    aplicar(await reenviarCodigo(desafio.token), desafio.tipo)
  }, [desafio, aplicar])

  const solicitar = useCallback(
    async (identificador: string) => {
      aplicar(await solicitarSenha(identificador.trim()), 'senha')
    },
    [aplicar]
  )

  const definir = useCallback(
    async (codigo: string, novaSenha: string) => {
      if (!desafio || desafio.tipo !== 'senha') return semSessaoValida()
      aplicar(await definirSenha(desafio.token, codigo.trim(), novaSenha), 'senha')
    },
    [desafio, aplicar]
  )

  const sair = useCallback(() => {
    const token = obterSessao()?.accessToken
    if (token) {
      registrarLogout(token).catch(() => {
        // só auditoria: se falhar, a saída vale do mesmo jeito
      })
    }
    setDesafio(null)
    definirSessao(null)
  }, [])

  const cancelarDesafio = useCallback(() => setDesafio(null), [])

  const value = useMemo<AuthContextValue>(
    () => ({
      sessao,
      usuario: sessao?.usuario ?? null,
      desafio,
      entrar,
      confirmar,
      reenviar,
      solicitarSenha: solicitar,
      definirSenha: definir,
      sair,
      cancelarDesafio,
    }),
    [sessao, desafio, entrar, confirmar, reenviar, solicitar, definir, sair, cancelarDesafio]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  return context
}
