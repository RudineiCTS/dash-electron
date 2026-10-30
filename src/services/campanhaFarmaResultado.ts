import axios from "axios";
import { api } from "./api";
import {
  LinhaResultadoCampanha,
  RetornoScript,
  SalvarScriptCampanhaInput,
  ScriptCampanha,
  ScriptCampanhaResumo,
  StatusScriptCampanha,
} from "../interfaces/CampanhaFarmaResultado";

/**
 * A API ainda não tem a rota que insere o resultado em tblCampanhaComercialResultado.
 * Quando ela existir, troque para true e implemente `inserirResultado`.
 */
export const INSERCAO_DISPONIVEL = false;

const ROTA = "campaign-result-scripts";

// ── formato da API (ApiCampaignDash: CampaignResultScriptDto) ──
interface LinhaApi {
  idCampaign: number | null;
  campaignDescription: string | null;
  personType: number;
  idPerson: number;
  personName: string | null;
  idSupervisor: number | null;
  supervisorName: string | null;
  idManager: number | null;
  managerName: string | null;
  goal: number;
  assessedValue: number;
  award: number;
  calculatedAt: string | null;
}

interface ResumoApi {
  id: string;
  name: string;
  idCampaign: number | null;
  description: string;
  competenceDate: string;
  status: "Draft" | "ReturnSaved" | "Inserted";
  executedAt: string | null;
  insertedAt: string | null;
  updatedAt: string;
}

interface ScriptApi extends ResumoApi {
  script: string;
  return: { executedAt: string; lines: LinhaApi[] } | null;
}

interface ExecucaoApi {
  success: boolean;
  errorMessage: string | null;
  return: { executedAt: string; lines: LinhaApi[] } | null;
}

interface ResultadoApi {
  success: boolean;
  notFound: boolean;
  errorMessage: string | null;
  script: ScriptApi | null;
}

const STATUS: Record<ResumoApi["status"], StatusScriptCampanha> = {
  Draft: "rascunho",
  ReturnSaved: "retorno_guardado",
  Inserted: "inserido",
};

function paraLinha(l: LinhaApi): LinhaResultadoCampanha {
  return {
    tipoPessoa: l.personType,
    idPessoa: l.idPerson,
    nomePessoa: l.personName ?? "",
    idSupervisor: l.idSupervisor ?? 0,
    nomeSupervisor: l.supervisorName ?? "",
    idGerente: l.idManager ?? 0,
    nomeGerente: l.managerName ?? "",
    objetivo: l.goal,
    valorApurado: l.assessedValue,
    premio: l.award,
  };
}

function paraLinhaApi(l: LinhaResultadoCampanha): LinhaApi {
  return {
    idCampaign: null,
    campaignDescription: null,
    personType: l.tipoPessoa,
    idPerson: l.idPessoa,
    personName: l.nomePessoa,
    idSupervisor: l.idSupervisor,
    supervisorName: l.nomeSupervisor,
    idManager: l.idGerente,
    managerName: l.nomeGerente,
    goal: l.objetivo,
    assessedValue: l.valorApurado,
    award: l.premio,
    calculatedAt: null,
  };
}

function paraResumo(s: ResumoApi): ScriptCampanhaResumo {
  return {
    id: s.id,
    nome: s.name,
    idCampanha: s.idCampaign,
    descricao: s.description,
    dataCompetencia: s.competenceDate.slice(0, 10),
    status: STATUS[s.status],
    executadoEm: s.executedAt,
    inseridoEm: s.insertedAt,
    atualizadoEm: s.updatedAt,
  };
}

function paraScript(s: ScriptApi): ScriptCampanha {
  const { executadoEm, ...resumo } = paraResumo(s);
  return {
    ...resumo,
    script: s.script,
    retorno: s.return
      ? { executadoEm: s.return.executedAt, linhas: s.return.lines.map(paraLinha) }
      : executadoEm
        ? { executadoEm, linhas: [] }
        : null,
  };
}

/** Transforma a falha do axios na mensagem da API (errorMessage) ou em um texto amigável. */
function erroDaApi(e: unknown, padrao: string): Error {
  if (axios.isAxiosError(e)) {
    const mensagem = (e.response?.data as { errorMessage?: string } | undefined)?.errorMessage;
    if (mensagem) return new Error(mensagem);
    if (!e.response) return new Error("Não foi possível falar com a API. Verifique a conexão e tente de novo.");
  }
  return new Error(padrao);
}

/** Scripts da competência (`competencia` no formato AAAA-MM), mais recentes primeiro. */
export async function listarScripts(competencia: string): Promise<ScriptCampanhaResumo[]> {
  try {
    const { data } = await api.get<ResumoApi[]>(ROTA, { params: { competenceDate: `${competencia}-01` } });
    return data.map(paraResumo);
  } catch (e) {
    throw erroDaApi(e, "Erro ao carregar os scripts salvos.");
  }
}

export async function buscarScript(id: string): Promise<ScriptCampanha> {
  try {
    const { data } = await api.get<ScriptApi>(`${ROTA}/${id}`);
    return paraScript(data);
  } catch (e) {
    throw erroDaApi(e, "Erro ao abrir o script.");
  }
}

export async function salvarScript(input: SalvarScriptCampanhaInput): Promise<ScriptCampanha> {
  const corpo = {
    name: input.nome,
    idCampaign: input.idCampanha,
    description: input.descricao,
    script: input.script,
    competenceDate: input.dataCompetencia,
    return: input.retorno
      ? { executedAt: input.retorno.executadoEm, lines: input.retorno.linhas.map(paraLinhaApi) }
      : null,
  };

  try {
    const { data } = input.id
      ? await api.put<ResultadoApi>(`${ROTA}/${input.id}`, corpo)
      : await api.post<ResultadoApi>(ROTA, corpo);
    return paraScript(data.script!);
  } catch (e) {
    throw erroDaApi(e, "Erro ao salvar o script.");
  }
}

/** Executa o script no banco (só leitura) e devolve o retorno, sem salvar nada. */
export async function executarScript(script: string): Promise<RetornoScript> {
  try {
    const { data } = await api.post<ExecucaoApi>(`${ROTA}/execute`, { script });
    return { executadoEm: data.return!.executedAt, linhas: data.return!.lines.map(paraLinha) };
  } catch (e) {
    throw erroDaApi(e, "Erro ao executar o script.");
  }
}

export async function inserirResultado(_id: string): Promise<ScriptCampanha> {
  throw new Error("A inserção do resultado ainda não está disponível na API.");
}
