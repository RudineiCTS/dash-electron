import { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Download } from 'lucide-react'
import { apiParams } from '@shared/services/api'
import { exportarExcel } from '../lib/exportarExcel'
import { incluiRegra } from '../components/ParametrosCampanha'
import { EmptyState, ErrorState } from '../components/StateViews'
import { ThOrdenavel } from '../components/ThOrdenavel'
import { defaultCompetencia } from '../lib/format'
import { useOrdenacao } from '../lib/ordenar'
import { useApiResource } from '../lib/useApiResource'
import NotFoundPage from './NotFoundPage'

const TAMANHO = 50

type Linha = Record<string, unknown>

/**
 * Lista completa de produtos ou de clientes de uma campanha (parâmetros), com busca por código, ordenação por coluna e paginação.
 * Traz a lista inteira de uma vez (a mesma do Excel) para a ordenação valer para todos os registros, e não só para a página aberta.
 */
export default function CampaignParametrosPage() {
  const { id, tipo } = useParams<{ id: string; tipo: string }>()
  const idCampaign = Number(id)
  const [params] = useSearchParams()
  const competencia = params.get('competencia') ?? defaultCompetencia()
  const [pagina, setPagina] = useState(1)
  const [busca, setBusca] = useState('')

  const ehProduto = tipo === 'produtos'
  const valido = Number.isInteger(idCampaign) && idCampaign > 0 && (ehProduto || tipo === 'clientes')

  const lista = useApiResource<Linha[] | null>(
    async (signal) => {
      if (!valido) return null
      const resposta = await apiParams.get<Linha[]>(`${ehProduto ? 'produto' : 'cliente'}/${idCampaign}/todos`, { signal })
      return resposta.data
    },
    [idCampaign, tipo],
  )

  const codigoDe = (r: Linha) => String(ehProduto ? r.idProduct : r.idClients)

  // busca pelo começo do código
  const filtradas = useMemo(() => {
    const termo = busca.trim()
    const todas = lista.data ?? []
    return termo ? todas.filter((r) => codigoDe(r).startsWith(termo)) : todas
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lista.data, busca, ehProduto])

  const { ordenadas, ord, alternar } = useOrdenacao<Linha>(filtradas, {
    codigo: (r) => Number(codigoDe(r)),
    nome: (r) => String(ehProduto ? (r.name ?? '') : (r.clientName ?? '')),
    cidade: (r) => [r.city, r.state].filter(Boolean).join(' / '),
    regra: (r) => (incluiRegra(r.isValid) ? 'Conta' : 'Não conta'),
  })

  const [exportando, setExportando] = useState(false)
  const [erroExcel, setErroExcel] = useState<string | null>(null)

  /** Baixa a lista COMPLETA da campanha, na ordem que está na tela. Sem CPF/CNPJ, de propósito. */
  function baixarExcel() {
    setExportando(true)
    setErroExcel(null)
    try {
      const regra = (r: Linha) => (incluiRegra(r.isValid) ? 'Conta' : 'Não conta')
      if (ehProduto) {
        exportarExcel({
          arquivo: `produtos-campanha-${idCampaign}`,
          aba: 'Produtos',
          linhas: ordenadas,
          colunas: [
            { titulo: 'Código', tipo: 'numero', largura: 12, valor: (r) => Number(r.idProduct) },
            { titulo: 'Produto', largura: 50, valor: (r) => String(r.name ?? '') },
            { titulo: 'Regra', largura: 12, valor: regra },
          ],
        })
      } else {
        exportarExcel({
          arquivo: `clientes-campanha-${idCampaign}`,
          aba: 'Clientes',
          linhas: ordenadas,
          colunas: [
            { titulo: 'Código', tipo: 'numero', largura: 12, valor: (r) => Number(r.idClients) },
            { titulo: 'Cliente', largura: 44, valor: (r) => String(r.clientName ?? '') },
            { titulo: 'Cidade', largura: 24, valor: (r) => String(r.city ?? '') },
            { titulo: 'UF', largura: 6, valor: (r) => String(r.state ?? '') },
            { titulo: 'Regra', largura: 12, valor: regra },
          ],
        })
      }
    } catch {
      setErroExcel('Não foi possível gerar o Excel agora. Tente de novo.')
    } finally {
      setExportando(false)
    }
  }

  if (!valido) return <NotFoundPage />

  const total = ordenadas.length
  const totalPaginas = Math.max(1, Math.ceil(total / TAMANHO))
  const paginaAtual = Math.min(pagina, totalPaginas)
  const itens = ordenadas.slice((paginaAtual - 1) * TAMANHO, paginaAtual * TAMANHO)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <Link
          to={`/campaigns/details/${idCampaign}?competencia=${competencia}`}
          aria-label="Voltar para a campanha"
          className="flex h-8 items-center gap-1 rounded-md border border-github-border bg-github-bg-card px-2.5 text-sm text-github-text-muted hover:bg-github-bg-hover"
        >
          <ArrowLeft size={15} /> Campanha
        </Link>
        <h1 className="text-lg font-semibold">
          {ehProduto ? 'Produtos' : 'Clientes'} da campanha #{idCampaign}
        </h1>
        {!lista.loading && <span className="text-xs text-github-text-muted">{total.toLocaleString('pt-BR')} no total</span>}
        <button
          type="button"
          onClick={baixarExcel}
          disabled={exportando || total === 0}
          className="ml-auto flex h-9 items-center gap-1.5 rounded-md border border-github-border bg-github-bg-card px-3 text-sm font-medium hover:bg-github-bg-hover disabled:opacity-50"
        >
          <Download size={15} aria-hidden /> {exportando ? 'Gerando…' : `Exportar Excel (${total.toLocaleString('pt-BR')})`}
        </button>
      </div>
      {erroExcel && (
        <p role="alert" className="text-sm text-other-redflag">
          {erroExcel}
        </p>
      )}

      <input
        type="search"
        inputMode="numeric"
        value={busca}
        onChange={(e) => {
          setBusca(e.target.value.replace(/\D/g, ''))
          setPagina(1)
        }}
        placeholder={ehProduto ? 'Buscar pelo código do produto' : 'Buscar pelo código do cliente'}
        aria-label="Buscar pelo código"
        className="h-9 w-full rounded-md border border-github-border bg-github-bg-card px-3 text-base placeholder:text-github-text-muted sm:w-72 sm:text-sm"
      />

      {lista.loading && <div className="h-40 animate-pulse rounded-xl border border-github-border bg-github-bg-card" aria-busy="true" />}
      {lista.error && <ErrorState message={lista.error} onRetry={lista.reload} />}
      {!lista.loading && !lista.error && itens.length === 0 && <EmptyState message="Nada encontrado." />}

      {itens.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-github-border bg-github-bg-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-github-bg-hover text-[10px] uppercase tracking-wide text-github-text-muted">
              <tr>
                <ThOrdenavel rotulo="Código" chave="codigo" ord={ord} onAlternar={alternar} className="px-3 py-2 font-medium" />
                <ThOrdenavel rotulo={ehProduto ? 'Produto' : 'Cliente'} chave="nome" ord={ord} onAlternar={alternar} className="px-3 py-2 font-medium" />
                {!ehProduto && <ThOrdenavel rotulo="Cidade" chave="cidade" ord={ord} onAlternar={alternar} className="px-3 py-2 font-medium" />}
                <ThOrdenavel rotulo="Regra" chave="regra" ord={ord} onAlternar={alternar} className="px-3 py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {itens.map((r) => {
                const codigoLinha = codigoDe(r)
                return (
                  <tr key={codigoLinha} className="border-t border-github-border">
                    <td className="px-3 py-1.5 tabular-nums">{codigoLinha}</td>
                    <td className="px-3 py-1.5">{String(ehProduto ? r.name : r.clientName) || '—'}</td>
                    {!ehProduto && (
                      <td className="px-3 py-1.5 text-github-text-muted">
                        {[r.city, r.state].filter(Boolean).join(' / ') || '—'}
                      </td>
                    )}
                    <td className="px-3 py-1.5">{incluiRegra(r.isValid) ? 'Conta' : 'Não conta'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalPaginas > 1 && (
        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            disabled={paginaAtual <= 1}
            onClick={() => setPagina(paginaAtual - 1)}
            className="h-9 rounded-md border border-github-border px-4 hover:bg-github-bg-hover disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="text-xs text-github-text-muted">
            Página {paginaAtual} de {totalPaginas}
          </span>
          <button
            type="button"
            disabled={paginaAtual >= totalPaginas}
            onClick={() => setPagina(paginaAtual + 1)}
            className="h-9 rounded-md border border-github-border px-4 hover:bg-github-bg-hover disabled:opacity-50"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  )
}
