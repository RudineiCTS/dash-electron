import { useState } from 'react'
import dayjs from 'dayjs'
import { Download } from 'lucide-react'
import { EmptyState, ErrorState } from './StateViews'
import { ThOrdenavel } from './ThOrdenavel'
import { exportarExcel } from '../lib/exportarExcel'
import { getFidelizacaoHitsSugestoes } from '../lib/fidelizacao'
import { useOrdenacao } from '../lib/ordenar'
import { useApiResource } from '../lib/useApiResource'

const PAGE_SIZE = 20

/**
 * Produtos para a operadora vender e somar Hits: os que mais clientes da Loja Virtual compram (últimos 3 meses) e que ela
 * ainda não vendeu no mês. Cada produto novo soma tantos Hits quanto clientes ela tem positivados.
 */
export function HitsSugestoes({ idPessoa, nomePessoa }: { idPessoa: number; nomePessoa: string }) {
  const sugestoes = useApiResource((signal) => getFidelizacaoHitsSugestoes(idPessoa, signal), [idPessoa])
  const [limite, setLimite] = useState(PAGE_SIZE)
  const itens = sugestoes.data?.itens ?? []
  const { ordenadas, ord, alternar } = useOrdenacao(itens, {
    posicao: (p) => p.posicao,
    produto: (p) => p.descProduto,
    clientes: (p) => p.clientesDistintos,
    estoque: (p) => p.estoque,
  })

  function baixarExcel() {
    exportarExcel({
      arquivo: `hits-produtos-sugeridos-${nomePessoa}`.replace(/\s+/g, '-'),
      aba: 'Produtos sugeridos',
      linhas: ordenadas,
      colunas: [
        { titulo: 'Posição', tipo: 'numero', largura: 10, valor: (p) => p.posicao },
        { titulo: 'Código', tipo: 'numero', largura: 10, valor: (p) => p.idProduto },
        { titulo: 'Produto', largura: 50, valor: (p) => p.descProduto },
        { titulo: 'Clientes que compram', tipo: 'numero', largura: 20, valor: (p) => p.clientesDistintos },
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
            Hits para todos os seus clientes positivados.
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
                {ordenadas.slice(0, limite).map((p) => (
                  <tr key={p.idProduto} className="border-b border-github-border last:border-0">
                    <td className="py-1.5 text-xs font-bold text-github-text-muted">{p.posicao}</td>
                    <td className="px-2 py-1.5">
                      <span className="font-medium">{p.descProduto ?? `Produto ${p.idProduto}`}</span>
                      <span className="ml-1.5 text-xs text-github-text-muted">{p.idProduto}</span>
                    </td>
                    <td className="whitespace-nowrap px-2 py-1.5 text-right">{p.clientesDistintos.toLocaleString('pt-BR')}</td>
                    <td className="whitespace-nowrap py-1.5 pl-2 text-right">{p.estoque.toLocaleString('pt-BR')}</td>
                  </tr>
                ))}
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
