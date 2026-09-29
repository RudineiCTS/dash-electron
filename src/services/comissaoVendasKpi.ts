import { ComissaoVendasKpi } from "../interfaces/ComissaoVendasKpi";
import { api } from "./api";

export async function getComissaoVendasKpi(
    dataFim: string,
    signal?: AbortSignal
): Promise<ComissaoVendasKpi[]> {
    const response = await api.get<ComissaoVendasKpi[]>(
        `comissao-vendas-kpi/${dataFim}`,
        { signal }
    );
    return response.data;
}
