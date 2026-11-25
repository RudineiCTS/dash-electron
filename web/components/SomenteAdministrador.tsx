import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useUsuario } from '../auth/UsuarioContext'

/**
 * Só administrador do Compass entra. Os demais voltam para a tela inicial. Isto só esconde a tela: quem protege
 * os dados é a API (as rotas de configuração exigem a política "Administrador").
 */
export function SomenteAdministrador({ children }: { children: ReactNode }) {
  const { administrador } = useUsuario()
  if (!administrador) return <Navigate to="/" replace />
  return <>{children}</>
}
