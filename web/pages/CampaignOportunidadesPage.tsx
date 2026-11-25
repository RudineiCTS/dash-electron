import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { getCampaignSummaryPerPeriod } from '@shared/services/campaign.teleseler'
import { PainelOportunidades } from '../components/OportunidadesCampanha'
import { CardListSkeleton, EmptyState, ErrorState } from '../components/StateViews'
import { getResumoOportunidades } from '../lib/campanhaOportunidades'
import { defaultCompetencia } from '../lib/format'
import { useApiResource } from '../lib/useApiResource'
import NotFoundPage from './NotFoundPage'

/** Tela das oportunidades de uma campanha: os três caminhos, filtro, busca e o pedido sugerido de cada cliente. */
export default function CampaignOportunidadesPage() {
  const { id } = useParams<{ id: string }>()
  const idCampaign = Number(id)
  const [params] = useSearchParams()
  const competencia = params.get('competencia') ?? defaultCompetencia()

  const resumos = useApiResource((signal) => getCampaignSummaryPerPeriod(competencia, signal), [competencia])
  const oportunidades = useApiResource((signal) => getResumoOportunidades(idCampaign, signal), [idCampaign])

  if (!Number.isInteger(idCampaign) || idCampaign <= 0) return <NotFoundPage />

  const titulo = resumos.data?.find((s) => s.idCampaign === idCampaign)?.campaignDescription
  const dataCarga = oportunidades.data?.[0]?.dataReferencia

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
        <h1 className="text-lg font-semibold">Oportunidades{titulo ? ` · ${titulo}` : ''}</h1>
        {dataCarga && (
          <span className="text-xs text-github-text-muted">atualizado em {new Date(dataCarga).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
        )}
      </div>

      {oportunidades.loading && <CardListSkeleton count={3} />}
      {oportunidades.error && <ErrorState message={oportunidades.error} onRetry={oportunidades.reload} />}
      {oportunidades.data && oportunidades.data.length === 0 && (
        <EmptyState message="Ainda não há oportunidades calculadas para esta campanha." />
      )}
      {oportunidades.data && oportunidades.data.length > 0 && (
        <PainelOportunidades idCampaign={idCampaign} resumo={oportunidades.data} />
      )}
    </div>
  )
}
