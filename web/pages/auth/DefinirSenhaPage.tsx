import { FormEvent, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { ErroAuth } from '../../auth/authApi'
import { destinoAposLogin } from '../../auth/destino'
import { AuthCard, BotaoPrincipal, MensagemErro } from '../../components/AuthCard'
import { CampoTexto } from '../../components/CampoTexto'
import { useContagem } from '../../lib/useContagem'

const MIN_SENHA = 8

/** Mesma regra da API (a API é quem decide; aqui só evita ida e volta): mínimo, letra e número. */
function problemaNaSenha(senha: string): string | null {
  if (senha.length < MIN_SENHA) return `A senha precisa ter pelo menos ${MIN_SENHA} caracteres.`
  if (!/[a-zA-ZÀ-ÿ]/.test(senha) || !/\d/.test(senha)) return 'A senha precisa ter letras e números.'
  return null
}

/**
 * Primeiro acesso e "esqueci a senha" (mesmo caminho): informa o usuário, recebe o código por e-mail e define a senha.
 * Ao definir, o usuário já entra (a definição conta como a confirmação do dia).
 */
export default function DefinirSenhaPage() {
  const { sessao, desafio, solicitarSenha, definirSenha, reenviar, cancelarDesafio } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [identificador, setIdentificador] = useState('')
  const [codigo, setCodigo] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const [enviando, setEnviando] = useState(false)
  const restam = useContagem(desafio?.reenviarEm)

  if (sessao) return <Navigate to={destinoAposLogin(location.state)} replace />

  const naEtapaDoCodigo = desafio?.tipo === 'senha'

  async function pedirCodigo(e: FormEvent) {
    e.preventDefault()
    setErro('')
    setEnviando(true)
    try {
      await solicitarSenha(identificador)
    } catch (err) {
      setErro(err instanceof ErroAuth ? err.message : 'Não foi possível enviar o código.')
    } finally {
      setEnviando(false)
    }
  }

  async function salvar(e: FormEvent) {
    e.preventDefault()
    setErro('')
    setAviso('')

    const problema = problemaNaSenha(senha)
    if (problema) return setErro(problema)
    if (senha !== confirmacao) return setErro('As duas senhas não são iguais.')

    setEnviando(true)
    try {
      await definirSenha(codigo, senha)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível definir a senha.')
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
      setErro(err instanceof Error ? err.message : 'Não foi possível reenviar o código.')
    }
  }

  function voltar() {
    cancelarDesafio()
    navigate('/login', { replace: true, state: location.state })
  }

  if (!naEtapaDoCodigo) {
    return (
      <AuthCard
        titulo="Primeiro acesso / esqueci a senha"
        descricao="Informe seu usuário de rede ou e-mail. Enviaremos um código de 6 dígitos para o seu e-mail da empresa."
      >
        <form onSubmit={pedirCodigo} className="flex flex-col gap-4" noValidate>
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
          <MensagemErro texto={erro} />
          <BotaoPrincipal disabled={enviando || !identificador.trim()}>{enviando ? 'Enviando...' : 'Enviar código'}</BotaoPrincipal>
        </form>
        <p className="text-center text-sm">
          <Link to="/login" state={location.state} className="text-github-text-muted hover:text-github-text">
            Voltar ao login
          </Link>
        </p>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      titulo="Defina sua senha"
      descricao={
        <>
          Se o usuário existir, enviamos um código de 6 dígitos para <strong>{desafio.emailMascarado}</strong>. Digite o código e escolha
          a nova senha.
        </>
      }
    >
      <form onSubmit={salvar} className="flex flex-col gap-4" noValidate>
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
        <CampoTexto
          label="Nova senha"
          type="password"
          value={senha}
          onChange={setSenha}
          autoComplete="new-password"
          dica={`Pelo menos ${MIN_SENHA} caracteres, com letras e números.`}
          disabled={enviando}
        />
        <CampoTexto
          label="Repita a nova senha"
          type="password"
          value={confirmacao}
          onChange={setConfirmacao}
          autoComplete="new-password"
          disabled={enviando}
        />
        <MensagemErro texto={erro} />
        {aviso && !erro && <p className="text-sm text-other-greenflag">{aviso}</p>}
        <BotaoPrincipal disabled={enviando || codigo.length !== 6 || !senha || !confirmacao}>
          {enviando ? 'Salvando...' : 'Salvar senha e entrar'}
        </BotaoPrincipal>
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
