import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react'
import { getDigitadora, type Digitadora } from '../lib/digitadoras'
import { useApiResource } from '../lib/useApiResource'

/**
 * SIMULAÇÃO DE LOGIN, até a autenticação real existir: quem usa o site escolhe uma pessoa no
 * header e passa a ver o sistema "como" ela. Isso é personificação sem senha, então:
 * ligada em dev e DESLIGADA em build de produção, a menos que VITE_PERMITIR_TROCA_USUARIO=true.
 * Desligada, ninguém fica "logado" e as telas que dependem de usuário pedem para entrar.
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

/**
 * O que as telas consomem. Quando houver login de verdade, só este provider muda
 * (a identidade passa a vir do token); as telas continuam usando `useUsuario()`.
 */
interface UsuarioContextValue {
  /** IDPessoaTelevendas de quem está "logado", ou null. */
  idPessoa: number | null
  /** Cadastro da pessoa (nome, supervisor, setor), carregado de GET televendas-base-digitadoras/{id}. */
  usuario: Digitadora | null
  carregando: boolean
  erro: string | null
  /** Passa a ver o sistema como essa pessoa (null = sair). */
  entrarComo: (idPessoa: number | null) => void
}

const UsuarioContext = createContext<UsuarioContextValue | undefined>(undefined)

export function UsuarioProvider({ children }: { children: ReactNode }) {
  const [idPessoa, setIdPessoa] = useState<number | null>(() => (PERMITIR_TROCA_USUARIO ? lerSalvo() : null))

  const pessoa = useApiResource(
    (signal) => (idPessoa ? getDigitadora(idPessoa, signal) : Promise.resolve(null)),
    [idPessoa],
  )

  const entrarComo = useCallback((id: number | null) => {
    if (!PERMITIR_TROCA_USUARIO) return
    setIdPessoa(id)
    salvar(id)
  }, [])

  const value = useMemo<UsuarioContextValue>(
    () => ({ idPessoa, usuario: pessoa.data, carregando: pessoa.loading, erro: pessoa.error, entrarComo }),
    [idPessoa, pessoa.data, pessoa.loading, pessoa.error, entrarComo],
  )

  return <UsuarioContext.Provider value={value}>{children}</UsuarioContext.Provider>
}

export function useUsuario() {
  const context = useContext(UsuarioContext)
  if (!context) throw new Error('useUsuario deve ser usado dentro de um UsuarioProvider')
  return context
}
