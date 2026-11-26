import { Fragment, useState } from 'react'
import dayjs from 'dayjs'
import { ChevronDown, ChevronRight, Download } from 'lucide-react'
import { EmptyState, ErrorState } from './StateViews'
import { ThOrdenavel } from './ThOrdenavel'
import { exportarExcel } from '../lib/exportarExcel'
import {
  getFidelizacaoHitsClientesSemCompra,
  getFidelizacaoHitsEstoque,
  getFidelizacaoHitsSugestoes,
} from '../lib/fidelizacao'
import { useOrdenacao } from '../lib/ordenar'
import { useApiResource } from '../lib/useApiResource'

const PAGE_SIZE = 20
const CLIENTES_POR_VEZ = 30

type Aba = 'estoque' | 'clientes'

/** De quais filiais e tipos vem o estoque do produto. As linhas que entram no número da lista aparecem marcadas. */
function EstoquePorFilial({ idProduto }: { idProduto: number }) {
  const estoque = useApiResource((signal) => getFidelizacaoHitsEstoque(idProduto, signal), [idProduto])

  if (estoque.loading) return <div className="h-12 animate-pulse rounded-lg bg-github-bg-hover" aria-busy="true" />
  if (estoque.error) return <ErrorState message={estoque.error} onRetry={estoque.reload} />
  if (!estoque.data?.length) return <p className="text-xs text-github-text-muted">Sem estoque em nenhuma filial agora.</p>

  const total = estoque.data.filter((e) => e.contaNoTotal).reduce((s, e) => s + e.quantidade, 0)

  return (
    <div className="flex flex-col gap-1.5">
      <table className="w-full max-w-md text-left text-xs">
        <thead className="text-[10px] uppercase tracking-wide text-github-text-muted">
          <tr>
            <th className="py-1 pr-2 font-medium">Filial</th>
            <th className="px-2 py-1 font-medium">Tipo de estoque</th>
            <th className="py-1 pl-2 text-right font-medium">Quantidade</th>
          </tr>
        </thead>
        <tbody>
          {estoque.data.map((e) => (
            <tr key={`${e.idFilial}-${e.idTipo}`} className={`border-t border-github-border ${e.contaNoTotal ? '' : 'text-github-text-muted'}`}>
              <td className="py-1 pr-2">
                <span className={e.contaNoTotal ? 'font-semibold' : ''}>{e.filial ?? `Filial ${e.idFilial}`}</span>
                {e.contaNoTotal && <span className="ml-1.5 rounded bg-[#639922]/15 px-1.5 text-[10px] font-medium text-[#639922]">conta no estoque</span>}
              </td>
              <td className="px-2 py-1">{e.tipo ?? `Tipo ${e.idTipo}`}</td>
              <td className="py-1 pl-2 text-right tabular-nums">{e.quantidade.toLocaleString('pt-BR')}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-[11px] text-github-text-muted">
        O estoque da lista soma só o tipo Normal da Matriz e de Cajamar ({total.toLocaleString('pt-BR')}). As outras linhas são informativas.
      </p>
    </div>
  )
}

/** Clientes da carteira da pessoa que ainda não compraram o produto nos últimos 3 meses: a quem oferecer. */
function ClientesSemCompra({ idPessoa, idProduto }: { idPessoa: number; idProduto: number }) {
  const clientes = useApiResource((signal) => getFidelizacaoHitsClientesSemCompra(idPessoa, idProduto, signal), [idPessoa, idProduto])
  const [limite, setLimite] = useState(CLIENTES_POR_VEZ)

  if (clientes.loading) return <div className="h-12 animate-pulse rounded-lg bg-github-bg-hover" aria-busy="true" />
  if (clientes.error) return <ErrorState message={clientes.error} onRetry={clientes.reload} />
  if (!clientes.data?.length) return <p className="text-xs text-github-text-muted">Todos os clientes da carteira já compraram este produto nos últimos 3 meses.</p>

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[11px] text-github-text-muted">
        <strong className="font-semibold text-github-text">{clientes.data.length.toLocaleString('pt-BR')}</strong> de{' '}
        {clientes.data[0].totalCarteira.toLocaleString('pt-BR')} clientes da sua carteira ainda não compraram este produto nos últimos 3 meses (
        {(clientes.data[0].totalCarteira - clientes.data.length).toLocaleString('pt-BR')} já compraram).
      </p>
      <div className="max-h-72 overflow-auto">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-github-bg-hover text-[10px] uppercase tracking-wide text-github-text-muted">
            <tr>
              <th className="py-1 pl-2 pr-2 font-medium">Cliente</th>
              <th className="px-2 py-1 font-medium">Telefone</th>
            </tr>
          </thead>
          <tbody>
            {clientes.data.slice(0, limite).map((c) => (
              <tr key={c.idPessoaCliente} className="border-t border-github-border">
                <td className="py-1 pl-2 pr-2">
                  <span className="font-medium">{c.nomeCliente ?? `Cliente ${c.idPessoaCliente}`}</span>
                  <span className="ml-1.5 text-[10px] text-github-text-muted">{c.idPessoaCliente}</span>
                </td>
                <td className="whitespace-nowrap px-2 py-1 text-github-text-muted">
                  {[c.telefone, c.telefone2].filter((t) => !!t?.trim()).join(' · ') || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {clientes.data.length > limite && (
        <button
          type="button"
          onClick={() => setLimite((n) => n + CLIENTES_POR_VEZ)}
          className="h-7 w-fit rounded-md border border-github-border bg-github-bg-card px-3 text-xs font-medium"
        >
          Mostrar mais ({clientes.data.length - limite})
        </button>
      )}
    </div>
  )
}

/**
 * Produtos para a operadora vender e somar Hits: os que mais clientes da Loja Virtual compram (últimos 3 meses) e que ela
 * ainda não vendeu no mês. Cada produto novo soma tantos Hits quanto clientes ela tem positivados.
 * Ao abrir um produto: de quais filiais vem o estoque e quais clientes da carteira dela ainda não compraram.
 */
export function HitsSugestoes({ idPessoa, nomePessoa }: { idPessoa: number; nomePessoa: string }) {
  const sugestoes = useApiResource((signal) => getFidelizacaoHitsSugestoes(idPessoa, signal), [idPessoa])
  const [limite, setLimite] = useState(PAGE_SIZE)
  const [aberto, setAberto] = useState<{ id: number; aba: Aba } | null>(null)
  const itens = sugestoes.data?.itens ?? []
  const { ordenadas, ord, alternar } = useOrdenacao(itens, {
    posicao: (p) => p.posicao,
    produto: (p) => p.descProduto,
    clientes: (p) => p.clientesDistintos,
    estoque: (p) => p.estoque,
  })

  /** Clicar de novo na mesma aba fecha; em outra aba do mesmo produto, troca. */
  function abrir(id: number, aba: Aba) {
    setAberto((atual) => (atual?.id === id && atual.aba === aba ? null : { id, aba }))
  }

  function baixarExcel() {
    exportarExcel({
      arquivo: `hits-produtos-sugeridos-${nomePessoa}`.replace(/\s+/g, '-'),
      aba: 'Produtos sugeridos',
      linhas: ordenadas,
      colunas: [
        { titulo: 'Posição', tipo: 'numero', largura: 10, valor: (p) => p.posicao },
        { titulo: 'Código', tipo: 'numero', largura: 10, valor: (p) => p.idProduto },
        { titulo: 'Produto', largura: 50, valor: (p) => p.descProduto },
        { titulo: 'Clientes da Loja Virtual que compram', tipo: 'numero', largura: 34, valor: (p) => p.clientesDistintos },
        { titulo: 'Estoque', tipo: 'numero', largura: 12, valor: (p) => p.estoque },
      ],
    })
  }

  return (
    <section aria-label="Produtos sugeridos para somar Hits" className="flex flex-col gap-2">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs text-github-text-muted">
            Os que mais clientes da Loja Virtual compram (últimos 3 meses), com estoque, e que você ainda não vendeu neste mês. Cada produto novo soma
            Hits para todos os seus clientes positivados. Toque no estoque para ver de qual filial ele vem e no produto para ver quais clientes da sua
            carteira ainda não compraram.
            {sugestoes.data?.dataReferencia && <> Lista de {dayjs(sugestoes.data.dataReferencia).format('DD/MM/YYYY')}.</>}
          </p>
        </div>
        <button
          type="button"
          onClick={baixarExcel}
          disabled={itens.length === 0}
          className="flex h-8 items-center gap-1.5 rounded-md border border-github-border bg-github-bg-card px-2.5 text-xs font-medium hover:bg-github-bg-hover disabled:opacity-50"
        >
          <Download size={14} /> Excel ({itens.length.toLocaleString('pt-BR')})
        </button>
      </div>

      {sugestoes.loading ? (
        <div className="h-24 animate-pulse rounded-lg bg-github-bg-hover" aria-busy="true" />
      ) : sugestoes.error ? (
        <ErrorState message={sugestoes.error} onRetry={sugestoes.reload} />
      ) : itens.length === 0 ? (
        <EmptyState message="Sem produtos sugeridos: a lista ainda não foi calculada para esta pessoa, ou ela já vendeu todos neste mês." />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[11px] uppercase tracking-wide text-github-text-muted">
                <tr className="border-b border-github-border">
                  <ThOrdenavel rotulo="#" chave="posicao" ord={ord} onAlternar={alternar} className="w-10 py-2 font-medium" />
                  <ThOrdenavel rotulo="Produto" chave="produto" ord={ord} onAlternar={alternar} className="px-2 py-2 font-medium" />
                  <ThOrdenavel rotulo="Clientes que compram" chave="clientes" ord={ord} onAlternar={alternar} direita className="whitespace-nowrap px-2 py-2 text-right font-medium" />
                  <ThOrdenavel rotulo="Estoque" chave="estoque" ord={ord} onAlternar={alternar} direita className="whitespace-nowrap py-2 pl-2 text-right font-medium" />
                </tr>
              </thead>
              <tbody>
                {ordenadas.slice(0, limite).map((p) => {
                  const aba = aberto?.id === p.idProduto ? aberto.aba : null
                  return (
                    <Fragment key={p.idProduto}>
                      <tr className={`border-b border-github-border ${aba ? 'bg-github-bg-hover/50' : ''}`}>
                        <td className="py-1.5 text-xs font-bold text-github-text-muted">{p.posicao}</td>
                        <td className="px-2 py-1.5">
                          <button
                            type="button"
                            onClick={() => abrir(p.idProduto, 'clientes')}
                            aria-expanded={aba === 'clientes'}
                            className="flex items-center gap-1 text-left"
                          >
                            {aba === 'clientes' ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            <span className="font-medium">{p.descProduto ?? `Produto ${p.idProduto}`}</span>
                            <span className="ml-1 text-xs text-github-text-muted">{p.idProduto}</span>
                          </button>
                        </td>
                        <td className="whitespace-nowrap px-2 py-1.5 text-right">{p.clientesDistintos.toLocaleString('pt-BR')}</td>
                        <td className="whitespace-nowrap py-1.5 pl-2 text-right">
                          <button
                            type="button"
                            onClick={() => abrir(p.idProduto, 'estoque')}
                            aria-expanded={aba === 'estoque'}
                            title="Ver de qual filial vem o estoque"
                            className="rounded px-1 underline decoration-dotted underline-offset-2 hover:bg-github-bg-hover"
                          >
                            {p.estoque.toLocaleString('pt-BR')}
                          </button>
                        </td>
                      </tr>
                      {aba && (
                        <tr className="border-b border-github-border bg-github-bg-hover/50">
                          <td colSpan={4} className="px-3 py-2">
                            <div className="mb-2 flex w-fit gap-0.5 rounded-lg bg-github-bg-card p-0.5" role="tablist">
                              {(
                                [
                                  { id: 'estoque', label: 'Estoque por filial' },
                                  { id: 'clientes', label: 'Clientes que ainda não compraram' },
                                ] as const
                              ).map((t) => (
                                <button
                                  key={t.id}
                                  type="button"
                                  role="tab"
                                  aria-selected={aba === t.id}
                                  onClick={() => setAberto({ id: p.idProduto, aba: t.id })}
                                  className={`h-7 rounded-md px-2.5 text-xs font-medium ${aba === t.id ? 'bg-github-bg-hover shadow-sm' : 'text-github-text-muted'}`}
                                >
                                  {t.label}
                                </button>
                              ))}
                            </div>
                            {aba === 'estoque' ? (
                              <EstoquePorFilial idProduto={p.idProduto} />
                            ) : (
                              <ClientesSemCompra idPessoa={idPessoa} idProduto={p.idProduto} />
                            )}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
          {itens.length > limite && (
            <button
              type="button"
              onClick={() => setLimite((n) => n + PAGE_SIZE)}
              className="h-8 rounded-md border border-github-border bg-github-bg-card text-xs font-medium"
            >
              Mostrar mais ({itens.length - limite})
            </button>
          )}
        </>
      )}
    </section>
  )
}
