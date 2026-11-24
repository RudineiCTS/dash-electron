import {
  CampanhaComercial,
  CampanhaComercialOpcoes,
  CampanhaComercialResultadoLinha,
  CampanhaComercialUpdate,
} from "../interfaces/CampanhaComercial";
import { api } from "./api";
import { erroDaApi } from "./campanhaFarmaResultado";

const ROTA = "campanha-comercial";

interface ResultadoApi {
  success: boolean;
  notFound: boolean;
  errorMessage: string | null;
  campanha: CampanhaComercial | null;
}

/** Campanhas da competência (`dataCompetencia` = último dia do mês, AAAA-MM-DD). */
export async function listarCampanhasComerciais(
  dataCompetencia: string,
  signal?: AbortSignal
): Promise<CampanhaComercial[]> {
  const { data } = await api.get<CampanhaComercial[]>(ROTA, { params: { dataCompetencia }, signal });
  return data;
}

/** Cadastros auxiliares (situação, tipos de apuração/cálculo/valor/meta) para os selects da grid. */
export async function buscarOpcoesCampanhaComercial(signal?: AbortSignal): Promise<CampanhaComercialOpcoes> {
  const { data } = await api.get<CampanhaComercialOpcoes>(`${ROTA}/opcoes`, { signal });
  return data;
}

/** Calcula a campanha (a API executa uspUsuCalculaCampanhaComercial) e devolve a campanha como ficou. */
export async function calcularCampanhaComercial(id: number): Promise<CampanhaComercial> {
  try {
    const { data } = await api.post<ResultadoApi>(`${ROTA}/${id}/calcular`);
    if (!data.campanha) throw new Error("A API não devolveu a campanha calculada.");
    return data.campanha;
  } catch (e) {
    throw erroDaApi(e, "Erro ao calcular a campanha.");
  }
}

/** Linhas do resultado calculado da campanha (para exportar). */
export async function buscarResultadoCampanhaComercial(id: number): Promise<CampanhaComercialResultadoLinha[]> {
  try {
    const { data } = await api.get<CampanhaComercialResultadoLinha[]>(`${ROTA}/${id}/resultado`);
    return data;
  } catch (e) {
    throw erroDaApi(e, "Erro ao buscar o resultado da campanha.");
  }
}

/** Grava a linha em tblCampanhaComercial e devolve a campanha como ficou (com as descrições dos cadastros). */
export async function atualizarCampanhaComercial(
  id: number,
  corpo: CampanhaComercialUpdate
): Promise<CampanhaComercial> {
  try {
    const { data } = await api.put<ResultadoApi>(`${ROTA}/${id}`, corpo);
    if (!data.campanha) throw new Error("A API não devolveu a campanha salva.");
    return data.campanha;
  } catch (e) {
    throw erroDaApi(e, "Erro ao salvar a campanha.");
  }
}
