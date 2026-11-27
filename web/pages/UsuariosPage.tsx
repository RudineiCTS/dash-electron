import { FormEvent, useMemo, useState } from 'react'
import { Pencil, Plus, X } from 'lucide-react'
import { DigitadoraCombobox } from '../components/DigitadoraCombobox'
import { CardListSkeleton, EmptyState, ErrorState } from '../components/StateViews'
import {
  PERFIS,
  atualizarUsuario,
  criarUsuario,
  getTelas,
  getUsuarios,
  type Tela,
  type UsuarioAdmin,
  type UsuarioSalvar,
} from '../lib/usuarios'
import { useApiResource } from '../lib/useApiResource'

/** Rascunho do formulário: `id` null = novo usuário. */
interface Rascunho {
  id: number | null
  loginAd: string
  nome: string
  idPessoaTelevendas: number | null
  administrador: boolean
  supervisao: boolean
  ativo: boolean
  telas: string[]
}

const NOVO: Rascunho = { id: null, loginAd: '', nome: '', idPessoaTelevendas: null, administrador: false, supervisao: false, ativo: true, telas: ['/campaigns'] }

function mensagemDoErro(err: unknown): string {
  const resp = (err as { response?: { data?: { mensagem?: string } } } | null)?.response
  return resp?.data?.mensagem ?? 'Não foi possível salvar. Tente de novo.'
}

