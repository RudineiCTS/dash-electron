import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import {
  getCampaignParamsClient,
  getCampaignParamsLineProducts,
  getCampaignParamsManufactures,
  getCampaignParamsProducts,
} from '@shared/services/campaign.teleseler'
import { useApiResource } from '../lib/useApiResource'

/** Até esta quantidade a lista aparece inteira no cartão; acima disso abre a tela própria. */
const MAX_PRODUTOS_NO_CARTAO = 8
const MAX_CLIENTES_NO_CARTAO = 5

/** `Contem` do cadastro: "S" inclui; qualquer outro valor (N) exclui. A API devolve texto, não booleano. */
export function incluiRegra(valor: unknown) {
  return valor === true || String(valor).toUpperCase() === 'S'
}

function Chip({ children, exclui = false }: { children: ReactNode; exclui?: boolean }) {
  return (
    <span
      className={`rounded-md px-2 py-0.5 text-xs ${exclui ? 'bg-other-redflag/10 text-other-redflag' : 'bg-github-bg-hover text-github-text'}`}
    >
      {exclui && 'Exceto '}
      {children}
    </span>
  )
}

function Linha({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-3">
      <dt className="shrink-0 text-xs text-github-text-muted sm:w-24 sm:pt-0.5">{rotulo}</dt>
      <dd className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">{children}</dd>
    </div>
  )
}

/**
 * Parâmetros da campanha (o que conta para ela): fabricante, linhas, produtos e clientes.
 * Listas curtas aparecem no próprio cartão; listas grandes mostram só a quantidade e abrem uma tela.
 */
export function ParametrosCampanha({ idCampaign, competencia }: { idCampaign: number; competencia: string }) {
  const fab = useApiResource((signal) => getCampaignParamsManufactures(idCampaign, signal), [idCampaign])
  const lin = useApiResource((signal) => getCampaignParamsLineProducts(idCampaign, signal), [idCampaign])
  const pro = useApiResource(
    (signal) => getCampaignParamsProducts({ idCampaign, signal, pagination: { totalCount: 0, pageNumber: 1, pageSize: MAX_PRODUTOS_NO_CARTAO + 1, totalPages: 0 } }),
    [idCampaign],
  )
  const cli = useApiResource(
    (signal) => getCampaignParamsClient({ idCampaign, signal, pagination: { totalCount: 0, pageNumber: 1, pageSize: MAX_CLIENTES_NO_CARTAO + 1, totalPages: 0 } }),
    [idCampaign],
  )

  if (fab.loading || lin.loading || pro.loading || cli.loading) {
    return <div className="h-32 animate-pulse rounded-xl border border-github-border bg-github-bg-card" aria-busy="true" />
  }
  if (fab.error && lin.error && pro.error && cli.error) return null

  const fabricantes = fab.data ?? []
  const linhas = lin.data ?? []
  const produtos = pro.data?.items ?? []
  const totalProdutos = pro.data?.totalCount ?? produtos.length
  const clientes = cli.data?.items ?? []
  const totalClientes = cli.data?.totalCount ?? clientes.length
  const base = `/campaigns/details/${idCampaign}/parametros`
  const sufixo = `?competencia=${competencia}`

  return (
    <section aria-label="Parâmetros da campanha" className="flex w-full flex-col gap-2 rounded-xl border border-github-border bg-github-bg-card p-3">
      <h2 className="text-sm font-semibold">Parâmetros da campanha</h2>
      <dl className="flex flex-col gap-2">
        {fabricantes.length > 0 && (
          <Linha rotulo={fabricantes.length > 1 ? 'Fabricantes' : 'Fabricante'}>
            {fabricantes.map((f) => (
              <Chip key={f.idManufacturer} exclui={!incluiRegra(f.isValid)}>
                {f.name}
              </Chip>
            ))}
          </Linha>
        )}

        {linhas.length > 0 && (
          <Linha rotulo="Linhas">
            {linhas.map((l) => (
              <Chip key={l.idProductLine} exclui={!incluiRegra(l.isValid)}>
                {l.name}
              </Chip>
            ))}
          </Linha>
        )}

        {totalProdutos > 0 && (
          <Linha rotulo="Produtos">
            {totalProdutos <= MAX_PRODUTOS_NO_CARTAO ? (
              produtos.map((p) => (
                <Chip key={p.idProduct} exclui={!incluiRegra(p.isValid)}>
                  {p.name}
                </Chip>
              ))
            ) : (
              <Link to={`${base}/produtos${sufixo}`} className="flex items-center gap-1 text-sm font-medium hover:underline">
                {totalProdutos.toLocaleString('pt-BR')} produtos <span className="text-xs font-normal text-github-text-muted">· ver todos</span>
                <ChevronRight size={14} aria-hidden />
              </Link>
            )}
          </Linha>
        )}

        <Linha rotulo="Clientes">
          {totalClientes === 0 ? (
            <span className="text-sm text-github-text-muted">Todos os clientes</span>
          ) : totalClientes <= MAX_CLIENTES_NO_CARTAO ? (
            clientes.map((c) => (
              <Chip key={c.idClients} exclui={!incluiRegra(c.isValid)}>
                {c.clientName || `Cliente ${c.idClients}`}
              </Chip>
            ))
          ) : (
            <Link to={`${base}/clientes${sufixo}`} className="flex items-center gap-1 text-sm font-medium hover:underline">
              {totalClientes.toLocaleString('pt-BR')} clientes <span className="text-xs font-normal text-github-text-muted">· ver todos</span>
              <ChevronRight size={14} aria-hidden />
            </Link>
          )}
        </Linha>

        {fabricantes.length === 0 && linhas.length === 0 && totalProdutos === 0 && (
          <p className="text-xs text-github-text-muted">Esta campanha não tem fabricante, linha nem produtos cadastrados nos parâmetros.</p>
        )}
      </dl>
    </section>
  )
}
