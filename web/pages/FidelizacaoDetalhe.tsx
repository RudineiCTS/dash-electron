import { Fragment, useMemo, useState } from 'react'
import { useOrdenacao } from '../lib/ordenar'
import { ThOrdenavel } from '../components/ThOrdenavel'
import { ChevronDown, ChevronRight, Search, X } from 'lucide-react'
import { BotaoExportarExcel } from '../components/BotaoExportarExcel'
import { EmptyState, ErrorState } from '../components/StateViews'
import { HitsSugestoes } from '../components/HitsSugestoes'
import {
  getFidelizacaoClientes,
  getFidelizacaoProdutos,
  type FidelizacaoLinha,
} from '../lib/fidelizacao'
import { exportarExcel } from '../lib/exportarExcel'
import { formatCurrency } from '../lib/format'
import { useApiResource } from '../lib/useApiResource'

const PAGE_SIZE = 30
const campo = 'h-9 rounded-md border border-github-border bg-github-bg-card px-2.5 text-sm text-github-text'

const nomeDoKpi = (l: FidelizacaoLinha) => l.nomeKpi?.trim() || l.descricaoKpi?.trim() || l.codigoKpi || 'KPI'


/** Produtos que um cliente comprou e entraram na conta dos Hits. */
function ProdutosDoCliente({ idMeta, idKpi, idCliente }: { idMeta: number; idKpi: number; idCliente: number }) {
  const produtos = useApiResource((signal) => getFidelizacaoProdutos(idMeta, idKpi, idCliente, signal), [idMeta, idKpi, idCliente])

  if (produtos.loading) return <div className="h-10 animate-pulse rounded-md bg-github-bg-hover" aria-busy="true" />
  if (produtos.error) return <ErrorState message={produtos.error} onRetry={produtos.reload} />
  if (!produtos.data?.length) return <p className="text-xs text-github-text-muted">Nenhum produto registrado para este cliente.</p>

  return (
    <ul className="grid grid-cols-1 gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
      {produtos.data.map((p) => (
        <li key={p.idProduto} className="flex items-baseline justify-between gap-3 border-b border-github-border/60 py-1">
          <span>
            {p.descProduto ?? `Produto ${p.idProduto}`}
            <span className="ml-1.5 text-xs text-github-text-muted">{p.idProduto}</span>
          </span>
          <span className="whitespace-nowrap text-xs text-github-text-muted">{formatCurrency(p.valorFaturado)}</span>
        </li>
      ))}
    </ul>
  )
}

/**
 * Abertura de um KPI da Fidelização.
 *  - KPI de valor (Loja Virtual / Setor): os clientes que compõem o valor.
 *  - KPI de Hits: os clientes e, ao clicar em um, os produtos que ele comprou.
 */
