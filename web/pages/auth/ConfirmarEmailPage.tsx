import { FormEvent, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { ErroAuth } from '../../auth/authApi'
import { destinoAposLogin } from '../../auth/destino'
import { AuthCard, BotaoPrincipal, MensagemErro } from '../../components/AuthCard'
import { CampoTexto } from '../../components/CampoTexto'
import { useContagem } from '../../lib/useContagem'

/** Primeiro login do dia: senha certa, falta digitar o código de 6 dígitos que chegou no e-mail. */
export default function ConfirmarEmailPage() {
  const { sessao, desafio, confirmar, reenviar, cancelarDesafio } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [codigo, setCodigo] = useState('')
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const [enviando, setEnviando] = useState(false)
  const restam = useContagem(desafio?.reenviarEm)

  if (sessao) return <Navigate to={destinoAposLogin(location.state)} replace />
  if (!desafio || desafio.tipo !== 'login') return <Navigate to="/login" replace />

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setErro('')
    setAviso('')
    setEnviando(true)
    try {
      await confirmar(codigo)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível confirmar o código.')
    } finally {
      setEnviando(false)
    }
  }

  async function pedirOutro() {
    setErro('')
    setAviso('')
    try {
      await reenviar()
      setCodigo('')
      setAviso('Enviamos um novo código.')
    } catch (err) {
      setErro(err instanceof ErroAuth || err instanceof Error ? err.message : 'Não foi possível reenviar o código.')
    }
  }

  function voltar() {
    cancelarDesafio()
    navigate('/login', { replace: true, state: location.state })
  }

  return (
    <AuthCard
      titulo="Confirme seu e-mail"
      descricao={
        <>
          É o seu primeiro acesso de hoje. Enviamos um código de 6 dígitos para <strong>{desafio.emailMascarado}</strong>. Ele vale por
          poucos minutos.
        </>
      }
    >
      <form onSubmit={enviar} className="flex flex-col gap-4" noValidate>
        <CampoTexto
          label="Código do e-mail"
          value={codigo}
          onChange={(v) => setCodigo(v.replace(/\D/g, '').slice(0, 6))}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="000000"
          className="text-center text-lg tracking-[0.4em]"
          autoFocus
          disabled={enviando}
        />
        <MensagemErro texto={erro} />
        {aviso && !erro && <p className="text-sm text-other-greenflag">{aviso}</p>}
        <BotaoPrincipal disabled={enviando || codigo.length !== 6}>{enviando ? 'Confirmando...' : 'Confirmar'}</BotaoPrincipal>
      </form>

      <div className="flex items-center justify-between text-sm">
        <button type="button" onClick={voltar} className="text-github-text-muted hover:text-github-text">
          Voltar
        </button>
        <button
          type="button"
          onClick={pedirOutro}
          disabled={restam > 0}
          className="font-semibold text-[#32307B] hover:underline disabled:cursor-not-allowed disabled:text-github-text-muted disabled:no-underline dark:text-github-text-link"
        >
          {restam > 0 ? `Reenviar código em ${restam}s` : 'Reenviar código'}
        </button>
      </div>
    </AuthCard>
  )
}
