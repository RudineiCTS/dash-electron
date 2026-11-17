import axios from "axios";
import { api } from "./api";
import {
  ImportacaoExclusivasRequest,
  ImportacaoMetasRequest,
  ImportacaoMetasResultado,
  ImportacaoMetasScriptResponse,
  ImportacaoMetasTotais,
  ImportarExclusivasRequest,
} from "../interfaces/ImportacaoMetas";

const ROTA = "importacao-metas";

/** Mensagem da API: 422 vem como { erro, detalhes }; 400 da importação vem como o resultado com mensagemErro. */
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

/** Script completo do processo, o mesmo que a importação executa. Não toca no banco. */
export async function gerarScriptProcesso(
  request: ImportacaoMetasRequest,
  signal?: AbortSignal
): Promise<ImportacaoMetasScriptResponse> {
  try {
    const { data } = await api.post<ImportacaoMetasScriptResponse>(`${ROTA}/script`, request, { signal });
    return data;
  } catch (e) {
    if (axios.isCancel(e)) throw e;
    throw erroDaApi(e, "Erro ao montar o script do processo.");
  }
}

/** Totais de meta (loja virtual, setor e cobertura) do período, na linha do totalizador. */
export async function obterTotaisMetas(periodoId: number, signal?: AbortSignal): Promise<ImportacaoMetasTotais> {
  try {
    const { data } = await api.get<ImportacaoMetasTotais>(`${ROTA}/totais/${periodoId}`, { signal });
    return data;
  } catch (e) {
    if (axios.isCancel(e)) throw e;
    throw erroDaApi(e, "Erro ao buscar os totais de metas.");
  }
}

/** Script das metas exclusivas com as variáveis informadas. Não toca no banco. */
export async function gerarScriptExclusivas(
  variaveis: ImportacaoExclusivasRequest,
  signal?: AbortSignal
): Promise<ImportacaoMetasScriptResponse> {
  try {
    const { data } = await api.post<ImportacaoMetasScriptResponse>(`${ROTA}/exclusivas/script`, variaveis, { signal });
    return data;
  } catch (e) {
    if (axios.isCancel(e)) throw e;
    throw erroDaApi(e, "Erro ao montar o script das metas exclusivas.");
  }
}

/** Executa o script das metas exclusivas (editado ou não), numa transação. Com `simular: true` desfaz no final. */
export async function importarExclusivas(request: ImportarExclusivasRequest): Promise<ImportacaoMetasResultado> {
  try {
    const { data } = await api.post<ImportacaoMetasResultado>(`${ROTA}/exclusivas/importar`, request);
    return data;
  } catch (e) {
    throw erroDaApi(e, "Erro ao importar as metas exclusivas.");
  }
}

/** Executa o processo no banco, numa transação. Com `simular: true` executa e desfaz no final. */
export async function importarMetas(request: ImportacaoMetasRequest): Promise<ImportacaoMetasResultado> {
  try {
    const { data } = await api.post<ImportacaoMetasResultado>(`${ROTA}/importar`, request);
    return data;
  } catch (e) {
    throw erroDaApi(e, "Erro ao importar as metas.");
  }
}
