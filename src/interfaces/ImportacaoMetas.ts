export interface ImportacaoMetaVendedor {
  idVendedor: number;
  metaLojaVirtual: number;
  metaSetor: number;
  metaCoberturaCarteira: number;
}

export interface ValoresSupervisao {
  metaLojaVirtual: number;
  metaSetor: number;
  metaCoberturaCarteira: number;
}

export interface ImportacaoMetasRequest {
  idPeriodoCompetencia: number;
  /** Sem valor = padrão do processo na API. */
  idSupervisor?: number | null;
  idAssistenteSupervisor?: number | null;
  idGerente?: number | null;
  vendedores: ImportacaoMetaVendedor[];
  supervisao: ValoresSupervisao;
  /** true = a API executa tudo e desfaz no final (teste, não grava). */
  simular?: boolean;
}

export interface ImportacaoMetasScriptResponse {
  script: string;
  avisos: string[];
}

export interface ImportacaoMetasResultado {
  sucesso: boolean;
  mensagemErro: string | null;
  simulado: boolean;
  metasGravadas: number;
  linhasMetaSetor: number;
  linhasMetaValor: number;
  /** Linhas de cada consulta de conferência do script, na ordem em que ele as executa. */
  linhasPorResultado: number[];
  mensagens: string[];
  avisos: string[];
}

/** Totais de meta do período, na linha do totalizador (supervisora + gerente do processo). */
export interface ImportacaoMetasTotais {
  lojaVirtual: number;
  setor: number;
  coberturaCarteira: number;
  temMetas: boolean;
}

/** Variáveis de execução da importação de metas exclusivas (viram a seção DECLARE do script). */
export interface ImportacaoExclusivasRequest {
  idPeriodoCompetencia: number;
  idCenario?: number | null;
  idTipoPessoa: number;
  idSupervisor?: number | null;
  idGerente?: number | null;
  valoresGarantidos: boolean;
  premioLojaVirtual: boolean;
  gatilhoVenda: boolean;
  minimoGarantido: number;
  ganhoMaximo: number;
  valorGatilhoVenda: number;
  metaVenda: number;
  metaPositivacao: number;
  minimoPositivacao: number;
}

/** Execução do script das metas exclusivas (o texto pode ter sido editado na tela). */
export interface ImportarExclusivasRequest {
  idPeriodoCompetencia: number;
  script: string;
  simular?: boolean;
}
