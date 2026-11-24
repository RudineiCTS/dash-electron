import { Navigate } from 'react-router-dom'
import { useUsuario } from '../auth/UsuarioContext'

/** Página inicial: leva para a primeira aba liberada do perfil (SAC cai no SAC, os demais em Campanhas, etc.). */
export function Inicio() {
  const { primeiraAba, carregandoAcesso } = useUsuario()
  if (carregandoAcesso) return <div className="h-40 animate-pulse rounded-xl border border-github-border bg-github-bg-card" aria-busy="true" />
  return <Navigate to={primeiraAba} replace />
}