function formatarData(iso: string | null) {
  if (!iso) return 'Nunca acessou'
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

/** Cadastro de quem acessa o Compass (usuário do Windows) e de quais telas cada um enxerga. Só administrador. */
export default function UsuariosPage() {
  const usuarios = useApiResource((signal) => getUsuarios(signal), [])
  const telas = useApiResource((signal) => getTelas(signal), [])
  const [rascunho, setRascunho] = useState<Rascunho | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  /** A tela de Usuários é só de administrador: não aparece para marcar. */
  const telasMarcaveis = useMemo<Tela[]>(() => (telas.data ?? []).filter((t) => t.caminho !== '/usuarios'), [telas.data])
  /** Supervisão enxerga tudo menos Usuários e Parâmetros (o servidor aplica; aqui só mostra). */
  const telaDaSupervisao = (caminho: string) => caminho !== '/parametros' && caminho !== '/usuarios'
  const rotuloDaTela = useMemo(() => new Map((telas.data ?? []).map((t) => [t.caminho, t.rotulo])), [telas.data])

  function editar(u: UsuarioAdmin) {
    setErro(null)
    setRascunho({
      id: u.id,
      loginAd: u.loginAd,
      nome: u.nome,
      idPessoaTelevendas: u.idPessoaTelevendas,
      administrador: u.administrador,
      supervisao: u.supervisao,
      ativo: u.ativo,
      telas: u.telas,
    })
  }

  function alternarTela(caminho: string) {
    setRascunho((r) =>
      r ? { ...r, telas: r.telas.includes(caminho) ? r.telas.filter((t) => t !== caminho) : [...r.telas, caminho] } : r,
    )
  }

  async function salvar(e: FormEvent) {
    e.preventDefault()
    if (!rascunho || salvando) return
    setErro(null)
    setSalvando(true)
    const dto: UsuarioSalvar = {
      loginAd: rascunho.loginAd,
      nome: rascunho.nome,
      idPessoaTelevendas: rascunho.idPessoaTelevendas,
      administrador: rascunho.administrador,
      supervisao: rascunho.supervisao && !rascunho.administrador,
      ativo: rascunho.ativo,
      telas: rascunho.telas,
    }
    try {
      if (rascunho.id === null) await criarUsuario(dto)
      else await atualizarUsuario(rascunho.id, dto)
      setRascunho(null)
      usuarios.reload()
    } catch (err) {
      setErro(mensagemDoErro(err))
    } finally {
      setSalvando(false)
    }
  }

  const campo =
    'h-10 w-full rounded-md border border-github-border bg-github-bg-card px-3 text-base text-github-text placeholder:text-github-text-muted sm:text-sm'

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold">Usuários</h1>
          <p className="text-sm text-github-text-muted">Quem entra no Compass (com o usuário do Windows) e o que cada pessoa enxerga.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setErro(null)
            setRascunho({ ...NOVO })
          }}
          className="flex h-10 items-center gap-2 rounded-lg bg-github-btn-green px-4 text-sm font-medium text-white active:opacity-80"
        >
          <Plus size={16} aria-hidden /> Novo usuário
        </button>
      </div>

      {rascunho && (
        <form onSubmit={salvar} className="flex flex-col gap-4 rounded-xl border border-github-border bg-github-bg-card p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">{rascunho.id === null ? 'Novo usuário' : `Editar ${rascunho.nome}`}</h2>
            <button type="button" aria-label="Fechar" onClick={() => setRascunho(null)} className="rounded p-1 text-github-text-muted hover:text-github-text">
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Usuário do Windows
              <input
                type="text"
                value={rascunho.loginAd}
                disabled={rascunho.id !== null}
                onChange={(e) => setRascunho({ ...rascunho, loginAd: e.target.value })}
                placeholder="nome.sobrenome"
                autoCapitalize="none"
                spellCheck={false}
                required
                className={`${campo} disabled:opacity-60`}
              />
              <span className="text-xs font-normal text-github-text-muted">O mesmo que a pessoa usa para entrar no computador (sem o domínio).</span>
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Nome
              <input
                type="text"
                value={rascunho.nome}
                onChange={(e) => setRascunho({ ...rascunho, nome: e.target.value })}
                required
                maxLength={150}
                className={campo}
              />
            </label>
          </div>

          <div className="flex flex-col gap-1.5 text-sm font-medium">
            Pessoa do televendas (opcional)
            <DigitadoraCombobox
              value={rascunho.idPessoaTelevendas}
              onChange={(id) => setRascunho({ ...rascunho, idPessoaTelevendas: id })}
              ariaLabel="Pessoa do televendas"
              placeholder="Ligar a uma pessoa da base…"
              className="sm:max-w-md"
            />
            <span className="text-xs font-normal text-github-text-muted">
              Quem é operadora vê os próprios resultados; sem vínculo, a pessoa só vê o que as telas liberadas mostram sem identificação.
            </span>
          </div>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-medium">O que pode ver</legend>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-github-text-muted">Começar de um perfil:</span>
              {PERFIS.map((p) => (
                <button
                  key={p.nome}
                  type="button"
                  disabled={rascunho.administrador || rascunho.supervisao}
                  onClick={() => setRascunho({ ...rascunho, telas: p.telas })}
                  className="h-8 rounded-md border border-github-border px-3 text-xs font-medium hover:bg-github-bg-hover disabled:opacity-50"
                >
                  {p.nome}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {telasMarcaveis.map((t) => (
                <label key={t.caminho} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={
                      rascunho.administrador || (rascunho.supervisao ? telaDaSupervisao(t.caminho) : rascunho.telas.includes(t.caminho))
                    }
                    disabled={rascunho.administrador || rascunho.supervisao}
                    onChange={() => alternarTela(t.caminho)}
                    className="h-4 w-4"
                  />
                  {t.rotulo}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={rascunho.administrador}
                onChange={(e) => setRascunho({ ...rascunho, administrador: e.target.checked, supervisao: e.target.checked ? false : rascunho.supervisao })}
                className="h-4 w-4"
              />
              Administrador (vê todas as telas e cadastra usuários)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={rascunho.supervisao && !rascunho.administrador}
                disabled={rascunho.administrador}
                onChange={(e) => setRascunho({ ...rascunho, supervisao: e.target.checked })}
                className="h-4 w-4"
              />
              Supervisão (vê tudo, de todas as pessoas, menos Usuários e Parâmetros; não precisa de pessoa do televendas)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={rascunho.ativo}
                onChange={(e) => setRascunho({ ...rascunho, ativo: e.target.checked })}
                className="h-4 w-4"
              />
              Acesso ativo
            </label>
          </div>

          {erro && (
            <p role="alert" className="rounded-md border border-other-redflag/40 px-3 py-2 text-sm text-other-redflag">
              {erro}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={salvando}
              className="h-10 rounded-lg bg-github-btn-green px-5 text-sm font-medium text-white disabled:opacity-50 active:opacity-80"
            >
              {salvando ? 'Salvando…' : 'Salvar'}
            </button>
            <button type="button" onClick={() => setRascunho(null)} className="h-10 rounded-lg border border-github-border px-5 text-sm font-medium hover:bg-github-bg-hover">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {usuarios.loading && <CardListSkeleton count={3} />}
      {usuarios.error && <ErrorState message={usuarios.error} onRetry={usuarios.reload} />}
      {usuarios.data && usuarios.data.length === 0 && <EmptyState message="Nenhum usuário cadastrado ainda." />}

      {usuarios.data && usuarios.data.length > 0 && (
        <ul className="flex flex-col gap-2">
          {usuarios.data.map((u) => (
            <li key={u.id} className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-github-border bg-github-bg-card p-3">
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                  {u.nome}
                  {u.administrador && <span className="rounded bg-[#32307B] px-1.5 py-0.5 text-[10px] font-medium text-white">Administrador</span>}
                  {u.supervisao && !u.administrador && (
                    <span className="rounded bg-[#32307B]/80 px-1.5 py-0.5 text-[10px] font-medium text-white">Supervisão</span>
                  )}
                  {!u.ativo && <span className="rounded border border-github-border px-1.5 py-0.5 text-[10px] font-medium text-github-text-muted">Inativo</span>}
                </p>
                <p className="text-xs text-github-text-muted">
                  {u.loginAd}
                  {u.idPessoaTelevendas ? ` · pessoa #${u.idPessoaTelevendas}` : ''} · {formatarData(u.dataUltimoAcesso)}
                </p>
                <p className="mt-1 text-xs text-github-text-muted">
                  {u.administrador
                    ? 'Todas as telas'
                    : u.supervisao
                      ? 'Todas, menos Usuários e Parâmetros'
                      : u.telas.length
                        ? u.telas.map((t) => rotuloDaTela.get(t) ?? t).join(' · ')
                        : 'Nenhuma tela liberada'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => editar(u)}
                aria-label={`Editar ${u.nome}`}
                className="flex h-9 items-center gap-1.5 rounded-md border border-github-border px-3 text-xs font-medium hover:bg-github-bg-hover"
              >
                <Pencil size={14} aria-hidden /> Editar
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