export function FidelizacaoDetalhe({ linha, onFechar }: { linha: FidelizacaoLinha; onFechar: () => void }) {
  const idMeta = linha.idMeta as number
  const idKpi = linha.idKpi as number
  const detalhe = useApiResource((signal) => getFidelizacaoClientes(idMeta, idKpi, signal), [idMeta, idKpi])
  const [busca, setBusca] = useState('')
  const [limite, setLimite] = useState(PAGE_SIZE)
  const [aberto, setAberto] = useState<number | null>(null)
  const [aba, setAba] = useState<'clientes' | 'sugestoes'>('clientes')
  const ehHits = linha.tipoDetalhe === 'hits'

  const termo = busca.trim().toLowerCase()
  const valores = useMemo(
    () =>
      (detalhe.data?.valores ?? []).filter(
        (c) => !termo || (c.nomeCliente ?? '').toLowerCase().includes(termo) || String(c.idPessoaCliente).includes(termo),
      ),
    [detalhe.data, termo],
  )
  const hits = useMemo(
    () =>
      (detalhe.data?.hits ?? []).filter(
        (c) => !termo || (c.nomeCliente ?? '').toLowerCase().includes(termo) || String(c.idPessoaCliente).includes(termo),
      ),
    [detalhe.data, termo],
  )

  const { ordenadas: valoresOrdenados, ord: ordValores, alternar: alternarValores } = useOrdenacao(valores, {
    cliente: (c) => c.nomeCliente,
    venda: (c) => c.valorVenda,
    bees: (c) => c.valorVendaBees,
    total: (c) => c.valorTotal,
  })
  const { ordenadas: hitsOrdenados, ord: ordHits, alternar: alternarHits } = useOrdenacao(hits, {
    cliente: (c) => c.nomeCliente,
    produtos: (c) => c.quantidadeProdutos,
    faturado: (c) => c.valorFaturado,
  })

  const tipo = detalhe.data?.tipo
  /** O tipo vem da fórmula de cálculo do KPI (API): valor, cobertura (positivados) ou hits. */
  const cobertura = tipo === 'cobertura'
  const ehValor = tipo === 'valor' || tipo === 'cobertura'
  const total = ehValor ? (detalhe.data?.valores.length ?? 0) : (detalhe.data?.hits.length ?? 0)
  const somaValor = (detalhe.data?.valores ?? []).reduce((s, c) => s + c.valorTotal, 0)

  /** Baixa os clientes do KPI (na ordem e com a busca que estão na tela). */
  function baixarExcel() {
    const arquivo = `fidelizacao-${nomeDoKpi(linha)}-${linha.pessoa ?? linha.idPessoa}`.replace(/\s+/g, '-')
    if (ehValor) {
      exportarExcel({
        arquivo,
        aba: 'Clientes',
        linhas: valoresOrdenados,
        totalizar: true,
        colunas: [
          { titulo: 'Cód. cliente', tipo: 'numero', largura: 12, valor: (c) => c.idPessoaCliente },
          { titulo: 'Cliente', largura: 44, valor: (c) => c.nomeCliente },
          ...(cobertura
            ? []
            : [
                { titulo: 'Venda', tipo: 'moeda' as const, largura: 16, valor: (c: (typeof valoresOrdenados)[number]) => c.valorVenda },
                { titulo: 'Bees', tipo: 'moeda' as const, largura: 16, valor: (c: (typeof valoresOrdenados)[number]) => c.valorVendaBees },
              ]),
          { titulo: 'Total vendido', tipo: 'moeda', largura: 16, valor: (c) => c.valorTotal },
        ],
      })
      return
    }
    exportarExcel({
      arquivo,
      aba: 'Clientes',
      linhas: hitsOrdenados,
      totalizar: true,
      colunas: [
        { titulo: 'Cód. cliente', tipo: 'numero', largura: 12, valor: (c) => c.idPessoaCliente },
        { titulo: 'Cliente', largura: 44, valor: (c) => c.nomeCliente },
        { titulo: 'Produtos comprados', tipo: 'numero', largura: 18, valor: (c) => c.quantidadeProdutos },
        { titulo: 'Faturado', tipo: 'moeda', largura: 16, valor: (c) => c.valorFaturado },
      ],
    })
  }

  return (
    <section aria-label={`Clientes de ${nomeDoKpi(linha)}`} className="flex flex-col gap-3 rounded-xl border border-github-border bg-github-bg-card p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold">{nomeDoKpi(linha)}</p>
          <p className="text-xs text-github-text-muted">
            {ehValor && (cobertura ? <>Clientes positivados no período</> : <>Clientes que compõem o valor apurado</>)}
            {tipo === 'hits' && <>Clientes na conta dos Hits · clique em um cliente para ver os produtos</>}
          </p>
        </div>
        <button
          type="button"
          onClick={onFechar}
          aria-label="Fechar"
          className="flex h-8 items-center gap-1 rounded-md border border-github-border px-2 text-sm text-github-text-muted hover:bg-github-bg-hover"
        >
          <X size={14} /> Fechar
        </button>
      </div>

      {ehHits && (
        <div role="tablist" aria-label="Visão dos Hits" className="flex w-fit gap-0.5 rounded-lg bg-github-bg-hover p-0.5">
          {(
            [
              { id: 'clientes', label: 'Clientes' },
              { id: 'sugestoes', label: 'Produtos para somar Hits' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={aba === t.id}
              onClick={() => setAba(t.id)}
              className={`h-8 rounded-md px-3 text-sm font-medium ${aba === t.id ? 'bg-github-bg-card shadow-sm' : 'text-github-text-muted'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {ehHits && aba === 'sugestoes' ? (
        <HitsSugestoes idPessoa={linha.idPessoa} nomePessoa={linha.pessoa ?? String(linha.idPessoa)} />
      ) : detalhe.loading ? (
        <div className="h-24 animate-pulse rounded-lg bg-github-bg-hover" aria-busy="true" />
      ) : detalhe.error ? (
        <ErrorState message={detalhe.error} onRetry={detalhe.reload} />
      ) : tipo === 'nenhum' || total === 0 ? (
        <EmptyState message="Este KPI ainda não tem clientes calculados. Eles aparecem depois do próximo cálculo do período." />
      ) : (
        <>
          {tipo === 'hits' && linha.hitsClientes > 0 && linha.hitsProdutos > 0 && (
            <p className="rounded-lg bg-github-bg-hover px-3 py-2 text-sm">
              <span className="text-github-text-muted">Cálculo dos Hits: </span>
              <strong className="font-semibold">{linha.hitsClientes.toLocaleString('pt-BR')}</strong> clientes ×{' '}
              <strong className="font-semibold">{linha.hitsProdutos.toLocaleString('pt-BR')}</strong> produtos distintos ={' '}
              <strong className="font-semibold">{(linha.hitsClientes * linha.hitsProdutos).toLocaleString('pt-BR')}</strong> hits
            </p>
          )}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="relative">
              <Search size={14} className="pointer-events-none absolute left-2.5 top-2.5 text-github-text-muted" />
              <input
                className={`${campo} pl-8`}
                placeholder="Buscar cliente"
                value={busca}
                onChange={(e) => {
                  setBusca(e.target.value)
                  setLimite(PAGE_SIZE)
                }}
              />
            </label>
            <BotaoExportarExcel total={ehValor ? valoresOrdenados.length : hitsOrdenados.length} onClick={baixarExcel} />
            <p className="text-sm text-github-text-muted">
              <strong className="font-semibold text-github-text">{total.toLocaleString('pt-BR')}</strong>{' '}
              {cobertura ? 'clientes positivados' : 'clientes'}
              {ehValor && (
                <>
                  {' '}
                  · total <strong className="font-semibold text-github-text">{formatCurrency(somaValor)}</strong>
                </>
              )}
            </p>
          </div>

          <div className="overflow-x-auto rounded-lg border border-github-border">
            {ehValor ? (
              <table className="w-full text-left text-sm">
                <thead className="text-[11px] uppercase tracking-wide text-github-text-muted">
                  <tr className="border-b border-github-border">
                    <ThOrdenavel rotulo="Cliente" chave="cliente" ord={ordValores} onAlternar={alternarValores} className="py-2 pl-3 font-medium" />
                    {!cobertura && <ThOrdenavel rotulo="Venda" chave="venda" ord={ordValores} onAlternar={alternarValores} direita className="px-2 py-2 text-right font-medium" />}
                    {!cobertura && <ThOrdenavel rotulo="Bees" chave="bees" ord={ordValores} onAlternar={alternarValores} direita className="px-2 py-2 text-right font-medium" />}
                    <ThOrdenavel rotulo="Total vendido" chave="total" ord={ordValores} onAlternar={alternarValores} direita className="py-2 pl-2 pr-3 text-right font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {valoresOrdenados.slice(0, limite).map((c) => (
                    <tr key={c.idPessoaCliente} className="border-b border-github-border last:border-0">
                      <td className="py-2 pl-3">
                        <span className="font-medium">{c.nomeCliente ?? `Cliente ${c.idPessoaCliente}`}</span>
                        <span className="ml-1.5 text-xs text-github-text-muted">{c.idPessoaCliente}</span>
                      </td>
                      {!cobertura && <td className="whitespace-nowrap px-2 py-2 text-right">{formatCurrency(c.valorVenda)}</td>}
                      {!cobertura && <td className="whitespace-nowrap px-2 py-2 text-right text-github-text-muted">{formatCurrency(c.valorVendaBees)}</td>}
                      <td className="whitespace-nowrap py-2 pl-2 pr-3 text-right font-semibold">{formatCurrency(c.valorTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="text-[11px] uppercase tracking-wide text-github-text-muted">
                  <tr className="border-b border-github-border">
                    <th className="w-8" />
                    <ThOrdenavel rotulo="Cliente" chave="cliente" ord={ordHits} onAlternar={alternarHits} className="py-2 font-medium" />
                    <ThOrdenavel rotulo="Produtos comprados" chave="produtos" ord={ordHits} onAlternar={alternarHits} direita className="px-2 py-2 text-right font-medium" />
                    <ThOrdenavel rotulo="Faturado" chave="faturado" ord={ordHits} onAlternar={alternarHits} direita className="py-2 pl-2 pr-3 text-right font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {hitsOrdenados.slice(0, limite).map((c) => {
                    const aberta = aberto === c.idPessoaCliente
                    return (
                      <Fragment key={c.idPessoaCliente}>
                        <tr
                          onClick={() => setAberto(aberta ? null : c.idPessoaCliente)}
                          className="cursor-pointer border-b border-github-border last:border-0 hover:bg-github-bg-hover"
                          aria-expanded={aberta}
                        >
                          <td className="pl-2 text-github-text-muted">{aberta ? <ChevronDown size={15} /> : <ChevronRight size={15} />}</td>
                          <td className="py-2">
                            <span className="font-medium">{c.nomeCliente ?? `Cliente ${c.idPessoaCliente}`}</span>
                            <span className="ml-1.5 text-xs text-github-text-muted">{c.idPessoaCliente}</span>
                          </td>
                          <td className="px-2 py-2 text-right font-semibold">{c.quantidadeProdutos.toLocaleString('pt-BR')}</td>
                          <td className="whitespace-nowrap py-2 pl-2 pr-3 text-right">{formatCurrency(c.valorFaturado)}</td>
                        </tr>
                        {aberta && (
                          <tr className="border-b border-github-border bg-github-bg-hover/40">
                            <td />
                            <td colSpan={3} className="py-2 pr-3">
                              <ProdutosDoCliente idMeta={idMeta} idKpi={idKpi} idCliente={c.idPessoaCliente} />
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>

          {(ehValor ? valores.length : hits.length) > limite && (
            <button
              type="button"
              onClick={() => setLimite((n) => n + PAGE_SIZE)}
              className="h-9 rounded-md border border-github-border bg-github-bg-card text-sm font-medium"
            >
              Mostrar mais ({(ehValor ? valores.length : hits.length) - limite})
            </button>
          )}
          {tipo === 'hits' && (
            <p className="text-xs text-github-text-muted">
              Como o Hits é calculado: <strong className="font-semibold text-github-text">clientes × produtos distintos</strong>. Cada produto conta
              uma vez, mesmo que mais de um cliente o tenha comprado. A coluna “Produtos comprados” mostra o que cada cliente comprou, por isso a soma
              dela é maior que os produtos distintos.
            </p>
          )}
        </>
      )}
    </section>
  )
}
