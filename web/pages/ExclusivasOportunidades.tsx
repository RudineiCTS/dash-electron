import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { Download, Search } from 'lucide-react'
import { EmptyState, ErrorState } from '../components/StateViews'
import { ThOrdenavel } from '../components/ThOrdenavel'
import { getOportunidadesClientes, getOportunidadesResumo } from '../lib/exclusivas'
import { exportarExcel } from '../lib/exportarExcel'
import { formatCurrency } from '../lib/format'
import { useOrdenacao } from '../lib/ordenar'
import { useApiResource } from '../lib/useApiResource'

const PAGE_SIZE = 40
const campo = 'h-9 rounded-md border border-github-border bg-github-bg-card px-2.5 text-sm text-github-text'

/** "POSITIVAÇÃO BOTICÁRIO EXCLUSIVO" -> "BOTICÁRIO EXCLUSIVO" (só para exibir). */
function nomeIndustria(nome: string | null) {
  return (nome ?? 'Sem indústria').replace(/^(POSITIVAÇÃO|EXCLUSIVA)\s+/i, '')
}

interface Props {
  /** Só as indústrias dessa pessoa; `null` = todas (gestor). */
  idPessoaFiltro: number | null
}

/**
 * Oportunidades das exclusivas (Nestlé, P&G HPC, Flora, J&J, Ontex e, só da carteira, Boticário, Haleon e Reckitt): os 600 clientes que mais compraram a
 * indústria nos últimos 6 meses e que ainda não positivaram no mês. A base é recalculada na carga diária.
 */
