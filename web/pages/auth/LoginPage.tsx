import { FormEvent, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { ErroAuth } from '../../auth/authApi'
import { destinoAposLogin } from '../../auth/destino'
import { AuthCard, BotaoPrincipal, MensagemErro } from '../../components/AuthCard'
import { CampoTexto } from '../../components/CampoTexto'

export default function LoginPage() {
  const { sessao, entrar, cancelarDesafio } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [identificador, setIdentificador] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  if (sessao) return <Navigate to={destinoAposLogin(location.state)} replace />

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setErro('')
    setEnviando(true)
    try {
      cancelarDesafio()
      const etapa = await entrar(identificador, senha)
      // autenticado: a sessão muda e o <Navigate> acima leva ao destino; senão falta o código do e-mail
      if (etapa === 'confirmar-email') navigate('/login/confirmar', { state: location.state })
    } catch (err) {
      setErro(err instanceof ErroAuth ? err.message : 'Não foi possível entrar. Tente de novo.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <AuthCard titulo="Entrar" descricao="Use seu usuário de rede ou seu e-mail e a senha que você definiu no Compass.">
      <form onSubmit={enviar} className="flex flex-col gap-4" noValidate>
        <CampoTexto
          label="Usuário ou e-mail"
          value={identificador}
          onChange={setIdentificador}
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          autoFocus
          disabled={enviando}
        />
        <CampoTexto
          label="Senha"
          type="password"
          value={senha}
          onChange={setSenha}
          autoComplete="current-password"
          disabled={enviando}
        />
        <MensagemErro texto={erro} />
        <BotaoPrincipal disabled={enviando || !identificador.trim() || !senha}>{enviando ? 'Entrando...' : 'Entrar'}</BotaoPrincipal>
      </form>

      <p className="text-center text-sm text-github-text-muted">
        <Link to="/senha" state={location.state} className="font-semibold text-[#32307B] hover:underline dark:text-github-text-link">
          Primeiro acesso / esqueci a senha
        </Link>
      </p>
    </AuthCard>
  )
}
