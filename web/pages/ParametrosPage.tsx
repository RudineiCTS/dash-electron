import { useEffect, useMemo, useState } from 'react'
import { isAxiosError } from 'axios'
import { Pencil, Plus, Trash2, UserPlus } from 'lucide-react'
import {
  getTelevendasDigitadores,
  getTelevendasGrupoOpcoes,
  saveTelevendasDigitadorGrupo,
} from '@shared/services/televendasDigitador'
import type { TelevendasDigitador, TelevendasGrupoOpcao } from '@shared/interfaces/TelevendasDigitador'
import { EmptyState, ErrorState } from '../components/StateViews'
import { etiquetaGrupo } from '../lib/grupo'
import { useApiResource } from '../lib/useApiResource'

/**
 * Edição (adicionar/editar/remover grupo): ligada em dev e DESLIGADA em build de produção,
 * a menos que VITE_PERMITIR_EDICAO_PARAMETROS=true. Motivo: o site web ainda não tem login e a
 * API não valida quem chama; não exponha a edição antes de existir autenticação.
 */
const flag = import.meta.env.VITE_PERMITIR_EDICAO_PARAMETROS as string | undefined
const EDICAO = flag === 'true' || (flag !== 'false' && import.meta.env.DEV)

const TODOS = 'Todos'
const SEM_GRUPO = 'Sem grupo'

const campo = 'h-9 rounded-md border border-github-border bg-github-bg-card px-2.5 text-sm text-github-text'
const botao =
  'flex h-8 items-center gap-1.5 rounded-md border border-github-border bg-github-bg-card px-2.5 text-xs font-medium text-github-text hover:bg-github-bg-hover disabled:opacity-50'

function distintos(valores: (string | null)[]) {
  return [...new Set(valores.filter((v): v is string => !!v))].sort((a, b) => a.localeCompare(b, 'pt-BR'))
}

interface FormGrupoProps {
  /** Cadastro de grupos com seus subgrupos (o subgrupo oferecido depende do grupo escolhido). */
  opcoes: TelevendasGrupoOpcao[]
  inicial: { grupo: string; subGrupo: string }
  salvando: boolean
  onSalvar: (grupo: string, subGrupo: string) => void
  onCancelar: () => void
}

const NOVO = '__novo__'

interface EscolhaProps {
  rotulo: string
  /** Valores já usados (lista completa, independente do que está selecionado). */
  opcoes: string[]
  valor: string
  vazioLabel: string
  onChange: (v: string) => void
  largura: string
}

