import { Link, NavLink, Outlet } from 'react-router-dom'
import { PERMITIR_TROCA_USUARIO, useUsuario } from '../auth/UsuarioContext'
import { DigitadoraCombobox } from '../components/DigitadoraCombobox'
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
  const { idPessoa, entrarComo } = useUsuario()

  return (
    <div className="min-h-dvh bg-github-bg text-github-text">
      <header className="sticky top-0 z-10 bg-[#32307B] pt-[env(safe-area-inset-top)] text-white shadow-sm">
        <div className="flex h-14 w-full items-center gap-2 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(0.5rem,env(safe-area-inset-right))] sm:px-6">
          <Link to="/campaigns" className="flex shrink-0 items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#DD8100] text-xs font-semibold">
              S
            </span>
            <span className="hidden truncate text-sm font-semibold sm:inline">Solfarma Comercial</span>
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
          <ThemeButton />
        </div>
      </header>

      <div className="flex w-full flex-col md:flex-row">
        {/* Mobile: faixa horizontal */}
        <nav
          aria-label="Seções"
          className="flex gap-1 overflow-x-auto border-b border-github-border px-4 py-2 md:hidden"
        >
          {ABAS.map((aba) => (
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
          {ABAS.map((aba) => (
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
