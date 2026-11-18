import { Link, Outlet } from 'react-router-dom'
import { ThemeButton } from '../components/ThemeButton'

/**
 * Casca mobile first: header fixo no topo (respeita o notch via safe-area),
 * conteúdo em coluna única que se expande em telas maiores (max-w-5xl centralizado).
 */
export function WebLayout() {
  return (
    <div className="min-h-dvh bg-github-bg text-github-text">
      <header className="sticky top-0 z-10 bg-[#32307B] pt-[env(safe-area-inset-top)] text-white shadow-sm">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between pl-[max(1rem,env(safe-area-inset-left))] pr-[max(0.5rem,env(safe-area-inset-right))] sm:px-6">
          <Link to="/campaigns" className="flex min-w-0 items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#DD8100] text-xs font-semibold">
              S
            </span>
            <span className="truncate text-sm font-semibold">Solfarma Comercial</span>
          </Link>
          <ThemeButton />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-4 sm:px-6 sm:pt-6">
        <Outlet />
      </main>
    </div>
  )
}
