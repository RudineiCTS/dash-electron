/** 1 = Gerente, 2 = Supervisor, 3 = Vendedor, 4 = Grandes Contas, 5 = Pessoa Interna, 6 = Televendas */
export const TIPO_PESSOA_ROTULO: Record<number, string> = {
  1: "Gerente",
  2: "Supervisor",
  3: "Vendedor",
  4: "Grandes Contas",
  5: "Pessoa Interna",
  6: "Televendas",
};

export type StatusScriptCampanha = "rascunho" | "retorno_guardado" | "inserido";

/** Uma linha do retorno do script de apuração (supervisores e gerentes já consolidados). */
export interface LinhaResultadoCampanha {
  tipoPessoa: number;
  idPessoa: number;
  nomePessoa: string;
  idSupervisor: number;
  nomeSupervisor: string;
  idGerente: number;
  nomeGerente: string;
  objetivo: number;
  valorApurado: number;
  premio: number;
}

export interface RetornoScript {
  /** ISO 8601 */
  executadoEm: string;
  linhas: LinhaResultadoCampanha[];
}

export interface ScriptCampanha {
  id: string;
  nome: string;
  /** ID da campanha comercial (IDCampanhaComercial); necessário para gerar o INSERT. */
  idCampanha: number | null;
  descricao: string;
  script: string;
  /** AAAA-MM-DD */
  dataCompetencia: string;
  status: StatusScriptCampanha;
  retorno: RetornoScript | null;
  inseridoEm: string | null;
  atualizadoEm: string;
}

/** Item da lista de scripts salvos: sem o texto do script nem as linhas do retorno. */
export type ScriptCampanhaResumo = Omit<ScriptCampanha, "script" | "retorno"> & {
  /** ISO 8601 da última execução, se houver retorno guardado. */
  executadoEm: string | null;
};

export interface SalvarScriptCampanhaInput {
  /** Sem id = script novo. */
  id: string | null;
  nome: string;
  idCampanha: number | null;
  descricao: string;
  script: string;
  dataCompetencia: string;
  /** Retorno da última execução feita na tela, para guardar junto com o script (null = não guardar). */
  retorno: RetornoScript | null;
}
