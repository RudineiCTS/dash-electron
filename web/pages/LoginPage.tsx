import { FormEvent, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { LogoCompass } from '../components/LogoCompass'
import { useUsuario } from '../auth/UsuarioContext'

/** Entrada do Compass: usuário e senha do Windows (a senha é conferida no Active Directory e nunca é guardada). */
export default function LoginPage() {
  const { sessao, entrar, primeiraAba } = useUsuario()
  const location = useLocation()
  const [login, setLogin] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  if (sessao) {
    const destino = (location.state as { de?: string } | null)?.de
    return <Navigate to={destino && destino !== '/login' ? destino : primeiraAba} replace />
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (enviando) return
    setErro(null)
    setEnviando(true)
    try {
      await entrar(login, senha)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível entrar.')
      setSenha('')
      setEnviando(false)
    }
  }

  const campo =
    'h-11 w-full rounded-md border border-github-border bg-github-bg-card px-3 text-base text-github-text placeholder:text-github-text-muted'

  return (
    <div className="flex min-h-dvh items-center justify-center bg-github-bg px-4 text-github-text">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center rounded-xl bg-[#32307B] py-6">
          <LogoCompass claro tamanho={34} />
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4 rounded-xl border border-github-border bg-github-bg-card p-5">
          <div>
            <h1 className="text-lg font-semibold">Entrar</h1>
            <p className="mt-1 text-sm text-github-text-muted">Use o mesmo usuário e senha do seu computador.</p>
          </div>

          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Usuário
            <input
              type="text"
              name="usuario"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              autoFocus
              required
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="nome.sobrenome"
              className={campo}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Senha
            <input
              type="password"
              name="senha"
              autoComplete="current-password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className={campo}
            />
          </label>

          {erro && (
            <p role="alert" className="rounded-md border border-other-redflag/40 px-3 py-2 text-sm text-other-redflag">
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={enviando || !login.trim() || !senha}
            className="h-11 rounded-lg bg-github-btn-green text-sm font-medium text-white disabled:opacity-50 active:opacity-80"
          >
            {enviando ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
