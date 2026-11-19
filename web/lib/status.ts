/**
 * Campanha sem meta (ex: "Quantidade vendida", paga por quantidade, ou campanha ainda sem meta
 * cadastrada): o percentual de atingimento da API não se aplica (vem 0%), então ela não entra
 * nos status verde/laranja/vermelho nem nos percentuais do resumo.
 */
export function temMeta(c: { goalValue: number | null }): boolean {
  return (c.goalValue ?? 0) > 0
}
