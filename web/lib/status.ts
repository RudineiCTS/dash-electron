/**
 * Campanha sem meta (ex: "Quantidade vendida", paga por quantidade, ou campanha ainda sem meta
 * cadastrada): o percentual de atingimento da API não se aplica (vem 0%), então ela não entra
 * nos status verde/laranja/vermelho nem nos percentuais do resumo.
 */
export function temMeta(c: { goalValue: number | null }): boolean {
  return (c.goalValue ?? 0) > 0
}

/**
 * Quanto falta para bater a meta da campanha (na mesma unidade do realizado: R$, pontos ou unidades).
 * null = não se aplica: sem meta ou com o apurado escondido do usuário. 0 = meta batida.
 */
export function faltaParaBater(c: { goalValue: number | null; assessedValue: number | null; assessedHidden?: boolean }): number | null {
  if (c.assessedHidden || (c.goalValue ?? 0) <= 0 || c.assessedValue == null) return null
  return Math.max((c.goalValue as number) - c.assessedValue, 0)
}

/**
 * Cor por status: verde = bateu a meta (>= 100%), laranja = em andamento (50% a 99%),
 * vermelho = abaixo de 50%, cinza = sem meta. Usada na faixa lateral, na barra e no percentual
 * dos cards de campanha e do painel de desempenho.
 */
export function statusDoCard(percent: number, comMeta: boolean) {
  if (!comMeta) return { faixa: 'border-l-[#888780]', barra: 'bg-[#888780]', texto: 'text-github-text-muted' }
  if (percent >= 100) return { faixa: 'border-l-[#3B6D11]', barra: 'bg-[#3B6D11]', texto: 'text-[#3B6D11]' }
  if (percent >= 50) return { faixa: 'border-l-[#EF9F27]', barra: 'bg-[#EF9F27]', texto: 'text-github-text' }
  return { faixa: 'border-l-[#E24B4A]', barra: 'bg-[#E24B4A]', texto: 'text-[#E24B4A]' }
}
