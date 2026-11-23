import { Fragment, useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { ChevronDown, ChevronRight, Download, Search } from 'lucide-react'
import { PedidosDoClienteExclusiva } from '../components/PedidosDoClienteExclusiva'
import { EmptyState, ErrorState } from '../components/StateViews'
import { getCarteiraClientes, getCarteiraResumo, type CarteiraCliente, type SituacaoCarteira } from '../lib/exclusivas'
import { exportarExcel } from '../lib/exportarExcel'
import { formatCurrency } from '../lib/format'
import { useApiResource } from '../lib/useApiResource'

const TAMANHO = 50

const campo = 'h-9 rounded-md border border-github-border bg-github-bg-card px-2.5 text-sm text-github-text'

const SITUACOES: { id: SituacaoCarteira; label: string }[] = [
  { id: 'pendentes', label: 'A positivar' },
  { id: 'positivados', label: 'Positivados' },
  { id: 'todos', label: 'Todos' },
]

/** "POSITIVAÇÃO BOTICÁRIO EXCLUSIVO" -> "BOTICÁRIO EXCLUSIVO" (só para exibir). */
function nomeIndustria(nome: string | null) {
  return (nome ?? 'Sem indústria').replace(/^POSITIVAÇÃO\s+/i, '')
}

function data(valor: string | null) {
  return valor ? dayjs(valor).format('DD/MM/YYYY') : '-'
}

function percentual(parte: number, total: number) {
  if (total <= 0) return '0%'
  const p = (parte / total) * 100
  return `${p < 10 ? p.toFixed(1).replace('.', ',') : Math.round(p)}%`
}

interface ExclusivasCarteiraProps {
  mes: string
  onMes: (mes: string) => void
  /** Só as indústrias dessa pessoa; `null` = todas (gestor). */
  idPessoaFiltro: number | null
  ehGestor: boolean
}

/**
 * Painel da carteira: clientes de cada KPI de positivação (tblComissaoVendasKPICliente) e quantos já positivaram.
 * Mostra as indústrias exclusivas que têm lista de clientes; ao escolher uma, a lista paginada (50 por vez).
 */
export function ExclusivasCarteira({ mes, onMes, idPessoaFiltro, ehGestor }: ExclusivasCarteiraProps) {
  const referencia = `${mes}-01`

  const resumo = useApiResource((signal) => getCarteiraResumo(referencia, idPessoaFiltro, signal), [referencia, idPessoaFiltro])

  const [industria, setIndustria] = useState('')
  const [situacao, setSituacao] = useState<SituacaoCarteira>('pendentes')
  const [busca, setBusca] = useState('')
  const [buscaAplicada, setBuscaAplicada] = useState('')
  const [pagina, setPagina] = useState(1)
  const [aberto, setAberto] = useState<number | null>(null)
  const [exportando, setExportando] = useState<string | null>(null)
  const [erroExcel, setErroExcel] = useState<string | null>(null)

  // Quem tem uma indústria só já entra nela; senão escolhe um card.
  const unica = resumo.data && resumo.data.length === 1 ? (resumo.data[0].industria ?? '') : ''
  const industriaAtiva = industria || unica

  // A busca só dispara a consulta depois que a pessoa para de digitar.
  useEffect(() => {
    const t = setTimeout(() => {
      setBuscaAplicada(busca)
      setPagina(1)
      setAberto(null)
    }, 400)
    return () => clearTimeout(t)
  }, [busca])

  const clientes = useApiResource(
    (signal) =>
      industriaAtiva
        ? getCarteiraClientes(
            { referencia, industria: industriaAtiva, situacao, busca: buscaAplicada, pagina, tamanho: TAMANHO, idPessoaTelevendas: idPessoaFiltro },
            signal,
          )
        : Promise.resolve(null),
    [referencia, industriaAtiva, situacao, buscaAplicada, pagina, idPessoaFiltro],
  )

  function escolherIndustria(nome: string) {
    setIndustria((atual) => (atual === nome ? '' : nome))
    setPagina(1)
    setAberto(null)
  }

  /** Baixa em Excel a carteira com os filtros atuais: busca todas as páginas (200 por vez) e gera o arquivo. */
  async function baixarExcel() {
    if (!industriaAtiva || exportando) return
    setErroExcel(null)
    try {
      const todos: CarteiraCliente[] = []
      let paginaAtual = 1
      let totalGeral = 0
      do {
        setExportando(totalGeral ? `Buscando ${todos.length.toLocaleString('pt-BR')} de ${totalGeral.toLocaleString('pt-BR')}...` : 'Buscando...')
        const r = await getCarteiraClientes({
          referencia,
          industria: industriaAtiva,
          situacao,
          busca: buscaAplicada,
          pagina: paginaAtual,
          tamanho: 200,
          idPessoaTelevendas: idPessoaFiltro,
        })
        todos.push(...r.itens)
        totalGeral = r.total
        paginaAtual += 1
        if (r.itens.length === 0) break
      } while (todos.length < totalGeral)

      exportarExcel({
        arquivo: `exclusivas-carteira-${mes}-${nomeIndustria(industriaAtiva)}-${situacao}`.replace(/\s+/g, '-'),
        aba: 'Carteira',
        totalizar: true,
        linhas: todos,
        colunas: [
          { titulo: 'Código', tipo: 'numero', largura: 10, valor: (c) => c.idPessoaCliente },
          { titulo: 'Cliente', largura: 40, valor: (c) => c.nomeCliente },
          { titulo: 'Situação', largura: 14, valor: (c) => (c.positivou ? 'Positivado' : 'A positivar') },
          ...(ehGestor ? [{ titulo: 'Operador', largura: 32, valor: (c: (typeof todos)[number]) => c.digitador }] : []),
          { titulo: 'Pedidos', tipo: 'numero', largura: 9, valor: (c) => c.pedidos },
          { titulo: 'Venda líquida', tipo: 'moeda', largura: 14, valor: (c) => c.totalVenda },
          { titulo: '1ª compra', largura: 12, valor: (c) => (c.primeiraCompra ? dayjs(c.primeiraCompra).format('DD/MM/YYYY') : '') },
        ],
      })
    } catch {
      setErroExcel('Não foi possível gerar o Excel. Tente de novo.')
    } finally {
      setExportando(null)
    }
  }

  const total = clientes.data?.total ?? 0
  const paginas = Math.max(1, Math.ceil(total / TAMANHO))

  return (
    <div className="flex flex-col gap-3">
      <section aria-label="Filtros da carteira" className="flex flex-wrap items-center gap-2">
        <input
          type="month"
          aria-label="Mês"
          value={mes}
          onChange={(e) => {
            if (e.target.value) {
              onMes(e.target.value)
              setIndustria('')
              setPagina(1)
              setAberto(null)
            }
          }}
          className={campo}
        />
        {industriaAtiva && (
          <>
            <div role="tablist" aria-label="Situação" className="flex gap-0.5 rounded-lg bg-github-bg-hover p-0.5">
              {SITUACOES.map((s) => (
                <button
                  key={s.id}
                  role="tab"
                  type="button"
                  aria-selected={situacao === s.id}
                  onClick={() => {
                    setSituacao(s.id)
                    setPagina(1)
                    setAberto(null)
                  }}
                  className={`h-8 rounded-md px-3 text-sm font-medium ${
                    situacao === s.id ? 'bg-github-bg-card text-github-text shadow-sm' : 'text-github-text-muted'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <label className="relative block w-full sm:w-64">
              <span className="sr-only">Buscar cliente</span>
              <Search size={16} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-github-text-muted" />
              <input
                type="search"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar cliente ou código"
                className={`${campo} w-full pl-8`}
              />
            </label>
          </>
        )}
      </section>

      {resumo.loading && <div className="h-24 animate-pulse rounded-xl border border-github-border bg-github-bg-card" aria-busy="true" />}
      {resumo.error && <ErrorState message={resumo.error} onRetry={resumo.reload} />}

      {resumo.data && !resumo.error && resumo.data.length === 0 && (
        <EmptyState message="Nenhuma indústria exclusiva com lista de clientes para este usuário neste mês." />
      )}

      {resumo.data && resumo.data.length > 0 && (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-2.5" aria-label="Carteira por indústria">
          {resumo.data.map((r) => {
            const nome = r.industria ?? ''
            const ativa = industriaAtiva === nome
            const pct = r.carteira > 0 ? Math.min(100, (r.positivados / r.carteira) * 100) : 0
            return (
              <li key={nome}>
                <button
                  type="button"
                  aria-pressed={ativa}
                  onClick={() => escolherIndustria(nome)}
                  className={`w-full rounded-xl border p-3 text-left transition-colors ${
                    ativa
                      ? 'border-github-btn-green bg-github-bg-hover'
                      : 'border-github-border bg-github-bg-card hover:bg-github-bg-hover'
                  }`}
                >
                  <p className="truncate text-xs font-medium uppercase tracking-wide text-github-text-muted">{nomeIndustria(r.industria)}</p>
                  <p className="mt-1 text-2xl font-semibold leading-none">
                    {r.positivados.toLocaleString('pt-BR')}
                    <span className="ml-1 text-xs font-normal text-github-text-muted">
                      de {r.carteira.toLocaleString('pt-BR')} ({percentual(r.positivados, r.carteira)})
                    </span>
                  </p>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-github-bg-hover" aria-hidden>
                    <div className="h-full rounded-full bg-[#639922]" style={{ width: `${Math.max(pct, pct > 0 ? 2 : 0)}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-github-text-muted">
                    <strong className="font-semibold text-github-text">{r.pendentes.toLocaleString('pt-BR')}</strong> a positivar
                  </p>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {resumo.data && resumo.data.length > 1 && !industriaAtiva && (
        <p className="text-sm text-github-text-muted">Escolha uma indústria acima para ver os clientes da carteira.</p>
      )}

      {industriaAtiva && clientes.loading && (
        <div className="h-40 animate-pulse rounded-xl border border-github-border bg-github-bg-card" aria-busy="true" />
      )}
      {industriaAtiva && clientes.error && <ErrorState message={clientes.error} onRetry={clientes.reload} />}

      {industriaAtiva && clientes.data && !clientes.error &&
        (clientes.data.itens.length === 0 ? (
          <EmptyState message="Nenhum cliente encontrado para esses filtros." />
        ) : (
          <section aria-label="Clientes da carteira" className="flex flex-col gap-2">
            <div className="flex items-center justify-end gap-3">
              {erroExcel && <span className="text-sm text-other-redflag">{erroExcel}</span>}
              <button
                type="button"
                onClick={baixarExcel}
                disabled={!!exportando}
                className="flex h-9 items-center gap-1.5 rounded-md border border-github-border bg-github-bg-card px-3 text-sm font-medium hover:bg-github-bg-hover disabled:opacity-60"
              >
                <Download size={15} /> {exportando ?? `Exportar Excel (${total.toLocaleString('pt-BR')})`}
              </button>
            </div>
            <p className="text-sm text-github-text-muted">
              <strong className="font-semibold text-github-text">{total.toLocaleString('pt-BR')}</strong> clientes em{' '}
              {nomeIndustria(industriaAtiva)}
              {situacao === 'positivados' && ' · positivados no mês'}
              {situacao === 'pendentes' && ' · ainda sem positivação no mês'}
            </p>
            <div className="overflow-x-auto rounded-xl border border-github-border bg-github-bg-card">
              <table className="w-full text-left text-sm">
                <thead className="bg-github-bg-hover text-[10px] uppercase tracking-wide text-github-text-muted">
                  <tr>
                    <th className="py-2 pl-3 font-medium">Cliente</th>
                    <th className="px-2 py-2 font-medium">Situação</th>
                    {ehGestor && <th className="px-2 py-2 font-medium">Operador</th>}
                    <th className="px-2 py-2 text-right font-medium">Pedidos</th>
                    <th className="px-2 py-2 text-right font-medium">Venda líquida</th>
                    <th className="hidden py-2 pl-2 pr-3 font-medium md:table-cell">1ª compra</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.data.itens.map((c) => {
                    const aberta = aberto === c.idPessoaCliente
                    const temPedidos = c.pedidos > 0
                    return (
                      <Fragment key={c.idPessoaCliente}>
                        <tr
                          className={`border-t border-github-border hover:bg-github-bg-hover ${temPedidos ? 'cursor-pointer' : ''} ${aberta ? 'bg-github-bg-hover' : ''}`}
                          onClick={() => temPedidos && setAberto(aberta ? null : c.idPessoaCliente)}
                        >
                          <td className="max-w-[22rem] py-1.5 pl-3">
                            <div className="flex items-center gap-1.5">
                              {temPedidos ? (
                                aberta ? <ChevronDown size={15} className="shrink-0" /> : <ChevronRight size={15} className="shrink-0" />
                              ) : (
                                <span className="inline-block w-[15px] shrink-0" />
                              )}
                              <span className="min-w-0">
                                <span className="block truncate font-semibold">{c.nomeCliente ?? '-'}</span>
                                <span className="block text-xs text-github-text-muted">Cód. {c.idPessoaCliente}</span>
                              </span>
                            </div>
                          </td>
                          <td className="px-2 py-1.5">
                            <span
                              className={`inline-block whitespace-nowrap rounded px-1.5 text-[11px] font-medium ${
                                c.positivou ? 'bg-[#639922]/15 text-[#639922]' : 'bg-github-bg-hover text-github-text-muted'
                              }`}
                            >
                              {c.positivou ? 'Positivado' : 'A positivar'}
                            </span>
                          </td>
                          {ehGestor && <td className="max-w-[12rem] truncate px-2 py-1.5">{c.digitador ?? '-'}</td>}
                          <td className="px-2 py-1.5 text-right">{temPedidos ? c.pedidos : '-'}</td>
                          <td className="whitespace-nowrap px-2 py-1.5 text-right font-semibold">
                            {temPedidos ? formatCurrency(c.totalVenda) : '-'}
                          </td>
                          <td className="hidden whitespace-nowrap py-1.5 pl-2 pr-3 md:table-cell">{data(c.primeiraCompra)}</td>
                        </tr>
                        {aberta && (
                          <tr className="border-t border-github-border bg-github-bg-hover/40">
                            <td colSpan={ehGestor ? 6 : 5} className="px-3 py-2">
                              <PedidosDoClienteExclusiva
                                referencia={referencia}
                                idPessoaCliente={c.idPessoaCliente}
                                industria={industriaAtiva}
                                idPessoa={idPessoaFiltro}
                              />
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {paginas > 1 && (
              <nav aria-label="Paginação" className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  disabled={pagina <= 1}
                  onClick={() => {
                    setPagina((p) => Math.max(1, p - 1))
                    setAberto(null)
                  }}
                  className="h-9 rounded-md border border-github-border bg-github-bg-card px-3 text-sm font-medium disabled:opacity-50"
                >
                  Anterior
                </button>
                <span className="text-sm text-github-text-muted">
                  Página {pagina.toLocaleString('pt-BR')} de {paginas.toLocaleString('pt-BR')}
                </span>
                <button
                  type="button"
                  disabled={pagina >= paginas}
                  onClick={() => {
                    setPagina((p) => Math.min(paginas, p + 1))
                    setAberto(null)
                  }}
                  className="h-9 rounded-md border border-github-border bg-github-bg-card px-3 text-sm font-medium disabled:opacity-50"
                >
                  Próxima
                </button>
              </nav>
            )}
          </section>
        ))}
    </div>
  )
}
