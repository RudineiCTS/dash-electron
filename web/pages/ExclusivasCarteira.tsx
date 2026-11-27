import { Fragment, useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { ChevronDown, ChevronRight, Download, Search } from 'lucide-react'
import { PedidosDoClienteExclusiva } from '../components/PedidosDoClienteExclusiva'
import { EmptyState, ErrorState } from '../components/StateViews'
import { ThOrdenavel } from '../components/ThOrdenavel'
import type { Ordenacao } from '../lib/ordenar'
import { getCarteiraClientes, getCarteiraResumo, type CarteiraCliente, type SituacaoCarteira } from '../lib/exclusivas'
import { exportarExcel } from '../lib/exportarExcel'
import { formatCurrency } from '../lib/format'
import { useApiResource } from '../lib/useApiResource'

const TAMANHO = 50

const campo = 'h-9 rounded-md border border-github-border bg-github-bg-card px-2.5 text-sm text-github-text'

const SITUACOES: { id: SituacaoCarteira; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'positivados', label: 'Positivados' },
  { id: 'pendentes', label: 'Não positivados' },
  { id: 'fora', label: 'Fora da positivação (lista de exclusão)' },
]

/** "POSITIVAÇÃO BOTICÁRIO EXCLUSIVO" -> "BOTICÁRIO EXCLUSIVO" (só para exibir). */
function nomeIndustria(nome: string | null) {
  return (nome ?? 'Sem indústria').replace(/^(POSITIVAÇÃO|EXCLUSIVA)\s+/i, '')
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
  /** Coluna ordenada (a lista é paginada no servidor, então a ordenação também é feita lá). */
  const [ord, setOrd] = useState<Ordenacao | null>(null)
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
            {
              referencia,
              industria: industriaAtiva,
              situacao,
              busca: buscaAplicada,
              pagina,
              tamanho: TAMANHO,
              idPessoaTelevendas: idPessoaFiltro,
              ordenar: ord?.chave,
              direcao: ord?.direcao,
            },
            signal,
          )
        : Promise.resolve(null),
    [referencia, industriaAtiva, situacao, buscaAplicada, pagina, idPessoaFiltro, ord],
  )

  /** Primeiro clique: texto de A a Z e números do maior para o menor; segundo inverte; terceiro volta à ordem padrão. */
  function alternarOrdem(chave: string) {
    const inicial: Ordenacao['direcao'] = chave === 'cliente' || chave === 'operador' ? 'asc' : 'desc'
    setOrd((atual) => {
      if (!atual || atual.chave !== chave) return { chave, direcao: inicial }
      return atual.direcao === inicial ? { chave, direcao: inicial === 'asc' ? 'desc' : 'asc' } : null
    })
    setPagina(1)
    setAberto(null)
  }

  // indústria sem carteira (só lista de exclusão, flag N): abre direto em "Fora da positivação"
  const resumoAtivo = resumo.data?.find((x) => (x.industria ?? '') === industriaAtiva)
  const semCarteira = !!resumoAtivo && resumoAtivo.carteira === 0 && resumoAtivo.foraDaPositivacao > 0
  useEffect(() => {
    if (semCarteira) setSituacao((s) => (s === 'pendentes' || s === 'positivados' ? 'fora' : s))
  }, [semCarteira])

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
          { titulo: 'Situação', largura: 14, valor: (c) => (c.foraDaPositivacao ? 'Fora da positivação' : c.positivou ? 'Positivado' : 'Não positivado') },
          ...(ehGestor ? [{ titulo: 'Operador', largura: 32, valor: (c: (typeof todos)[number]) => c.digitador }] : []),
          { titulo: 'Pedidos', tipo: 'numero', largura: 9, valor: (c) => c.pedidos },
          { titulo: 'Venda líquida', tipo: 'moeda', largura: 14, valor: (c) => c.totalVenda },
          { titulo: '1ª compra', largura: 12, valor: (c) => (c.primeiraCompra ? dayjs(c.primeiraCompra).format('DD/MM/YYYY') : '') },
          { titulo: 'Vendas 3 meses', tipo: 'moeda', largura: 16, valor: (c) => c.vendas3Meses },
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
            <label className="flex flex-col gap-1 text-xs text-github-text-muted">
              Situação
              <select
                className={campo}
                value={situacao}
                onChange={(e) => {
                  setSituacao(e.target.value as SituacaoCarteira)
                  setPagina(1)
                  setAberto(null)
                }}
              >
                {SITUACOES.filter((x) => x.id !== 'fora' || (resumoAtivo?.foraDaPositivacao ?? 0) > 0).map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.label}
                  </option>
                ))}
              </select>
            </label>
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
              <li key={nome} className="flex">
                <button
                  type="button"
                  aria-pressed={ativa}
                  onClick={() => escolherIndustria(nome)}
                  className={`flex w-full flex-col rounded-xl border p-3 text-left transition-colors ${
                    ativa
                      ? 'border-github-btn-green bg-github-bg-hover'
                      : 'border-github-border bg-github-bg-card hover:bg-github-bg-hover'
                  }`}
                >
                  <p className="truncate text-xs font-medium uppercase tracking-wide text-github-text-muted">{nomeIndustria(r.industria)}</p>
                  <p className="mt-1 text-2xl font-semibold leading-none">
                    {r.carteira === 0 && r.foraDaPositivacao > 0 ? (
                      <>
                        Sem carteira
                      </>
                    ) : (
                      <>
                        {r.positivados.toLocaleString('pt-BR')}
                        <span className="ml-1 text-xs font-normal text-github-text-muted">
                          de {r.carteira.toLocaleString('pt-BR')} ({percentual(r.positivados, r.carteira)})
                        </span>
                      </>
                    )}
                  </p>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-github-bg-hover" aria-hidden>
                    <div className="h-full rounded-full bg-[#639922]" style={{ width: `${Math.max(pct, pct > 0 ? 2 : 0)}%` }} />
                  </div>
                  <p className="mt-auto pt-2 text-xs text-github-text-muted">
                    {r.carteira === 0 && r.foraDaPositivacao > 0 ? (
                      <>
                        <strong className="font-semibold text-github-text">{r.foraDaPositivacao.toLocaleString('pt-BR')}</strong> na lista de exclusão. Veja a aba Oportunidades.
                      </>
                    ) : (
                      <>
                        <strong className="font-semibold text-github-text">{r.pendentes.toLocaleString('pt-BR')}</strong> não positivados
                        {r.foraDaPositivacao > 0 && (
                          <>
                            {' '}
                            · <strong className="font-semibold text-github-text">{r.foraDaPositivacao.toLocaleString('pt-BR')}</strong> fora da positivação
                          </>
                        )}
                      </>
                    )}
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
            {(() => {
              const r = resumo.data?.find((x) => (x.industria ?? '') === industriaAtiva)
              return r ? (
                <p className="text-sm text-github-text-muted">
                  {r.carteira === 0 && r.foraDaPositivacao > 0 ? (
                    <>
                      {nomeIndustria(industriaAtiva)} não tem carteira: a lista abaixo tem os{' '}
                      <strong className="font-semibold text-github-text">{r.foraDaPositivacao.toLocaleString('pt-BR')}</strong> clientes que ficam fora da positivação (lista de exclusão).
                      Para vender, use a aba Oportunidades.
                    </>
                  ) : (
                    <>
                      <strong className="font-semibold text-github-text">{r.carteira.toLocaleString('pt-BR')}</strong> clientes na carteira de{' '}
                      {nomeIndustria(industriaAtiva)} ·{' '}
                      <strong className="font-semibold text-github-text">{r.positivados.toLocaleString('pt-BR')}</strong> positivados ·{' '}
                      <strong className="font-semibold text-github-text">{r.pendentes.toLocaleString('pt-BR')}</strong> não positivados
                      {r.foraDaPositivacao > 0 && (
                        <>
                          {' '}
                          · <strong className="font-semibold text-github-text">{r.foraDaPositivacao.toLocaleString('pt-BR')}</strong> fora da positivação (lista de exclusão)
                        </>
                      )}
                    </>
                  )}
                </p>
              ) : null
            })()}
            <div className="overflow-x-auto rounded-xl border border-github-border bg-github-bg-card">
              <table className="w-full text-left text-sm">
                <thead className="bg-github-bg-hover text-[10px] uppercase tracking-wide text-github-text-muted">
                  <tr>
                    <ThOrdenavel rotulo="Cliente" chave="cliente" ord={ord} onAlternar={alternarOrdem} className="py-2 pl-3 font-medium" />
                    <ThOrdenavel rotulo="Situação" chave="situacao" ord={ord} onAlternar={alternarOrdem} className="px-2 py-2 font-medium" />
                    {ehGestor && <ThOrdenavel rotulo="Operador" chave="operador" ord={ord} onAlternar={alternarOrdem} className="px-2 py-2 font-medium" />}
                    <ThOrdenavel rotulo="Pedidos" chave="pedidos" ord={ord} onAlternar={alternarOrdem} direita className="px-2 py-2 text-right font-medium" />
                    <ThOrdenavel rotulo="Venda líquida" chave="venda" ord={ord} onAlternar={alternarOrdem} direita className="px-2 py-2 text-right font-medium" />
                    <ThOrdenavel rotulo="1ª compra" chave="primeira" ord={ord} onAlternar={alternarOrdem} className="hidden px-2 py-2 font-medium md:table-cell" />
                    <ThOrdenavel rotulo="Vendas 3 meses" chave="vendas3m" ord={ord} onAlternar={alternarOrdem} direita className="whitespace-nowrap py-2 pl-2 pr-3 text-right font-medium" />
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
                              {c.foraDaPositivacao ? 'Fora da positivação' : c.positivou ? 'Positivado' : 'Não positivado'}
                            </span>
                          </td>
                          {ehGestor && <td className="max-w-[12rem] truncate px-2 py-1.5">{c.digitador ?? '-'}</td>}
                          <td className="px-2 py-1.5 text-right">{temPedidos ? c.pedidos : '-'}</td>
                          <td className="whitespace-nowrap px-2 py-1.5 text-right font-semibold">
                            {temPedidos ? formatCurrency(c.totalVenda) : '-'}
                          </td>
                          <td className="hidden whitespace-nowrap px-2 py-1.5 md:table-cell">{data(c.primeiraCompra)}</td>
                          <td className="whitespace-nowrap py-1.5 pl-2 pr-3 text-right font-semibold">{formatCurrency(c.vendas3Meses)}</td>
                        </tr>
                        {aberta && (
                          <tr className="border-t border-github-border bg-github-bg-hover/40">
                            <td colSpan={ehGestor ? 7 : 6} className="px-3 py-2">
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
