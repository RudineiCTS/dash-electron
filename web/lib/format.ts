import dayjs from 'dayjs'
import { formatCurrency } from '@shared/utils/formateCurrency'

export { formatCurrency }
export { formatPercent } from '@shared/utils/formatPercent'

/** Competência padrão: último dia do mês corrente (igual ao app desktop). */
export function defaultCompetencia(): string {
  return dayjs().endOf('month').format('YYYY-MM-DD')
}

/** "2026-11" (input type=month) -> "2026-11-30". Vazio/inválido -> null. */
export function monthToCompetencia(month: string): string | null {
  const d = dayjs(`${month}-01`)
  return month && d.isValid() ? d.endOf('month').format('YYYY-MM-DD') : null
}

/** Mesma regra da lista do desktop: só VENDAS é moeda; o resto é número/pontos. */
export function formatSummaryMetric(campaignType: string, value: number): string {
  return campaignType === 'VENDAS' ? formatCurrency(value) : value.toLocaleString('pt-BR')
}

/** Mesma regra do detalhe do desktop: quantidade/positivação são números; o resto é moeda. */
export function formatDetailMetric(campaignType: string, value: number): string {
  return campaignType === 'QUANTIDADE VENDIDA' || campaignType === 'POSITIVAÇÃO'
    ? value.toLocaleString('pt-BR')
    : formatCurrency(value)
}
