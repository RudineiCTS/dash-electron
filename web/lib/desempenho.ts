import dayjs, { type Dayjs } from 'dayjs'
import type { CampaignResult } from '@shared/interfaces/CampaignResultTelesales'
import type { CampaignSummary } from '@shared/interfaces/CampaignSummary'
import { temMeta } from './status'

/** Bloco "Meta e prazo" (campanhas de bateu levou). */
export interface MetaPrazo {
  /** "individual" = meta da própria pessoa; "equipe" = a meta é da campanha inteira (não há meta individual). */
  origem: 'individual' | 'equipe'
  /** Tipo da campanha (VENDAS, QUANTIDADE VENDIDA...), para formatar os valores como moeda ou número. */
  tipoCampanha: string
  meta: number
  realizado: number
  /** Percentual que a API já calculou (mesmo número do resto da aplicação). */
  percentual: number
  /** Quanto falta para a meta (0 quando já bateu). */
  falta: number
  batida: boolean
  /** O fim da campanha já passou. */
  encerrada: boolean
  /** Dias úteis (seg a sex, sem feriados) de hoje até o fim, contando hoje. null se o fim é desconhecido. */
  diasUteis: number | null
  /** Quanto vender por dia útil para bater a meta. null se já bateu, se encerrou ou se não há dias úteis. */
  porDiaUtil: number | null
}

/** Bloco "Minha posição" (campanhas de ranking). Só a posição própria: nada de colegas. */
export interface Posicao {
  posicao: number
  de: number
  /** Prêmio que o ranking já apurou para a pessoa. */
  premio: number
}

export interface Desempenho {
  meta: MetaPrazo | null
  posicao: Posicao | null
}

/** Dias úteis (seg a sex) de `hoje` até `fim`, ambos inclusos. 0 se o fim já passou. */
export function diasUteisRestantes(fim: string, hoje: Dayjs = dayjs()): number {
  const ultimo = dayjs(fim).startOf('day')
  let dia = hoje.startOf('day')
  let uteis = 0
  // trava de segurança: uma campanha não dura mais que ~2 anos
  for (let i = 0; i < 800 && !dia.isAfter(ultimo); i++) {
    const semana = dia.day() // 0 = domingo, 6 = sábado
    if (semana !== 0 && semana !== 6) uteis++
    dia = dia.add(1, 'day')
  }
  return uteis
}

/**
 * Monta o que o painel mostra. Cada bloco só existe se houver dado:
 * - meta: a individual (se > 0); senão a da campanha (equipe); senão nenhuma;
 * - posição: só se a pessoa tem ranking (> 0).
 */
export function montarDesempenho(
  resumo: CampaignSummary | undefined,
  meu: CampaignResult | undefined,
  totalParticipantes: number,
  hoje: Dayjs = dayjs(),
): Desempenho {
  const tipoCampanha = meu?.campaignTypeDescription ?? resumo?.campaignTypeDescription ?? ''

  let base: Pick<MetaPrazo, 'origem' | 'meta' | 'realizado' | 'percentual'> | null = null
  if (meu && meu.individualTarget > 0) {
    base = {
      origem: 'individual',
      meta: meu.individualTarget,
      realizado: meu.assessedValue,
      percentual: meu.percentageAchieved,
    }
  } else if (resumo && temMeta(resumo)) {
    base = {
      origem: 'equipe',
      meta: resumo.goalValue,
      realizado: resumo.assessedValue,
      percentual: resumo.percentageAchieved,
    }
  }

  let meta: MetaPrazo | null = null
  if (base) {
    const falta = Math.max(base.meta - base.realizado, 0)
    const fim = resumo ? (resumo.earlyEndDate ?? resumo.endDate) : null
    const encerrada = !!fim && dayjs(fim).startOf('day').isBefore(hoje.startOf('day'))
    const diasUteis = fim && !encerrada ? diasUteisRestantes(fim, hoje) : null
    const batida = falta === 0

    meta = {
      ...base,
      tipoCampanha,
      falta,
      batida,
      encerrada,
      diasUteis,
      porDiaUtil: !batida && !encerrada && diasUteis ? falta / diasUteis : null,
    }
  }

  const ranking = meu?.ranking ?? 0
  const posicao: Posicao | null =
    meu && ranking > 0 && totalParticipantes > 0
      ? { posicao: ranking, de: totalParticipantes, premio: meu.award }
      : null

  return { meta, posicao }
}
