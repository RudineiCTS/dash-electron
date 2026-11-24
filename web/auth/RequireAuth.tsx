import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

/** Envolve as rotas que exigem login: sem sessão, vai para /login e volta para onde estava depois de entrar. */
export function RequireAuth() {
  const { sessao } = useAuth()
  const location = useLocation()

  if (!sessao) return <Navigate to="/login" replace state={{ from: location }} />
  return <Outlet />
}
