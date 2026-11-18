import axios from "axios";
import { api } from "./api";
import {
  CalculoComissaoRequest,
  CalculoComissaoResultado,
  CalculoComissaoTipoPessoa,
} from "../interfaces/CalculoComissao";

const ROTA = "calculo-comissao";

/** Mensagem da API: 422 vem como { erro, detalhes }; 400 da execução vem como o resultado com mensagemErro. */
function erroDaApi(e: unknown, padrao: string): Error {
  if (axios.isAxiosError(e)) {
    const dados = e.response?.data as
      | { erro?: string; detalhes?: string[]; mensagemErro?: string | null }
      | undefined;

    if (dados?.mensagemErro) return new Error(dados.mensagemErro);
    if (dados?.erro) {
      const detalhes = dados.detalhes?.length ? ` ${dados.detalhes.join(" ")}` : "";
      return new Error(`${dados.erro}${detalhes}`);
    }
    if (!e.response) return new Error("Não foi possível falar com a API. Verifique a conexão e tente de novo.");
  }
  return new Error(padrao);
}

export async function listarTiposPessoaComissao(signal?: AbortSignal): Promise<CalculoComissaoTipoPessoa[]> {
  try {
    const { data } = await api.get<CalculoComissaoTipoPessoa[]>(`${ROTA}/tipos-pessoa`, { signal });
    return data;
  } catch (e) {
    if (axios.isCancel(e)) throw e;
    throw erroDaApi(e, "Erro ao buscar os tipos de pessoa.");
  }
}

/**
 * Executa uspUsuCalculaComissaoVendas pela API. O cálculo percorre todas as metas do período e pode levar
 * alguns minutos: sem limite de tempo no navegador.
 */
export async function executarCalculoComissao(request: CalculoComissaoRequest): Promise<CalculoComissaoResultado> {
  try {
    const { data } = await api.post<CalculoComissaoResultado>(`${ROTA}/executar`, request, { timeout: 0 });
    return data;
  } catch (e) {
    throw erroDaApi(e, request.calcular ? "Erro ao calcular as comissões." : "Erro ao consultar o resultado.");
  }
}
