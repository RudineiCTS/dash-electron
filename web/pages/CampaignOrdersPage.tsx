import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import dayjs from 'dayjs'
import { getCampaignSummaryPerPeriod } from '@shared/services/campaign.teleseler'
import { PERMITIR_TROCA_USUARIO, useUsuario } from '../auth/UsuarioContext'
import { Stat } from '../components/Stat'
import { EmptyState, ErrorState } from '../components/StateViews'
import { defaultCompetencia, formatCurrency, formatPercent, formatSummaryMetric } from '../lib/format'
import { getPedidosDaPessoa } from '../lib/pedidos'
import { useApiResource } from '../lib/useApiResource'
import NotFoundPage from './NotFoundPage'

const PAGE_SIZE = 50

/**
 * "Meus pedidos": pedidos apurados do usuário logado na campanha.
 * Acima da tabela ficam os dados da campanha (nome, ID, realizado total, percentual total) e a
 * data da apuração; a tabela traz só as linhas dele.
 */
export default function CampaignOrdersPage() {
  const { id } = useParams<{ id: string }>()
  const idCampaign = Number(id)
  const [params] = useSearchParams()
  const competencia = params.get('competencia') ?? defaultCompetencia()
  const { idPessoa, usuario } = useUsuario()
  const [limite, setLimite] = useState(PAGE_SIZE)

  const resumos = useApiResource((signal) => getCampaignSummaryPerPeriod(competencia, signal), [competencia])
  const pedidos = useApiResource(
    (signal) => (idPessoa ? getPedidosDaPessoa(idCampaign, idPessoa, signal) : Promise.resolve(null)),
    [idCampaign, idPessoa],
  )

  if (!Number.isInteger(idCampaign) || idCampaign <= 0) return <NotFoundPage />

  const resumo = resumos.data?.find((s) => s.idCampaign === idCampaign)
  const linhas = pedidos.data?.orders ?? []
  const dataApuracao = pedidos.data?.appraisalDate ? dayjs(pedidos.data.appraisalDate).format('DD/MM/YYYY HH:mm') : '—'

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <Link
          to={`/campaigns/details/${idCampaign}?competencia=${competencia}`}
          aria-label="Voltar para a campanha"
          className="flex h-8 items-center gap-1 rounded-md border border-github-border bg-github-bg-card px-2.5 text-sm text-github-text-muted hover:bg-github-bg-hover"
        >
          <ArrowLeft size={16} /> Campanha
        </Link>
        <h1 className="min-w-0 text-lg font-extrabold">Meus pedidos</h1>
      </div>

      {/* Tudo que fica acima da tabela */}
      <section
        aria-label="Dados da campanha"
        className="flex w-full max-w-3xl flex-col gap-2 rounded-xl border border-github-border bg-github-bg-card p-3"
      >
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-wide text-github-text-muted">Campanha</p>
          <p className="break-words text-sm font-semibold">
            {resumo?.campaignDescription ?? (resumos.loading ? 'Carregando…' : `Campanha #${idCampaign}`)}
            <span className="ml-2 text-xs font-normal text-github-text-muted">#{idCampaign}</span>
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-4">
          <Stat
            label="Realizado total"
            value={resumo ? formatSummaryMetric(resumo.campaignTypeDescription, resumo.assessedValue) : '—'}
          />
          <Stat label="Percentual total" value={resumo ? formatPercent(resumo.percentageAchieved) : '—'} />
          <Stat label="Data da apuração" value={dataApuracao} />
          <Stat
            label="Usuário"
            value={usuario?.operatorName ?? '—'}
            className="col-span-2 sm:col-span-1 [&_dd]:whitespace-normal [&_dd]:break-words"
          />
        </dl>
      </section>

      {!idPessoa && (
        <EmptyState
          message={
            PERMITIR_TROCA_USUARIO
              ? 'Seu usuário não está ligado a uma pessoa do televendas, então não há pedidos para mostrar.'
              : 'Você precisa estar logado para ver os seus pedidos.'
          }
        />
      )}

      {idPessoa && pedidos.loading && (
        <div className="h-40 animate-pulse rounded-xl border border-github-border bg-github-bg-card" aria-busy="true" />
      )}
      {idPessoa && pedidos.error && <ErrorState message={pedidos.error} onRetry={pedidos.reload} />}

      {idPessoa && pedidos.data && !pedidos.error &&
        (linhas.length === 0 ? (
          <EmptyState message="Nenhum pedido apurado para este usuário nesta campanha." />
        ) : (
          <section aria-label="Pedidos" className="flex flex-col gap-2">
            <h2 className="text-base font-semibold">
              Pedidos
              <span className="ml-2 text-xs font-normal text-github-text-muted">{linhas.length} itens</span>
            </h2>

            <div className="max-w-3xl overflow-x-auto rounded-xl border border-github-border bg-github-bg-card">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-github-bg-hover text-[10px] uppercase tracking-tight text-github-text-muted sm:tracking-wide">
                  <tr>
                    <th className="py-2 pl-1.5 font-medium sm:pl-3">Pedido</th>
                    <th className="px-1 py-2 font-medium sm:px-2">Produto</th>
                    <th className="px-1 py-2 font-medium sm:px-2">Cliente</th>
                    <th className="px-1 py-2 font-medium sm:px-2">Origem</th>
                    <th className="whitespace-nowrap px-1 py-2 text-right font-medium sm:px-2">Total</th>
                    <th className="whitespace-nowrap py-2 pl-1 pr-1.5 text-right font-medium sm:pl-2 sm:pr-3">Devolução</th>
                  </tr>
                </thead>
                <tbody>
                  {linhas.slice(0, limite).map((p, i) => (
                    <tr key={`${p.idOrder}-${p.idProduct}-${i}`} className="border-t border-github-border hover:bg-github-bg-hover">
                      <td className="whitespace-nowrap py-1.5 pl-1.5 font-medium sm:pl-3">{p.idOrder}</td>
                      <td className="whitespace-nowrap px-1 py-1.5 sm:px-2">{p.idProduct}</td>
                      <td className="whitespace-nowrap px-1 py-1.5 sm:px-2">{p.idClient ?? '—'}</td>
                      <td className="px-1 py-1.5 text-github-text-muted sm:px-2">{p.origin}</td>
                      <td className="whitespace-nowrap px-1 py-1.5 text-right font-semibold sm:px-2">{formatCurrency(p.total)}</td>
                      <td
                        className={`whitespace-nowrap py-1.5 pl-1 pr-1.5 text-right sm:pl-2 sm:pr-3 ${
                          p.returnValue > 0 ? 'text-other-redflag' : 'text-github-text-muted'
                        }`}
                      >
                        {formatCurrency(p.returnValue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {linhas.length > limite && (
              <button
                type="button"
                onClick={() => setLimite((n) => n + PAGE_SIZE)}
                className="h-9 max-w-3xl rounded-md border border-github-border bg-github-bg-card text-sm font-medium"
              >
                Mostrar mais ({linhas.length - limite})
              </button>
            )}
          </section>
        ))}
    </div>
  )
}
