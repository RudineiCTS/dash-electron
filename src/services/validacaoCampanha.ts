import { PedidoValidacao, ResultadoValidacao } from "../interfaces/ValidacaoCampanha";
import { api } from "./api";

const ROTA = "campanha-comercial-validacao";

/** Resultado calculado das campanhas da competência (`dataCompetencia` = último dia do mês, AAAA-MM-DD), sem as canceladas. */
export async function listarResultadosValidacao(
  dataCompetencia: string,
  signal?: AbortSignal
): Promise<ResultadoValidacao[]> {
  const { data } = await api.get<ResultadoValidacao[]>(ROTA, { params: { dataCompetencia }, signal });
  return data;
}

/** Pedidos considerados na campanha cujo crédito foi para a pessoa (tblCampanhaComercialRetornoPedido). */
export async function listarPedidosValidacao(
  idCampanha: number,
  idPessoa: number,
  signal?: AbortSignal
): Promise<PedidoValidacao[]> {
  const { data } = await api.get<PedidoValidacao[]>(`${ROTA}/${idCampanha}/pessoa/${idPessoa}/pedidos`, { signal });
  return data;
}