/** Lista com todas as opções existentes; "Novo…" abre um campo para digitar um valor que ainda não existe. */
function EscolhaOuNovo({ rotulo, opcoes, valor, vazioLabel, onChange, largura }: EscolhaProps) {
  const existente = !valor || opcoes.includes(valor)
  const [novo, setNovo] = useState(!existente)

  return (
    <div className="flex items-center gap-1.5">
      <select
        aria-label={rotulo}
        value={novo ? NOVO : valor}
        onChange={(e) => {
          if (e.target.value === NOVO) {
            setNovo(true)
            onChange('')
          } else {
            setNovo(false)
            onChange(e.target.value)
          }
        }}
        className={`${campo} ${largura}`}
      >
        <option value="">{vazioLabel}</option>
        {opcoes.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
        <option value={NOVO}>Novo…</option>
      </select>
      {novo && (
        <input
          autoFocus
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Novo ${rotulo.toLowerCase()}`}
          aria-label={`Novo ${rotulo.toLowerCase()}`}
          className={`${campo} w-36`}
        />
      )}
    </div>
  )
}

/** Grupo e subgrupo são texto livre no ERP; escolha entre os já usados ou crie um novo. */
function FormGrupo({ opcoes, inicial, salvando, onSalvar, onCancelar }: FormGrupoProps) {
  const [grupo, setGrupo] = useState(inicial.grupo)
  const [subGrupo, setSubGrupo] = useState(inicial.subGrupo)
  const vazio = !grupo.trim()
  const grupos = opcoes.map((g) => g.grupo)
  // subgrupos que pertencem ao grupo escolhido (grupo novo ainda não tem nenhum)
  const subGrupos = opcoes.find((g) => g.grupo === grupo)?.subGrupos.map((s) => s.subGrupo) ?? []

  return (
    <div className="flex flex-wrap items-center gap-2">
      <EscolhaOuNovo
        rotulo="Grupo"
        opcoes={grupos}
        valor={grupo}
        vazioLabel="Escolha o grupo"
        onChange={(v) => {
          setGrupo(v)
          setSubGrupo('') // o subgrupo depende do grupo
        }}
        largura="w-44"
      />
      <EscolhaOuNovo
        key={grupo}
        rotulo="Subgrupo"
        opcoes={subGrupos}
        valor={subGrupo}
        vazioLabel="Sem subgrupo"
        onChange={setSubGrupo}
        largura="w-44"
      />
      <button
        type="button"
        disabled={salvando || vazio}
        onClick={() => onSalvar(grupo, subGrupo)}
        className="h-8 rounded-md bg-github-btn-green px-3 text-xs font-medium text-white disabled:opacity-50"
      >
        {salvando ? 'Salvando…' : 'Salvar'}
      </button>
      <button type="button" onClick={onCancelar} className={botao}>
        Cancelar
      </button>
    </div>
  )
}

export default function ParametrosPage() {
  const { data, loading, error, reload } = useApiResource((signal) => getTelevendasDigitadores(signal), [])
  const opcoesApi = useApiResource((signal) => getTelevendasGrupoOpcoes(signal), [])
  const opcoes = opcoesApi.data ?? []
  const [lista, setLista] = useState<TelevendasDigitador[]>([])
  useEffect(() => {
    if (data) setLista(data)
  }, [data])

  const [grupoFiltro, setGrupoFiltro] = useState(TODOS)
  const [subFiltro, setSubFiltro] = useState(TODOS)
  const [busca, setBusca] = useState('')

  const [editando, setEditando] = useState<number | null>(null)
  const [removendo, setRemovendo] = useState<number | null>(null)
  const [adicionando, setAdicionando] = useState(false)
  const [pessoaNova, setPessoaNova] = useState('')
  const [salvandoId, setSalvandoId] = useState<number | null>(null)
  const [erroSalvar, setErroSalvar] = useState<string | null>(null)

  const grupos = useMemo(() => distintos(lista.map((d) => d.grupo)), [lista])
  const subGrupos = useMemo(() => distintos(lista.map((d) => d.subGrupo)), [lista])
  const semGrupo = useMemo(() => lista.filter((d) => !d.grupo?.trim()), [lista])

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return lista.filter(
      (d) =>
        (grupoFiltro === TODOS || (grupoFiltro === SEM_GRUPO ? !d.grupo?.trim() : d.grupo === grupoFiltro)) &&
        (subFiltro === TODOS || d.subGrupo === subFiltro) &&
        (!termo || d.nomeUsuario?.toLowerCase().includes(termo) || String(d.idPessoa).includes(termo)),
    )
  }, [lista, grupoFiltro, subFiltro, busca])

  async function salvar(idPessoa: number, grupo: string, subGrupo: string) {
    setSalvandoId(idPessoa)
    setErroSalvar(null)
    const g = grupo.trim() || null
    const s = subGrupo.trim() || null
    try {
      await saveTelevendasDigitadorGrupo({ idPessoaTelevendas: idPessoa, grupo: g, subGrupo: s })
      setLista((prev) => prev.map((d) => (d.idPessoa === idPessoa ? { ...d, grupo: g, subGrupo: s } : d)))
      opcoesApi.reload() // grupo/subgrupo novo passa a aparecer nas listas
      setEditando(null)
      setRemovendo(null)
      setAdicionando(false)
      setPessoaNova('')
    } catch (err) {
      const status = isAxiosError(err) ? err.response?.status : null
      // A API devolve o motivo real em `detail` (ProblemDetails) quando o banco recusa a gravação
      const detalhe = isAxiosError(err) ? (err.response?.data as { detail?: string } | undefined)?.detail : undefined
      setErroSalvar(
        status === 401 || status === 403
          ? 'Sem permissão para alterar o grupo.'
          : detalhe
            ? `Não foi possível salvar: ${detalhe}`
            : 'Não foi possível salvar. Tente novamente.',
      )
    } finally {
      setSalvandoId(null)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h1 className="text-lg font-extrabold">
          Parâmetros gerais de televendas
          <span className="ml-2 text-xs font-medium tracking-[0.15em] text-github-btn-green-hover">GRUPO DE OPERADORES</span>
        </h1>
        {data && (
          <p className="text-sm text-github-text-muted">
            <strong className="font-semibold text-github-text">{lista.length}</strong> digitadores ·{' '}
            <strong className="font-semibold text-github-text">{semGrupo.length}</strong> sem grupo
          </p>
        )}
      </div>

      <section aria-label="Filtros" className="flex flex-wrap items-center gap-2">
        <select aria-label="Grupo" value={grupoFiltro} onChange={(e) => setGrupoFiltro(e.target.value)} className={campo}>
          <option value={TODOS}>Grupo: todos</option>
          <option value={SEM_GRUPO}>Sem grupo</option>
          {grupos.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        <select aria-label="Subgrupo" value={subFiltro} onChange={(e) => setSubFiltro(e.target.value)} className={campo}>
          <option value={TODOS}>Subgrupo: todos</option>
          {subGrupos.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar nome ou ID"
          aria-label="Buscar digitador"
          className={`${campo} w-52`}
        />
        {EDICAO && (
          <button
            type="button"
            onClick={() => {
              setAdicionando((v) => !v)
              setErroSalvar(null)
            }}
            className="ml-auto flex h-9 items-center gap-1.5 rounded-md bg-github-btn-green px-3 text-sm font-medium text-white"
          >
            <UserPlus size={16} /> Adicionar pessoa
          </button>
        )}
      </section>

      {EDICAO && adicionando && (
        <section className="flex flex-col gap-2 rounded-xl border border-github-border bg-github-bg-card p-3" aria-label="Adicionar pessoa a um grupo">
          <p className="text-sm font-medium">Adicionar pessoa a um grupo</p>
          {semGrupo.length === 0 ? (
            <p className="text-sm text-github-text-muted">Todos os digitadores ativos já têm grupo. Para trocar, use Editar na lista.</p>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="Pessoa"
                value={pessoaNova}
                onChange={(e) => setPessoaNova(e.target.value)}
                className={`${campo} w-64`}
              >
                <option value="">Escolha quem está sem grupo</option>
                {semGrupo.map((d) => (
                  <option key={d.idPessoa} value={d.idPessoa}>
                    {d.nomeUsuario ?? `#${d.idPessoa}`}
                  </option>
                ))}
              </select>
              {pessoaNova && (
                <FormGrupo
                  opcoes={opcoes}
                  inicial={{ grupo: '', subGrupo: '' }}
                  salvando={salvandoId === Number(pessoaNova)}
                  onSalvar={(g, s) => salvar(Number(pessoaNova), g, s)}
                  onCancelar={() => {
                    setAdicionando(false)
                    setPessoaNova('')
                  }}
                />
              )}
            </div>
          )}
        </section>
      )}

      {erroSalvar && (
        <p role="alert" className="rounded-lg border border-other-redflag px-3 py-2 text-sm text-other-redflag">
          {erroSalvar}
        </p>
      )}

      {loading && <div className="h-40 animate-pulse rounded-xl border border-github-border bg-github-bg-card" aria-busy="true" />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {data && !error &&
        (visiveis.length === 0 ? (
          <EmptyState message="Nenhum digitador encontrado para esses filtros." />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-github-border bg-github-bg-card">
            <table className="w-full text-left text-sm">
              <thead className="bg-github-bg-hover text-[10px] uppercase tracking-wide text-github-text-muted">
                <tr>
                  <th className="py-2 pl-3 font-medium">ID</th>
                  <th className="px-2 py-2 font-medium">Nome</th>
                  <th className="hidden px-2 py-2 font-medium lg:table-cell">Usuário</th>
                  <th className="px-2 py-2 font-medium">Grupo</th>
                  <th className="px-2 py-2 font-medium">Subgrupo</th>
                  {EDICAO && <th className="py-2 pl-2 pr-3 text-right font-medium">Ações</th>}
                </tr>
              </thead>
              <tbody>
                {visiveis.map((d) => {
                  const tag = etiquetaGrupo(d.grupo, null)
                  const emEdicao = editando === d.idPessoa
                  const confirmando = removendo === d.idPessoa
                  const temGrupo = !!d.grupo?.trim()
                  return (
                    <tr key={d.idPessoa} className="border-t border-github-border hover:bg-github-bg-hover">
                      <td className="py-1.5 pl-3 text-xs text-github-text-muted">{d.idPessoa}</td>
                      <td className="min-w-[11rem] px-2 py-1.5 font-semibold">{d.nomeUsuario ?? '-'}</td>
                      <td className="hidden max-w-[14rem] truncate px-2 py-1.5 text-xs text-github-text-muted lg:table-cell">
                        {d.idUsuario ?? '-'}
                      </td>
                      {emEdicao ? (
                        <td className="px-2 py-1.5" colSpan={EDICAO ? 3 : 2}>
                          <FormGrupo
                            opcoes={opcoes}
                            inicial={{ grupo: d.grupo ?? '', subGrupo: d.subGrupo ?? '' }}
                            salvando={salvandoId === d.idPessoa}
                            onSalvar={(g, s) => salvar(d.idPessoa, g, s)}
                            onCancelar={() => setEditando(null)}
                          />
                        </td>
                      ) : (
                        <>
                          <td className="px-2 py-1.5">
                            <span className={`inline-block rounded px-1.5 text-[11px] font-medium ${tag.classe}`}>{tag.label}</span>
                          </td>
                          <td className="px-2 py-1.5 text-github-text-muted">{d.subGrupo ?? '-'}</td>
                          {EDICAO && (
                            <td className="py-1.5 pl-2 pr-3">
                              <div className="flex flex-nowrap items-center justify-end gap-1.5 whitespace-nowrap">
                                {confirmando ? (
                                  <>
                                    <span className="self-center text-xs text-github-text-muted">Remover do grupo?</span>
                                    <button
                                      type="button"
                                      disabled={salvandoId === d.idPessoa}
                                      onClick={() => salvar(d.idPessoa, '', '')}
                                      className="h-8 rounded-md bg-other-redflag px-3 text-xs font-medium text-white disabled:opacity-50"
                                    >
                                      Sim, remover
                                    </button>
                                    <button type="button" onClick={() => setRemovendo(null)} className={botao}>
                                      Não
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditando(d.idPessoa)
                                        setErroSalvar(null)
                                      }}
                                      className={botao}
                                    >
                                      {temGrupo ? <Pencil size={13} /> : <Plus size={13} />}
                                      {temGrupo ? 'Editar' : 'Adicionar'}
                                    </button>
                                    {temGrupo && (
                                      <button type="button" onClick={() => setRemovendo(d.idPessoa)} className={botao}>
                                        <Trash2 size={13} /> Remover
                                      </button>
                                    )}
                                  </>
                                )}
                              </div>
                            </td>
                          )}
                        </>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ))}
    </div>
  )
}
