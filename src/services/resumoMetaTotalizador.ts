import { ResumoMetaTotalizador } from "../interfaces/ResumoMetaTotalizador";
import { api } from "./api";

export async function getResumoMetaTotalizador(
    dataFim: string,
    signal?: AbortSignal
): Promise<ResumoMetaTotalizador[]> {
    const response = await api.get<ResumoMetaTotalizador[]>(
        `resumo-meta-totalizador/${dataFim}`,
        { signal }
    );
    return response.data;
}
