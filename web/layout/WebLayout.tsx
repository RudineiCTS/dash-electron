import { LogOut } from 'lucide-react'
import { Link, Navigate, NavLink, Outlet, useLocation } from 'react-router-dom'
import { PERMITIR_TROCA_USUARIO, useUsuario } from '../auth/UsuarioContext'
import { DigitadoraCombobox } from '../components/DigitadoraCombobox'
import { LogoCompass } from '../components/LogoCompass'
import { ThemeButton } from '../components/ThemeButton'
import { ABAS } from './abas'

function classeAba(isActive: boolean, vertical: boolean) {
  const base = 'flex items-center rounded-lg text-sm font-medium transition-colors'
  const tamanho = vertical ? 'h-10 w-full px-3' : 'h-9 shrink-0 px-3'
  const cor = isActive
    ? 'bg-[#32307B] text-white'
    : 'text-github-text-muted hover:bg-github-bg-hover hover:text-github-text'
  return `${base} ${tamanho} ${cor}`
}

/**
 * Casca mobile first: header fixo no topo (respeita o notch via safe-area).
 * Navegação por abas: lateral (sidebar) a partir de md; em telas menores vira
 * uma faixa horizontal rolável logo abaixo do header.
 */
export function WebLayout() {
  const { idPessoa, entrarComo, abasPermitidas, primeiraAba, sessao, exigeLogin, sair } = useUsuario()
  const location = useLocation()
  /** Só as abas liberadas para o perfil de quem está logado. */
  const abas = ABAS.filter((a) => abasPermitidas.includes(a.to))

  // sem a simulação de desenvolvimento, nada aparece antes do login
  if (exigeLogin && !sessao) {
    return <Navigate to="/login" replace state={{ de: location.pathname }} />
  }

  return (
    <div className="min-h-dvh bg-github-bg text-github-text">
      <header className="sticky top-0 z-10 bg-[#32307B] pt-[env(safe-area-inset-top)] text-white shadow-sm">
        <div className="flex h-14 w-full items-center gap-2 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(0.5rem,env(safe-area-inset-right))] sm:px-6">
          <Link to={primeiraAba} className="flex shrink-0 items-center gap-2">
            <span className="sm:hidden">
              <LogoCompass claro mostrarNome={false} />
            </span>
            <span className="hidden sm:inline">
              <LogoCompass claro />
            </span>
          </Link>

          {/* Simulação de login: quem for escolhido aqui é "o usuário logado" em todas as telas */}
          {PERMITIR_TROCA_USUARIO && (
            <DigitadoraCombobox
              value={idPessoa}
              onChange={entrarComo}
              ariaLabel="Entrar como (simulação de login)"
              placeholder="Entrar como…"
              className="ml-auto min-w-0 flex-1 sm:max-w-xs sm:flex-none sm:basis-72"
            />
          )}
          {sessao ? (
            <div className={`flex min-w-0 items-center gap-2 ${PERMITIR_TROCA_USUARIO ? '' : 'ml-auto'}`}>
              <span className="hidden max-w-40 truncate text-sm sm:inline" title={sessao.usuario.nome}>
                {sessao.usuario.nome}
              </span>
              <button
                type="button"
                onClick={sair}
                aria-label="Sair"
                className="flex h-9 items-center gap-1.5 rounded-md px-2 text-sm text-white/90 hover:bg-white/10"
              >
                <LogOut size={16} aria-hidden />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          ) : (
            PERMITIR_TROCA_USUARIO && (
              <Link to="/login" className="flex h-9 shrink-0 items-center rounded-md px-2 text-sm text-white/90 hover:bg-white/10">
                Entrar
              </Link>
            )
          )}
          <ThemeButton />
        </div>
      </header>

      <div className="flex w-full flex-col md:flex-row">
        {/* Mobile: faixa horizontal */}
        <nav
          aria-label="Seções"
          className="flex gap-1 overflow-x-auto border-b border-github-border px-4 py-2 md:hidden"
        >
          {abas.map((aba) => (
            <NavLink key={aba.to} to={aba.to} className={({ isActive }) => classeAba(isActive, false)}>
              {aba.label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop: sidebar */}
        <nav
          aria-label="Seções"
          className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-52 shrink-0 flex-col gap-1 border-r border-github-border p-3 md:flex"
        >
          {abas.map((aba) => (
            <NavLink key={aba.to} to={aba.to} className={({ isActive }) => classeAba(isActive, true)}>
              {aba.label}
            </NavLink>
          ))}
        </nav>

        <main className="min-w-0 flex-1 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 sm:px-5 sm:pt-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
