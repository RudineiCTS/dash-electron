import { ComissaoTelevendasMeta } from "../interfaces/ComissaoTelevendasMeta";
import { api } from "./api";

export async function getComissaoTelevendasMetas(
    idComissaoVendasPeriodoCompetencia: number,
    signal?: AbortSignal
): Promise<ComissaoTelevendasMeta[]> {
    const response = await api.get<ComissaoTelevendasMeta[]>(
        `comissao-televendas-metas/${idComissaoVendasPeriodoCompetencia}`,
        { signal }
    );
    return response.data;
}
