import { Fragment, useMemo, useState } from 'react'
import { ChevronDown, ChevronRight, Search, X } from 'lucide-react'
import { EmptyState, ErrorState } from '../components/StateViews'
import {
  getFidelizacaoClientes,
  getFidelizacaoProdutos,
  type FidelizacaoLinha,
} from '../lib/fidelizacao'
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

  const tipo = detalhe.data?.tipo
  const total = tipo === 'valor' ? (detalhe.data?.valores.length ?? 0) : (detalhe.data?.hits.length ?? 0)
  const somaValor = (detalhe.data?.valores ?? []).reduce((s, c) => s + c.valorTotal, 0)

  return (
    <section aria-label={`Clientes de ${nomeDoKpi(linha)}`} className="flex flex-col gap-3 rounded-xl border border-github-border bg-github-bg-card p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold">{nomeDoKpi(linha)}</p>
          <p className="text-xs text-github-text-muted">
            {tipo === 'valor' && <>Clientes que compõem o valor apurado</>}
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

      {detalhe.loading ? (
        <div className="h-24 animate-pulse rounded-lg bg-github-bg-hover" aria-busy="true" />
      ) : detalhe.error ? (
        <ErrorState message={detalhe.error} onRetry={detalhe.reload} />
      ) : tipo === 'nenhum' || total === 0 ? (
        <EmptyState message="Este KPI ainda não tem clientes calculados. Eles aparecem depois do próximo cálculo do período." />
      ) : (
        <>
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
            <p className="text-sm text-github-text-muted">
              <strong className="font-semibold text-github-text">{total.toLocaleString('pt-BR')}</strong> clientes
              {tipo === 'valor' && (
                <>
                  {' '}
                  · total <strong className="font-semibold text-github-text">{formatCurrency(somaValor)}</strong>
                </>
              )}
            </p>
          </div>

          <div className="overflow-x-auto rounded-lg border border-github-border">
            {tipo === 'valor' ? (
              <table className="w-full text-left text-sm">
                <thead className="text-[11px] uppercase tracking-wide text-github-text-muted">
                  <tr className="border-b border-github-border">
                    <th className="py-2 pl-3 font-medium">Cliente</th>
                    <th className="px-2 py-2 text-right font-medium">Venda</th>
                    <th className="px-2 py-2 text-right font-medium">Bees</th>
                    <th className="py-2 pl-2 pr-3 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {valores.slice(0, limite).map((c) => (
                    <tr key={c.idPessoaCliente} className="border-b border-github-border last:border-0">
                      <td className="py-2 pl-3">
                        <span className="font-medium">{c.nomeCliente ?? `Cliente ${c.idPessoaCliente}`}</span>
                        <span className="ml-1.5 text-xs text-github-text-muted">{c.idPessoaCliente}</span>
                      </td>
                      <td className="whitespace-nowrap px-2 py-2 text-right">{formatCurrency(c.valorVenda)}</td>
                      <td className="whitespace-nowrap px-2 py-2 text-right text-github-text-muted">{formatCurrency(c.valorVendaBees)}</td>
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
                    <th className="py-2 font-medium">Cliente</th>
                    <th className="px-2 py-2 text-right font-medium">Produtos comprados</th>
                    <th className="py-2 pl-2 pr-3 text-right font-medium">Faturado</th>
                  </tr>
                </thead>
                <tbody>
                  {hits.slice(0, limite).map((c) => {
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

          {(tipo === 'valor' ? valores.length : hits.length) > limite && (
            <button
              type="button"
              onClick={() => setLimite((n) => n + PAGE_SIZE)}
              className="h-9 rounded-md border border-github-border bg-github-bg-card text-sm font-medium"
            >
              Mostrar mais ({(tipo === 'valor' ? valores.length : hits.length) - limite})
            </button>
          )}
          {tipo === 'hits' && (
            <p className="text-xs text-github-text-muted">
              Os Hits do KPI são os produtos distintos de todos os clientes vezes o número de clientes. A coluna “Produtos comprados” mostra
              o que cada cliente comprou, e um mesmo produto pode aparecer em mais de um cliente.
            </p>
          )}
        </>
      )}
    </section>
  )
}
