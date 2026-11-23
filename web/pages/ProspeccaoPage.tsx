import { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { Search } from 'lucide-react'
import { PERMITIR_TROCA_USUARIO, useUsuario } from '../auth/UsuarioContext'
import { useGestor } from '../auth/useGestor'
import { ProgressBar } from '../components/ProgressBar'
import { EmptyState, ErrorState } from '../components/StateViews'
import { formatCurrency } from '../lib/format'
import { getProspeccaoClientes, getProspeccaoMeses, getProspeccaoResumo } from '../lib/prospeccao'
import { ProspeccaoCarteira } from './ProspeccaoCarteira'
import { useApiResource } from '../lib/useApiResource'

const PAGE_SIZE = 30
const TODOS = ''
const campo = 'h-9 rounded-md border border-github-border bg-github-bg-card px-2.5 text-sm text-github-text'

/** Competência é uma data (ex.: 31/10/2026); a do mês corrente pode ser parcial (ex.: 18/11/2026). */
const rotuloCompetencia = (competencia: string) => dayjs(competencia).format('DD/MM/YYYY')

/** "SEM VENDAS NOS ÚLTIMOS 6 MESES" -> "Sem vendas nos últimos 6 meses" (só para exibir). */
function tipoEmTexto(tipo: string | null) {
  const t = (tipo ?? 'Sem tipo').toLowerCase()
  return t.charAt(0).toUpperCase() + t.slice(1)
}

function corDoTipo(tipo: string | null) {
  const t = (tipo ?? '').toUpperCase()
  if (t.includes('RECENTE')) return 'bg-[#639922]/15 text-[#639922]'
  if (t.includes('SEM VENDA')) return 'bg-[#BA7517]/15 text-[#BA7517]'
  return 'bg-github-bg-hover text-github-text-muted'
}

/**
 * Prospecção por usuário logado ("Entrar como…"): painel de clientes do mês.
 *  - Gestor: vê os clientes de todas as operadoras e pode filtrar por uma.
 *  - Demais: só os próprios clientes.
 */
export default function ProspeccaoPage() {
  const { idPessoa, usuario } = useUsuario()
  const { ehGestor, carregando: carregandoGestor } = useGestor(idPessoa)
  const pronto = !!idPessoa && !carregandoGestor
  const idPessoaFiltro = ehGestor ? null : idPessoa

  const meses = useApiResource((signal) => getProspeccaoMeses(signal), [])
  const [mes, setMes] = useState<string | null>(null) // competência: "YYYY-MM-DD"
  const [tipo, setTipo] = useState(TODOS)
  const [operadora, setOperadora] = useState(TODOS)
  const [busca, setBusca] = useState('')
  const [limite, setLimite] = useState(PAGE_SIZE)
  const [aba, setAba] = useState<'resumo' | 'clientes' | 'carteira'>('resumo')

  /** Só as competências do mês atual; se o mês ainda não tem nenhuma, a mais recente. */
  const competencias = useMemo(() => {
    const todas = meses.data ?? []
    const doMes = todas.filter((m) => dayjs(m.competencia).isSame(dayjs(), 'month'))
    return doMes.length > 0 ? doMes : todas.slice(0, 1)
  }, [meses.data])

  useEffect(() => {
    if (mes != null || !competencias.length) return
    setMes(dayjs(competencias[0].competencia).format('YYYY-MM-DD'))
  }, [competencias, mes])

  const clientes = useApiResource(
    (signal) => (pronto && mes ? getProspeccaoClientes(mes, idPessoaFiltro, signal) : Promise.resolve([])),
    [mes, idPessoa, ehGestor, carregandoGestor],
  )

  const resumo = useApiResource(
    (signal) => (pronto && mes ? getProspeccaoResumo(mes, idPessoaFiltro, signal) : Promise.resolve([])),
    [mes, idPessoa, ehGestor, carregandoGestor],
  )
  const linhasResumo = useMemo(() => resumo.data ?? [], [resumo.data])
  const totalResumo = useMemo(
    () => ({
      positivados: linhasResumo.reduce((s, r) => s + r.totalPositivado, 0),
      faturado: linhasResumo.reduce((s, r) => s + r.totalFaturado, 0),
      lojaVirtual: linhasResumo.reduce((s, r) => s + r.totalLojaVirtual, 0),
      internet: linhasResumo.reduce((s, r) => s + r.totalInternet, 0),
      premio: linhasResumo.reduce((s, r) => s + r.premio, 0),
    }),
    [linhasResumo],
  )
  /** Gestor começa no resumo do time; operadora vai direto aos próprios clientes. */
  const abaAtiva = ehGestor ? aba : aba === 'carteira' ? 'carteira' : 'clientes'

  const todos = useMemo(() => clientes.data ?? [], [clientes.data])
  const tipos = useMemo(() => [...new Set(todos.map((c) => c.tipoProspeccao).filter((t): t is string => !!t))].sort(), [todos])
  const operadoras = useMemo(
    () => [...new Set(todos.map((c) => c.nomeDigitador).filter((d): d is string => !!d))].sort((a, b) => a.localeCompare(b, 'pt-BR')),
    [todos],
  )
  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return todos.filter(
      (c) =>
        (!tipo || c.tipoProspeccao === tipo) &&
        (!operadora || c.nomeDigitador === operadora) &&
        (!termo || (c.nomeCliente ?? '').toLowerCase().includes(termo) || String(c.idCliente).includes(termo)),
    )
  }, [todos, tipo, operadora, busca])

  const soma = (f: (c: (typeof todos)[number]) => number) => visiveis.reduce((s, c) => s + f(c), 0)
  const colunasExtras = ehGestor ? 1 : 0

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h1 className="text-lg font-extrabold">
          Prospecção
          <span className="ml-2 text-xs font-medium tracking-[0.15em] text-github-btn-green-hover">PAINEL DE CLIENTES</span>
        </h1>
        {pronto && todos.length > 0 && (
          <p className="text-sm text-github-text-muted">
            {usuario?.operatorName && <>{usuario.operatorName}{ehGestor && ' (gestor)'} · </>}
            <strong className="font-semibold text-github-text">{todos.length.toLocaleString('pt-BR')}</strong> clientes na competência
          </p>
        )}
      </div>

      {meses.error ? (
        <ErrorState message={meses.error} onRetry={meses.reload} />
      ) : !pronto ? (
        <EmptyState
          message={
            PERMITIR_TROCA_USUARIO
              ? 'Escolha um usuário em “Entrar como…” no topo para ver a prospecção.'
              : 'Faça login para ver a prospecção.'
          }
        />
      ) : (
        <>
          {(
            <div role="tablist" aria-label="Visão" className="flex w-fit gap-0.5 rounded-lg bg-github-bg-hover p-0.5">
              {(
                [
                  ...(ehGestor ? [{ id: 'resumo', label: 'Resumo' } as const] : []),
                  { id: 'clientes', label: 'Clientes' } as const,
                  { id: 'carteira', label: 'Carteira' } as const,
                ]
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={abaAtiva === t.id}
                  onClick={() => setAba(t.id)}
                  className={`h-8 rounded-md px-3 text-sm font-medium ${abaAtiva === t.id ? 'bg-github-bg-card shadow-sm' : 'text-github-text-muted'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-end gap-2">
            {abaAtiva !== 'carteira' && (
            <label className="flex flex-col gap-1 text-xs text-github-text-muted">
              Competência
              <select
                className={campo}
                value={mes ?? ''}
                onChange={(e) => {
                  setMes(e.target.value)
                  setTipo(TODOS)
                  setOperadora(TODOS)
                  setLimite(PAGE_SIZE)
                }}
              >
                {competencias.map((m) => {
                  const v = dayjs(m.competencia).format('YYYY-MM-DD')
                  return (
                    <option key={v} value={v}>
                      {rotuloCompetencia(m.competencia)}
                    </option>
                  )
                })}
              </select>
            </label>
            )}
            {abaAtiva === 'clientes' && (
              <>
            <label className="flex flex-col gap-1 text-xs text-github-text-muted">
              Tipo
              <select className={campo} value={tipo} onChange={(e) => { setTipo(e.target.value); setLimite(PAGE_SIZE) }}>
                <option value={TODOS}>Todos</option>
                {tipos.map((t) => (
                  <option key={t} value={t}>
                    {tipoEmTexto(t)}
                  </option>
                ))}
              </select>
            </label>
            {ehGestor && (
              <label className="flex flex-col gap-1 text-xs text-github-text-muted">
                Operadora
                <select className={campo} value={operadora} onChange={(e) => { setOperadora(e.target.value); setLimite(PAGE_SIZE) }}>
                  <option value={TODOS}>Todas</option>
                  {operadoras.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label className="relative flex flex-col gap-1 text-xs text-github-text-muted">
              Buscar cliente
              <Search size={14} className="pointer-events-none absolute bottom-2.5 left-2.5 text-github-text-muted" />
              <input
                className={`${campo} pl-8`}
                placeholder="Nome ou código"
                value={busca}
                onChange={(e) => { setBusca(e.target.value); setLimite(PAGE_SIZE) }}
              />
            </label>
              </>
            )}
          </div>

          {abaAtiva === 'carteira' ? (
            mes ? (
              <ProspeccaoCarteira
                idPessoaTelevendas={idPessoaFiltro}
                operadoras={linhasResumo
                  .filter((r) => r.idPessoaTelevendas != null)
                  .map((r) => ({ id: r.idPessoaTelevendas as number, nome: r.nomeDigitador ?? `Pessoa ${r.idPessoaTelevendas}` }))}
              />
            ) : null
          ) : abaAtiva === 'resumo' ? (
            resumo.error ? (
              <ErrorState message={resumo.error} onRetry={resumo.reload} />
            ) : resumo.loading || meses.loading ? (
              <div className="h-40 animate-pulse rounded-xl border border-github-border bg-github-bg-card" aria-busy="true" />
            ) : linhasResumo.length === 0 ? (
              <EmptyState message="Nenhum cliente em prospecção nesta competência." />
            ) : (
              <section aria-label="Resumo por operadora" className="overflow-x-auto rounded-xl border border-github-border bg-github-bg-card">
                <table className="w-full text-left text-sm">
                  <thead className="text-[11px] uppercase tracking-wide text-github-text-muted">
                    <tr className="border-b border-github-border">
                      <th className="py-2 pl-3 font-medium">Operadora</th>
                      <th className="px-2 py-2 text-right font-medium">Positivados</th>
                      <th className="px-2 py-2 text-right font-medium">Faturado</th>
                      <th className="px-2 py-2 text-right font-medium">Loja virtual</th>
                      <th className="px-2 py-2 text-right font-medium">Internet</th>
                      <th className="py-2 pl-2 pr-3 text-right font-medium">Prêmio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {linhasResumo.map((r) => (
                      <tr
                        key={r.idPessoaTelevendas ?? r.nomeDigitador}
                        onClick={() => {
                          setOperadora(r.nomeDigitador ?? TODOS)
                          setAba('clientes')
                        }}
                        className="cursor-pointer border-b border-github-border hover:bg-github-bg-hover"
                      >
                        <td className="py-2 pl-3 font-medium">{r.nomeDigitador ?? `Pessoa ${r.idPessoaTelevendas}`}</td>
                        <td className="px-2 py-2 text-right">{r.totalPositivado.toLocaleString('pt-BR')}</td>
                        <td className="whitespace-nowrap px-2 py-2 text-right font-semibold">{formatCurrency(r.totalFaturado)}</td>
                        <td className="whitespace-nowrap px-2 py-2 text-right">{formatCurrency(r.totalLojaVirtual)}</td>
                        <td className="whitespace-nowrap px-2 py-2 text-right">{formatCurrency(r.totalInternet)}</td>
                        <td className="whitespace-nowrap py-2 pl-2 pr-3 text-right font-semibold">
                          {r.premio > 0 ? formatCurrency(r.premio) : <span className="font-normal text-github-text-muted">-</span>}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-github-bg-hover font-semibold">
                      <td className="py-2 pl-3">Total</td>
                      <td className="px-2 py-2 text-right">{totalResumo.positivados.toLocaleString('pt-BR')}</td>
                      <td className="whitespace-nowrap px-2 py-2 text-right">{formatCurrency(totalResumo.faturado)}</td>
                      <td className="whitespace-nowrap px-2 py-2 text-right">{formatCurrency(totalResumo.lojaVirtual)}</td>
                      <td className="whitespace-nowrap px-2 py-2 text-right">{formatCurrency(totalResumo.internet)}</td>
                      <td className="whitespace-nowrap py-2 pl-2 pr-3 text-right">{formatCurrency(totalResumo.premio)}</td>
                    </tr>
                  </tbody>
                </table>
              </section>
            )
          ) : clientes.error ? (
            <ErrorState message={clientes.error} onRetry={clientes.reload} />
          ) : clientes.loading || meses.loading ? (
            <div className="h-40 animate-pulse rounded-xl border border-github-border bg-github-bg-card" aria-busy="true" />
          ) : todos.length === 0 ? (
            <EmptyState message={`Nenhum cliente em prospecção nesta competência${ehGestor ? '' : ' para você'}.`} />
          ) : (
            <>
              {!ehGestor && linhasResumo[0] && (
                <section aria-label="Seu resultado" className="rounded-xl border border-github-border bg-github-bg-card px-3 py-2.5">
                  <p className="text-sm">
                    <strong className="font-semibold">{linhasResumo[0].totalPositivado}</strong> positivados de{' '}
                    <strong className="font-semibold">{linhasResumo[0].metaPositivados}</strong> para ganhar prêmio
                    {linhasResumo[0].premio > 0 ? (
                      <>
                        {' '}
                        · prêmio de <strong className="font-semibold text-[#3B6D11]">{formatCurrency(linhasResumo[0].premio)}</strong>
                      </>
                    ) : (
                      <>
                        {' '}
                        · faltam <strong className="font-semibold">{Math.max(linhasResumo[0].metaPositivados - linhasResumo[0].totalPositivado, 0)}</strong> para começar a ganhar
                      </>
                    )}
                  </p>
                  <div className="mt-2">
                    <ProgressBar
                      percent={(linhasResumo[0].totalPositivado / Math.max(linhasResumo[0].metaPositivados, 1)) * 100}
                      colorClass={linhasResumo[0].premio > 0 ? 'bg-[#3B6D11]' : 'bg-[#EF9F27]'}
                    />
                  </div>
                </section>
              )}

              <section aria-label="Totais" className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
                {[
                  { rotulo: 'Clientes', valor: visiveis.length.toLocaleString('pt-BR') },
                  { rotulo: 'Faturado', valor: formatCurrency(soma((c) => c.totalFaturado)) },
                  { rotulo: 'Loja virtual', valor: formatCurrency(soma((c) => c.faturamentoLojaVirtual)) },
                  { rotulo: 'Internet', valor: formatCurrency(soma((c) => c.faturamentoInternet)) },
                ].map((s) => (
                  <div key={s.rotulo} className="rounded-xl border border-github-border bg-github-bg-card px-3 py-2">
                    <p className="text-[11px] uppercase tracking-wide text-github-text-muted">{s.rotulo}</p>
                    <p className="text-lg font-semibold leading-tight">{s.valor}</p>
                  </div>
                ))}
              </section>

              <section aria-label="Clientes" className="overflow-x-auto rounded-xl border border-github-border bg-github-bg-card">
                <table className="w-full text-left text-sm">
                  <thead className="text-[11px] uppercase tracking-wide text-github-text-muted">
                    <tr className="border-b border-github-border">
                      <th className="py-2 pl-3 font-medium">Cliente</th>
                      {ehGestor && <th className="px-2 py-2 font-medium">Operadora</th>}
                      <th className="px-2 py-2 text-right font-medium">Mês nº</th>
                      <th className="px-2 py-2 font-medium">Tipo</th>
                      <th className="px-2 py-2 text-right font-medium">Faturado</th>
                      <th className="hidden px-2 py-2 text-right font-medium md:table-cell">Loja virtual</th>
                      <th className="hidden py-2 pl-2 pr-3 text-right font-medium md:table-cell">Internet</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visiveis.slice(0, limite).map((c) => (
                      <tr key={`${c.idCliente}-${c.idPessoaTelevendas}`} className="border-b border-github-border last:border-0">
                        <td className="py-2 pl-3">
                          <span className="font-medium">{c.nomeCliente ?? `Cliente ${c.idCliente}`}</span>
                          <span className="ml-1.5 text-xs text-github-text-muted">{c.idCliente}</span>
                        </td>
                        {ehGestor && <td className="px-2 py-2 text-github-text-muted">{c.nomeDigitador ?? '-'}</td>}
                        <td className="px-2 py-2 text-right">{c.sequenciaMeses ?? '-'}</td>
                        <td className="px-2 py-2">
                          <span className={`inline-block whitespace-nowrap rounded px-1.5 text-[11px] font-medium ${corDoTipo(c.tipoProspeccao)}`}>
                            {tipoEmTexto(c.tipoProspeccao)}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-2 py-2 text-right font-semibold">{formatCurrency(c.totalFaturado)}</td>
                        <td className="hidden whitespace-nowrap px-2 py-2 text-right md:table-cell">{formatCurrency(c.faturamentoLojaVirtual)}</td>
                        <td className="hidden whitespace-nowrap py-2 pl-2 pr-3 text-right md:table-cell">{formatCurrency(c.faturamentoInternet)}</td>
                      </tr>
                    ))}
                    {visiveis.length === 0 && (
                      <tr>
                        <td colSpan={6 + colunasExtras} className="py-6 text-center text-sm text-github-text-muted">
                          Nenhum cliente com esses filtros.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </section>

              {visiveis.length > limite && (
                <button
                  type="button"
                  onClick={() => setLimite((n) => n + PAGE_SIZE)}
                  className="h-9 rounded-md border border-github-border bg-github-bg-card text-sm font-medium"
                >
                  Mostrar mais ({visiveis.length - limite})
                </button>
              )}
              <p className="text-xs text-github-text-muted">
                Competência de {dayjs(todos[0].mesCompetencia).format('DD/MM/YYYY')}. “Mês nº” é há quantos meses seguidos o cliente está em prospecção.
              </p>
            </>
          )}
        </>
      )}
    </div>
  )
}
