import type { ReactNode } from 'react'
import { ThemeButton } from './ThemeButton'

interface AuthCardProps {
  titulo: string
  descricao?: ReactNode
  children: ReactNode
}

/** Casca das telas de login: faixa de marca no topo e um cartão central. */
export function AuthCard({ titulo, descricao, children }: AuthCardProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-github-bg text-github-text">
      <header className="bg-[#32307B] pt-[env(safe-area-inset-top)] text-white">
        <div className="flex h-14 items-center gap-2 px-4 sm:px-6">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#DD8100] text-xs font-semibold">S</span>
          <span className="truncate text-sm font-semibold">Solfarma Comercial</span>
          <span className="ml-auto">
            <ThemeButton />
          </span>
        </div>
      </header>

      <main className="flex flex-1 items-start justify-center px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-8 sm:items-center sm:pt-0">
        <div className="w-full max-w-sm rounded-2xl border border-github-border bg-github-bg-card p-6 shadow-sm">
          <h1 className="text-lg font-semibold">{titulo}</h1>
          {descricao && <p className="mt-1 text-sm text-github-text-muted">{descricao}</p>}
          <div className="mt-5 flex flex-col gap-4">{children}</div>
        </div>
      </main>
    </div>
  )
}

/** Botão principal dos formulários de login. */
export function BotaoPrincipal({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="submit"
      {...props}
      className="h-11 w-full rounded-lg bg-[#32307B] text-sm font-semibold text-white transition-[filter] hover:brightness-110
                 active:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  )
}

/** Mensagem de erro de um formulário. */
export function MensagemErro({ texto }: { texto: string }) {
  if (!texto) return null
  return (
    <p role="alert" className="rounded-lg border border-other-redflag/30 bg-other-redflag/10 px-3 py-2 text-sm text-other-redflag">
      {texto}
    </p>
  )
}
