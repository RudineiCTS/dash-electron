import { createContext, ReactNode, useContext, useMemo } from 'react'
import { getDigitadora, type Digitadora } from '../lib/digitadoras'
import { useApiResource } from '../lib/useApiResource'
import { useAuth } from './AuthContext'

/**
 * Quem está usando o site, como as telas de pedidos enxergam: a identidade vem do login (`useAuth`), e aqui só se
 * carrega o cadastro da digitadora ligada a esse usuário (IDPessoaTelevendas). Usuário que não é digitadora fica
 * logado com `idPessoa = null`, e as telas que dependem dela mostram o aviso.
 */
interface UsuarioContextValue {
  /** IDPessoaTelevendas de quem está logado, ou null. */
  idPessoa: number | null
  /** Cadastro da pessoa (nome, supervisor, setor), carregado de GET televendas-base-digitadoras/{id}. */
  usuario: Digitadora | null
  carregando: boolean
  erro: string | null
}

const UsuarioContext = createContext<UsuarioContextValue | undefined>(undefined)

export function UsuarioProvider({ children }: { children: ReactNode }) {
  const { usuario: logado } = useAuth()
  const idPessoa = logado?.idPessoa ?? null

  const pessoa = useApiResource(
    (signal) => (idPessoa ? getDigitadora(idPessoa, signal) : Promise.resolve(null)),
    [idPessoa],
  )

  const value = useMemo<UsuarioContextValue>(
    () => ({ idPessoa, usuario: pessoa.data, carregando: pessoa.loading, erro: pessoa.error }),
    [idPessoa, pessoa.data, pessoa.loading, pessoa.error],
  )

  return <UsuarioContext.Provider value={value}>{children}</UsuarioContext.Provider>
}

export function useUsuario() {
  const context = useContext(UsuarioContext)
  if (!context) throw new Error('useUsuario deve ser usado dentro de um UsuarioProvider')
  return context
}
