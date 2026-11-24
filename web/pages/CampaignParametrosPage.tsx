import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { getCampaignParamsClient, getCampaignParamsProducts } from '@shared/services/campaign.teleseler'
import { incluiRegra } from '../components/ParametrosCampanha'
import { EmptyState, ErrorState } from '../components/StateViews'
import { defaultCompetencia } from '../lib/format'
import { useApiResource } from '../lib/useApiResource'
import NotFoundPage from './NotFoundPage'

const TAMANHO = 50

/** Produto e cliente voltam no mesmo formato de página; as colunas são lidas pelo nome. */
interface PaginaParametros {
  items: unknown[]
  totalCount?: number
  totalPages?: number
}

/** Lista completa de produtos ou de clientes de uma campanha (parâmetros), com busca por código e paginação. */
export default function CampaignParametrosPage() {
  const { id, tipo } = useParams<{ id: string; tipo: string }>()
  const idCampaign = Number(id)
  const [params] = useSearchParams()
  const competencia = params.get('competencia') ?? defaultCompetencia()
  const [pagina, setPagina] = useState(1)
  const [busca, setBusca] = useState('')
  const codigo = Number(busca) || undefined

  const ehProduto = tipo === 'produtos'
  const valido = Number.isInteger(idCampaign) && idCampaign > 0 && (ehProduto || tipo === 'clientes')

  const lista = useApiResource<PaginaParametros | null>(
    (signal) =>
      !valido
        ? Promise.resolve(null)
        : ehProduto
          ? getCampaignParamsProducts(
              codigo
                ? { idCampaign, signal, idItem: codigo }
                : { idCampaign, signal, pagination: { totalCount: 0, pageNumber: pagina, pageSize: TAMANHO, totalPages: 0 } },
            )
          : getCampaignParamsClient(
              codigo
                ? { idCampaign, signal, idItem: codigo }
                : { idCampaign, signal, pagination: { totalCount: 0, pageNumber: pagina, pageSize: TAMANHO, totalPages: 0 } },
            ),
    [idCampaign, tipo, pagina, codigo],
  )

  if (!valido) return <NotFoundPage />

  const itens = (lista.data?.items ?? []) as Array<Record<string, unknown>>
  const total = lista.data?.totalCount ?? itens.length
  const totalPaginas = lista.data?.totalPages ?? 1

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
      </div>

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
                <th className="px-3 py-2 font-medium">Código</th>
                <th className="px-3 py-2 font-medium">{ehProduto ? 'Produto' : 'Cliente'}</th>
                {!ehProduto && <th className="px-3 py-2 font-medium">Cidade</th>}
                <th className="px-3 py-2 font-medium">Regra</th>
              </tr>
            </thead>
            <tbody>
              {itens.map((r) => {
                const codigoLinha = String(ehProduto ? r.idProduct : r.idClients)
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

      {!codigo && totalPaginas > 1 && (
        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            disabled={pagina <= 1}
            onClick={() => setPagina((p) => p - 1)}
            className="h-9 rounded-md border border-github-border px-4 hover:bg-github-bg-hover disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="text-xs text-github-text-muted">
            Página {pagina} de {totalPaginas}
          </span>
          <button
            type="button"
            disabled={pagina >= totalPaginas}
            onClick={() => setPagina((p) => p + 1)}
            className="h-9 rounded-md border border-github-border px-4 hover:bg-github-bg-hover disabled:opacity-50"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  )
}
