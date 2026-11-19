import type { CampaignSummary } from "../interfaces/CampaignSummary";

export interface TotaisCampanhas {
    /** Meta somada das campanhas de VENDAS que têm meta (R$). */
    meta: number;
    /** Realizado somado das mesmas campanhas (R$). */
    realizado: number;
    /** Valor Bees das mesmas campanhas (R$). */
    bees: number;
    /** Percentual realizado/meta (0-100+); null quando não há meta para comparar. */
    percentual: number | null;
    /** Premiação de todas as campanhas (sempre em R$, vale para qualquer tipo). */
    premiacao: number;
    /** Quantas campanhas de vendas com meta entraram na conta. */
    vendasComMeta: number;
    /** Campanhas sem meta (percentual não se aplica), de qualquer tipo. */
    semMeta: number;
    /** Campanhas de outro tipo (positivação, quantidade vendida...) com meta, medidas em unidades e não em R$. */
    outrasUnidades: number;
}

/**
 * Totais do mês sem misturar o que não pode ser somado:
 *  - só VENDAS (R$) entra em meta/realizado/percentual; positivação e quantidade são contagens;
 *  - campanha sem meta (meta <= 0) fica fora: o atingimento não existe e o realizado dela
 *    distorceria o total (ex.: R$ 7,4 mi realizados numa campanha com meta 0).
 * A premiação soma todas, porque é sempre em R$.
 */
export function calcularTotaisCampanhas(data: CampaignSummary[]): TotaisCampanhas {
    const temMeta = (c: CampaignSummary) => (c.goalValue ?? 0) > 0;
    const vendasComMeta = data.filter((c) => c.campaignTypeDescription === "VENDAS" && temMeta(c));

    const meta = vendasComMeta.reduce((s, c) => s + c.goalValue, 0);
    const realizado = vendasComMeta.reduce((s, c) => s + (c.assessedValue ?? 0), 0);
    const bees = vendasComMeta.reduce((s, c) => s + (c.assessedValueBees ?? 0), 0);

    return {
        meta,
        realizado,
        bees,
        percentual: meta > 0 ? (realizado / meta) * 100 : null,
        premiacao: data.reduce((s, c) => s + (c.totalAward ?? 0), 0),
        vendasComMeta: vendasComMeta.length,
        semMeta: data.filter((c) => !temMeta(c)).length,
        outrasUnidades: data.filter((c) => c.campaignTypeDescription !== "VENDAS" && temMeta(c)).length,
    };
}
