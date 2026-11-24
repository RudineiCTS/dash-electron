import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useUsuario } from '../auth/UsuarioContext'

/**
 * Só mostra a tela se a aba está liberada para o perfil de quem está logado.
 * Enquanto o perfil carrega, mostra um esqueleto (para não "piscar" um bloqueio).
 */
export function RotaProtegida({ aba, children }: { aba: string; children: ReactNode }) {
  const { abasPermitidas, carregandoAcesso, primeiraAba } = useUsuario()

  if (carregandoAcesso) {
    return <div className="h-40 animate-pulse rounded-xl border border-github-border bg-github-bg-card" aria-busy="true" />
  }

  if (!abasPermitidas.includes(aba)) {
    return (
      <div role="alert" className="flex flex-col items-center gap-3 rounded-xl border border-github-border bg-github-bg-card px-4 py-12 text-center">
        <p className="text-sm font-semibold">Você não tem acesso a esta seção.</p>
        <p className="text-sm text-github-text-muted">O seu perfil não inclui esta área. Fale com a supervisão se precisar dela.</p>
        <Link to={primeiraAba} className="flex h-10 items-center rounded-lg bg-github-btn-green px-5 text-sm font-medium text-white">
          Ir para a minha área
        </Link>
      </div>
    )
  }

  return <>{children}</>
}
