import { ValorParametro } from "../interfaces/ValorParametro";
import { api } from "./api";

export interface ValorParametrosQuery {
    tipoParametro: string;
    descricao?: string;
    id?: number;
}

export async function getValorParametros(query: ValorParametrosQuery, signal?: AbortSignal): Promise<ValorParametro[]> {
    const response = await api.get<ValorParametro[]>("get-params-values", {
        params: {
            tipoParametro: query.tipoParametro,
            descricao: query.descricao,
            id: query.id,
        },
        signal,
    });
    return response.data;
}
