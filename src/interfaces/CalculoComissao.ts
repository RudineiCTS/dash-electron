export interface CalculoComissaoRequest {
  idPeriodoCompetencia: number;
  /** false = só consulta o resultado já calculado; true = recalcula e grava. */
  calcular: boolean;
  /** 0 = resultado do Televendas (gerente 28727); 1 = Farma (gerentes 7916, 4680 e 159452). */
  tipoComissao: number;
  /** IDs de pessoa separados por vírgula; vazio = todas. */
  idPessoas: string;
  /** Tipos de pessoa; vazio = todos. */
  tipoPessoas: number[];
  /** true = a API executa o cálculo e desfaz no final (teste, não grava). */
  simular?: boolean;
}

export interface CalculoComissaoLinha {
  idPessoa: number;
  pessoa: string | null;
  idSupervisor: number | null;
  supervisor: string | null;
  idGerente: number | null;
  gerente: string | null;
  tipoPessoa: string | null;
  idKpi: number | null;
  codigoKpi: string | null;
  descricaoKpi: string | null;
  nomeKpi: string | null;
  valorPremio: number;
  valorApurado: number;
  valorMeta: number;
  realizado: number;
  dataCalculo: string | null;
  idMeta: number | null;
}

export interface CalculoComissaoResultado {
  sucesso: boolean;
  mensagemErro: string | null;
  calculou: boolean;
  simulado: boolean;
  linhas: CalculoComissaoLinha[];
  totalLinhas: number;
  totalPessoas: number;
  totalPremio: number;
  totalApurado: number;
  /** Havia mais linhas do que as devolvidas (os totais continuam somando todas). */
  truncado: boolean;
  mensagens: string[];
}

export interface CalculoComissaoTipoPessoa {
  id: number;
  descricao: string;
}