export function ExclusivasOportunidades({ idPessoaFiltro }: Props) {
  const resumo = useApiResource((signal) => getOportunidadesResumo(idPessoaFiltro, signal), [idPessoaFiltro])
  const [industria, setIndustria] = useState('')
  const [busca, setBusca] = useState('')
  const [limite, setLimite] = useState(PAGE_SIZE)

  // quem tem uma indústria só já entra nela; senão escolhe um card
  const unica = resumo.data && resumo.data.length === 1 ? (resumo.data[0].industria ?? '') : ''
  const industriaAtiva = industria || unica

  const clientes = useApiResource(
    (signal) => (industriaAtiva ? getOportunidadesClientes(industriaAtiva, idPessoaFiltro, signal) : Promise.resolve([])),
    [industriaAtiva, idPessoaFiltro],
  )

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    const todos = clientes.data ?? []
    return termo ? todos.filter((c) => (c.nomeCliente ?? '').toLowerCase().includes(termo) || String(c.idPessoaCliente).includes(termo)) : todos
  }, [clientes.data, busca])

  const { ordenadas, ord, alternar } = useOrdenacao(visiveis, {
    posicao: (c) => c.posicao,
    cliente: (c) => c.nomeCliente,
    valor: (c) => c.valor6Meses,
    pedidos: (c) => c.pedidos6Meses,
    meses: (c) => c.mesesComCompra,
    ultima: (c) => c.ultimaCompra,
    dias: (c) => c.diasSemComprar,
    ticket: (c) => c.ticketMedio,
  })

  const geradoEm = resumo.data?.find((r) => r.geradoEm)?.geradoEm

  function escolher(nome: string) {
    setIndustria((atual) => (atual === nome ? '' : nome))
    setLimite(PAGE_SIZE)
    setBusca('')
  }

  function baixarExcel() {
    exportarExcel({
      arquivo: `exclusivas-oportunidades-${nomeIndustria(industriaAtiva)}`.replace(/\s+/g, '-'),
      aba: 'Oportunidades',
      linhas: ordenadas,
      colunas: [
        { titulo: 'Posição', tipo: 'numero', largura: 9, valor: (c) => c.posicao },
        { titulo: 'Código', tipo: 'numero', largura: 10, valor: (c) => c.idPessoaCliente },
        { titulo: 'Cliente', largura: 40, valor: (c) => c.nomeCliente },
        { titulo: 'Valor em 6 meses', tipo: 'moeda', largura: 16, valor: (c) => c.valor6Meses },
        { titulo: 'Pedidos', tipo: 'numero', largura: 9, valor: (c) => c.pedidos6Meses },
        { titulo: 'Meses com compra (de 6)', tipo: 'numero', largura: 22, valor: (c) => c.mesesComCompra },
        { titulo: 'Última compra', largura: 13, valor: (c) => (c.ultimaCompra ? dayjs(c.ultimaCompra).format('DD/MM/YYYY') : '') },
        { titulo: 'Dias sem comprar', tipo: 'numero', largura: 16, valor: (c) => c.diasSemComprar },
        { titulo: 'Ticket médio', tipo: 'moeda', largura: 14, valor: (c) => c.ticketMedio },
        { titulo: 'Telefone', largura: 16, valor: (c) => c.telefone },
        { titulo: 'Telefone 2', largura: 16, valor: (c) => c.telefone2 },
      ],
    })
  }

  if (resumo.loading) return <div className="h-24 animate-pulse rounded-xl border border-github-border bg-github-bg-card" aria-busy="true" />
  if (resumo.error) return <ErrorState message={resumo.error} onRetry={resumo.reload} />
  if (!resumo.data?.length) {
    return <EmptyState message="Não há base de oportunidades para as suas exclusivas neste momento." />
  }

  return (
    <section aria-label="Oportunidades das exclusivas" className="flex flex-col gap-3">
      <p className="text-sm text-github-text-muted">
        Os 600 clientes que mais compraram cada indústria <strong className="font-semibold text-github-text">pelo Televendas</strong> nos{' '}
        <strong className="font-semibold text-github-text">últimos 6 meses</strong> e que{' '}
        <strong className="font-semibold text-github-text">ainda não positivaram neste mês</strong>. Comece pelos primeiros da lista. Nas exclusivas com
        carteira (Boticário, Haleon e Reckitt) a lista tem só clientes da carteira.
        {geradoEm && <> Atualizado em {dayjs(geradoEm).format('DD/MM HH:mm')}.</>}
      </p>

      <ul className="grid grid-cols-[repeat(auto-fill,minmax(13rem,1fr))] gap-2.5" aria-label="Indústrias">
        {resumo.data.map((r) => {
          const nome = r.industria ?? ''
          const ativa = industriaAtiva === nome
          return (
            <li key={nome} className="flex">
              <button
                type="button"
                aria-pressed={ativa}
                onClick={() => escolher(nome)}
                className={`flex w-full flex-col rounded-xl border p-3 text-left transition-colors ${
                  ativa ? 'border-github-btn-green bg-github-bg-hover' : 'border-github-border bg-github-bg-card hover:bg-github-bg-hover'
                }`}
              >
                <p className="truncate text-xs font-medium uppercase tracking-wide text-github-text-muted">{nomeIndustria(r.industria)}</p>
                <p className="mt-1 text-2xl font-semibold leading-none">
                  {r.clientes.toLocaleString('pt-BR')}
                  <span className="ml-1 text-xs font-normal text-github-text-muted">oportunidades</span>
                </p>
                <p className="mt-auto pt-2 text-xs text-github-text-muted">
                  de {formatCurrency(r.menorValor)} a {formatCurrency(r.maiorValor)} em 6 meses
                </p>
              </button>
            </li>
          )
        })}
      </ul>

      {!industriaAtiva && <p className="text-sm text-github-text-muted">Escolha uma indústria acima para ver os clientes.</p>}

      {industriaAtiva && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="relative block w-full sm:w-72">
              <span className="sr-only">Buscar cliente</span>
              <Search size={16} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-github-text-muted" />
              <input
                type="search"
                value={busca}
                onChange={(e) => {
                  setBusca(e.target.value)
                  setLimite(PAGE_SIZE)
                }}
                placeholder="Buscar cliente ou código"
                className={`${campo} w-full pl-8`}
              />
            </label>
            <button
              type="button"
              onClick={baixarExcel}
              disabled={visiveis.length === 0}
              className="flex h-9 items-center gap-1.5 rounded-md border border-github-border bg-github-bg-card px-3 text-sm font-medium hover:bg-github-bg-hover disabled:opacity-50"
            >
              <Download size={15} /> Exportar Excel ({visiveis.length.toLocaleString('pt-BR')})
            </button>
          </div>

          {clientes.loading && <div className="h-40 animate-pulse rounded-xl border border-github-border bg-github-bg-card" aria-busy="true" />}
          {clientes.error && <ErrorState message={clientes.error} onRetry={clientes.reload} />}
          {!clientes.loading && !clientes.error && visiveis.length === 0 && <EmptyState message="Nenhum cliente encontrado." />}

          {visiveis.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-github-border bg-github-bg-card">
              <table className="w-full text-left text-sm">
                <thead className="bg-github-bg-hover text-[10px] uppercase tracking-wide text-github-text-muted">
                  <tr>
                    <ThOrdenavel rotulo="#" chave="posicao" ord={ord} onAlternar={alternar} className="w-10 py-2 pl-3 font-medium" />
                    <ThOrdenavel rotulo="Cliente" chave="cliente" ord={ord} onAlternar={alternar} className="px-2 py-2 font-medium" />
                    <ThOrdenavel rotulo="Valor em 6 meses" chave="valor" ord={ord} onAlternar={alternar} direita className="whitespace-nowrap px-2 py-2 text-right font-medium" />
                    <ThOrdenavel rotulo="Pedidos" chave="pedidos" ord={ord} onAlternar={alternar} direita className="hidden px-2 py-2 text-right font-medium sm:table-cell" />
                    <ThOrdenavel rotulo="Meses c/ compra" chave="meses" ord={ord} onAlternar={alternar} direita className="hidden whitespace-nowrap px-2 py-2 text-right font-medium md:table-cell" />
                    <ThOrdenavel rotulo="Última compra" chave="ultima" ord={ord} onAlternar={alternar} className="hidden whitespace-nowrap px-2 py-2 font-medium md:table-cell" />
                    <ThOrdenavel rotulo="Dias sem comprar" chave="dias" ord={ord} onAlternar={alternar} direita className="hidden whitespace-nowrap px-2 py-2 text-right font-medium lg:table-cell" />
                    <ThOrdenavel rotulo="Ticket médio" chave="ticket" ord={ord} onAlternar={alternar} direita className="hidden whitespace-nowrap px-2 py-2 text-right font-medium lg:table-cell" />
                    <th className="whitespace-nowrap py-2 pl-2 pr-3 font-medium">Telefone</th>
                  </tr>
                </thead>
                <tbody>
                  {ordenadas.slice(0, limite).map((c) => (
                    <tr key={c.idPessoaCliente} className="border-t border-github-border hover:bg-github-bg-hover">
                      <td className="py-1.5 pl-3 text-xs font-bold text-github-text-muted">{c.posicao}</td>
                      <td className="max-w-[22rem] px-2 py-1.5">
                        <span className="font-medium">{c.nomeCliente ?? `Cliente ${c.idPessoaCliente}`}</span>
                        <span className="ml-1.5 text-xs text-github-text-muted">{c.idPessoaCliente}</span>
                      </td>
                      <td className="whitespace-nowrap px-2 py-1.5 text-right font-semibold">{formatCurrency(c.valor6Meses)}</td>
                      <td className="hidden px-2 py-1.5 text-right sm:table-cell">{c.pedidos6Meses.toLocaleString('pt-BR')}</td>
                      <td className="hidden px-2 py-1.5 text-right md:table-cell">{c.mesesComCompra} de 6</td>
                      <td className="hidden whitespace-nowrap px-2 py-1.5 text-github-text-muted md:table-cell">{c.ultimaCompra ? dayjs(c.ultimaCompra).format('DD/MM/YYYY') : '-'}</td>
                      <td className="hidden px-2 py-1.5 text-right lg:table-cell">{c.diasSemComprar ?? '-'}</td>
                      <td className="hidden whitespace-nowrap px-2 py-1.5 text-right lg:table-cell">{formatCurrency(c.ticketMedio)}</td>
                      <td className="whitespace-nowrap py-1.5 pl-2 pr-3 text-github-text-muted">
                        {[c.telefone, c.telefone2].filter((t) => !!t?.trim()).join(' · ') || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {visiveis.length > limite && (
            <button
              type="button"
              onClick={() => setLimite((n) => n + PAGE_SIZE)}
              className="h-9 rounded-md border border-github-border bg-github-bg-card text-sm font-medium"
            >
              Mostrar mais ({visiveis.length - limite})
            </button>
          )}
        </>
      )}
    </section>
  )
}
