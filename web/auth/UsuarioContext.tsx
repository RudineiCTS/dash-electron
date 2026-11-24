import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getAcesso, type Acesso } from '../lib/acesso'
import { getDigitadora, type Digitadora } from '../lib/digitadoras'
import { EVENTO_SESSAO_EXPIRADA, entrar as entrarNaApi, lerSessao, salvarSessao, type Sessao } from '../lib/sessao'
import { useApiResource } from '../lib/useApiResource'

/**
 * SIMULAÇÃO DE USUÁRIO (só para desenvolvimento): quem usa o site escolhe uma pessoa no header e passa a
 * ver o sistema "como" ela, sem senha. Ligada em dev e DESLIGADA em build de produção, a menos que
 * VITE_PERMITIR_TROCA_USUARIO=true. Desligada, o site exige o login real (usuário e senha do Windows).
 * Com login real feito, ele vale mais do que a simulação.
 */
const flag = import.meta.env.VITE_PERMITIR_TROCA_USUARIO as string | undefined
export const PERMITIR_TROCA_USUARIO = flag === 'true' || (flag !== 'false' && import.meta.env.DEV)

const CHAVE = 'compass-web:usuario-simulado'

function lerSalvo(): number | null {
  try {
    const id = Number(localStorage.getItem(CHAVE))
    return Number.isInteger(id) && id > 0 ? id : null
  } catch {
    return null
  }
}

function salvar(id: number | null) {
  try {
    if (id) localStorage.setItem(CHAVE, String(id))
    else localStorage.removeItem(CHAVE)
  } catch {
    // sem localStorage (modo privado etc.): a escolha só vale até recarregar
  }
}

/** O que as telas consomem: elas usam `useUsuario()` sem saber se a identidade vem do login ou da simulação. */
interface UsuarioContextValue {
  /** IDPessoaTelevendas de quem está "logado", ou null. */
  idPessoa: number | null
  /** Cadastro da pessoa (nome, supervisor, setor), carregado de GET televendas-base-digitadoras/{id}. */
  usuario: Digitadora | null
  carregando: boolean
  erro: string | null
  /** Perfil de acesso (abas liberadas) de quem está logado; null sem usuário ou se a API não respondeu. */
  acesso: Acesso | null
  carregandoAcesso: boolean
  /** Caminhos das abas liberadas. Sem usuário (ou sem perfil), só Campanhas. */
  abasPermitidas: string[]
  /** Primeira aba liberada (onde a pessoa "cai" ao entrar). */
  primeiraAba: string
  /** Passa a ver o sistema como essa pessoa (null = sair). Só na simulação de desenvolvimento. */
  entrarComo: (idPessoa: number | null) => void

  /** Login real (Windows/AD) feito nesta aba. */
  sessao: Sessao | null
  /** O site exige login real para mostrar qualquer coisa (simulação desligada). */
  exigeLogin: boolean
  /** Administrador do Compass: vê todas as telas e cadastra usuários. */
  administrador: boolean
  /** Confere usuário e senha na API; lança erro com a mensagem a mostrar. */
  entrar: (login: string, senha: string) => Promise<void>
  sair: () => void
}

const UsuarioContext = createContext<UsuarioContextValue | undefined>(undefined)

/** Mensagem amigável para o erro do login (a API manda { mensagem } com 401/403/429/503). */
function mensagemDeLogin(err: unknown): string {
  const resp = (err as { response?: { data?: { mensagem?: string } } } | null)?.response
  if (resp?.data?.mensagem) return resp.data.mensagem
  if (resp) return 'Não foi possível entrar agora. Tente de novo em instantes.'
  return 'Sem conexão com o servidor. Verifique sua internet e tente de novo.'
}

export function UsuarioProvider({ children }: { children: ReactNode }) {
  const [sessao, setSessao] = useState<Sessao | null>(() => lerSessao())
  const [simulado, setSimulado] = useState<number | null>(() => (PERMITIR_TROCA_USUARIO ? lerSalvo() : null))

  // a API recusou o token: a sessão acabou
  useEffect(() => {
    const aoExpirar = () => setSessao(null)
    window.addEventListener(EVENTO_SESSAO_EXPIRADA, aoExpirar)
    return () => window.removeEventListener(EVENTO_SESSAO_EXPIRADA, aoExpirar)
  }, [])

  const idPessoa = sessao ? (sessao.usuario.idPessoaTelevendas ?? (PERMITIR_TROCA_USUARIO ? simulado : null)) : simulado

  const pessoa = useApiResource(
    (signal) => (idPessoa ? getDigitadora(idPessoa, signal) : Promise.resolve(null)),
    [idPessoa],
  )

  const acesso = useApiResource(
    (signal) => (idPessoa ? getAcesso(idPessoa, signal) : Promise.resolve(null)),
    [idPessoa],
  )

  const entrarComo = useCallback((id: number | null) => {
    if (!PERMITIR_TROCA_USUARIO) return
    setSimulado(id)
    salvar(id)
  }, [])

  const entrar = useCallback(async (login: string, senha: string) => {
    try {
      const nova = await entrarNaApi(login, senha)
      salvarSessao(nova)
      setSessao(nova)
    } catch (err) {
      throw new Error(mensagemDeLogin(err))
    }
  }, [])

  const sair = useCallback(() => {
    salvarSessao(null)
    setSessao(null)
  }, [])

  const value = useMemo<UsuarioContextValue>(
    () => {
      // com login real, as telas vêm do cadastro do usuário; sem ele, do perfil da pessoa (simulação)
      const abas = sessao
        ? sessao.usuario.telas.length
          ? sessao.usuario.telas
          : ['/campaigns']
        : acesso.data?.abas?.length
          ? acesso.data.abas
          : ['/campaigns']
      return {
        idPessoa,
        usuario: pessoa.data,
        carregando: pessoa.loading,
        erro: pessoa.error,
        acesso: acesso.data,
        carregandoAcesso: !!idPessoa && acesso.loading,
        abasPermitidas: abas,
        primeiraAba: abas[0],
        entrarComo,
        sessao,
        exigeLogin: !PERMITIR_TROCA_USUARIO,
        administrador: !!sessao?.usuario.administrador,
        entrar,
        sair,
      }
    },
    [idPessoa, pessoa.data, pessoa.loading, pessoa.error, acesso.data, acesso.loading, entrarComo, sessao, entrar, sair],
  )

  return <UsuarioContext.Provider value={value}>{children}</UsuarioContext.Provider>
}

export function useUsuario() {
  const context = useContext(UsuarioContext)
  if (!context) throw new Error('useUsuario deve ser usado dentro de um UsuarioProvider')
  return context
}
