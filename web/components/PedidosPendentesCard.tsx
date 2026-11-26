import { Link } from 'react-router-dom'
import { Ban, ChevronRight, Hourglass } from 'lucide-react'
import { getPedidosPendentes, type TipoPedidos } from '../lib/campanhaPedidosPendentes'
import { formatCurrency } from '../lib/format'
import { useApiResource } from '../lib/useApiResource'

interface Props {
  idCampaign: number
  competencia: string
  idPessoa: number
  /** Pendentes (ainda não faturados) ou excluídos. */
  tipo?: TipoPedidos
}

const TEXTOS = {
  pendentes: {
    titulo: 'Pedidos pendentes',
    vazio: 'Nenhum pedido digitado aguardando faturamento com produtos desta campanha.',
    ajuda: 'Digitados por você, ainda não faturados, com produtos desta campanha.',
    rota: 'pedidos-pendentes',
  },
  excluidos: {
    titulo: 'Pedidos excluídos',
    vazio: 'Nenhum pedido digitado e excluído com produtos desta campanha.',
    ajuda: 'Digitados por você e excluídos, com produtos desta campanha.',
    rota: 'pedidos-excluidos',
  },
} as const

const cartao = 'rounded-xl border border-github-border bg-github-bg-card p-3'

/**
 * Pedidos que a pessoa digitou, ainda não foram faturados e são da campanha: quantos são e quanto valem para a campanha
 * (só os itens da campanha). Ao clicar, abre a lista com os produtos de cada pedido.
 */
export function PedidosPendentesCard({ idCampaign, competencia, idPessoa, tipo = 'pendentes' }: Props) {
  const txt = TEXTOS[tipo]
  const Icone = tipo === 'excluidos' ? Ban : Hourglass
  const pendentes = useApiResource((signal) => getPedidosPendentes(idCampaign, idPessoa, signal, tipo), [idCampaign, idPessoa, tipo])

  if (pendentes.loading) return <div className="h-24 animate-pulse rounded-xl border border-github-border bg-github-bg-card" aria-busy="true" />
  if (pendentes.error || !pendentes.data) {
    return (
      <section className={cartao} aria-label={txt.titulo}>
        <h3 className="flex items-center gap-1.5 text-sm font-semibold">
          <Icone size={15} /> {txt.titulo}
        </h3>
        <p className="mt-1 text-xs text-github-text-muted">Não foi possível carregar agora.</p>
      </section>
    )
  }

  const { totalPedidos, valorCampanha } = pendentes.data
  const destino = `/campaigns/details/${idCampaign}/${txt.rota}?competencia=${competencia}&pessoa=${idPessoa}`

  return (
    <section className={cartao} aria-label={txt.titulo}>
      <h3 className="flex items-center gap-1.5 text-sm font-semibold">
        <Icone size={15} /> {txt.titulo}
      </h3>
      {totalPedidos === 0 ? (
        <p className="mt-1 text-xs text-github-text-muted">{txt.vazio}</p>
      ) : (
        <>
          <p className="mt-1 text-xs text-github-text-muted">{txt.ajuda}</p>
          <div className="mt-2 flex items-end justify-between gap-2 border-t border-github-border pt-2">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-github-text-muted">Valor da campanha</p>
              <p className="text-lg font-bold tabular-nums">{formatCurrency(valorCampanha)}</p>
              <p className="text-xs text-github-text-muted">
                {totalPedidos.toLocaleString('pt-BR')} {totalPedidos === 1 ? 'pedido' : 'pedidos'}
              </p>
            </div>
            <Link
              to={destino}
              className="flex h-8 items-center gap-1 rounded-md border border-github-border px-2.5 text-xs font-medium hover:bg-github-bg-hover"
            >
              Ver pedidos <ChevronRight size={14} />
            </Link>
          </div>
        </>
      )}
    </section>
  )
}
