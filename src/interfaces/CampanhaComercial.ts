/** Campanha comercial (Farma) - GS300GP.dbo.tblCampanhaComercial, como a API devolve (campo a campo). */
export interface CampanhaComercial {
  idCampanhaComercial: number;
  /** Último dia do mês de competência (ISO). */
  dataCompetencia: string | null;
  idSituacao: number;
  descricaoSituacao: string | null;
  descricaoCampanha: string;
  dataInicioApuracao: string | null;
  dataFimApuracao: string | null;
  idTipoApuracao: number;
  descricaoTipoApuracao: string | null;
  idTipoCalculo: number;
  descricaoTipoCalculo: string | null;
  objetivoTotal: number | null;
  /** char(1) */
  tipoValor: string;
  descricaoTipoValor: string | null;
  /** char(1) */
  extensaoRanking: string | null;
  observacao: string | null;
  positivacaoAtrelada: number | null;
  valorTotalPremiacao: number | null;
  recebimentoPremiacao: string | null;
  tipoMeta: number;
  descricaoTipoMeta: string | null;
  gatilhoVenda: number | null;
  bitVendedorVenda: boolean | null;
  /** Data do último cálculo (ISO); null = a campanha ainda não tem resultado calculado. */
  ultimoCalculoEm: string | null;
}

/** Uma linha do resultado calculado da campanha (tblCampanhaComercialResultado). */
export interface CampanhaComercialResultadoLinha {
  idCampanhaComercial: number;
  dataCompetencia: string | null;
  descricaoCampanha: string | null;
  /** 1 = Gerente, 2 = Supervisor, 3 = Vendedor, 4 = Grandes Contas, 5 = Pessoa Interna, 6 = Televendas */
  tipoPessoa: number | null;
  idGerente: number | null;
  nomeGerente: string | null;
  idSupervisor: number | null;
  nomeSupervisor: string | null;
  idPessoa: number | null;
  nomeVendedor: string | null;
  objetivo: number | null;
  valorApurado: number | null;
  percentualRealizado: number | null;
  colocacao: string | null;
  premiacaoPontos: number | null;
  premiacaoValor: number | null;
  logCalculo: string | null;
  dataCalculo: string | null;
}

/** Item de um cadastro auxiliar: `valor` é o que se grava na campanha (sempre texto), `descricao` é o que se mostra. */
export interface CampanhaComercialOpcao {
  valor: string;
  descricao: string;
}

export interface CampanhaComercialOpcoes {
  situacoes: CampanhaComercialOpcao[];
  tiposApuracao: CampanhaComercialOpcao[];
  tiposCalculo: CampanhaComercialOpcao[];
  tiposValor: CampanhaComercialOpcao[];
  tiposMeta: CampanhaComercialOpcao[];
}

/** Campos que a grid permite alterar (corpo do PUT api/campanha-comercial/{id}). */
export interface CampanhaComercialUpdate {
  idSituacao: number;
  descricaoCampanha: string;
  /** AAAA-MM-DD */
  dataInicioApuracao: string | null;
  dataFimApuracao: string | null;
  idTipoApuracao: number;
  idTipoCalculo: number;
  objetivoTotal: number | null;
  tipoValor: string;
  extensaoRanking: string | null;
  observacao: string | null;
  positivacaoAtrelada: number | null;
  valorTotalPremiacao: number | null;
  recebimentoPremiacao: string | null;
  tipoMeta: number;
  gatilhoVenda: number | null;
  bitVendedorVenda: boolean | null;
}

/**
 * Linha em edição: tudo como o usuário digita (texto), para o campo poder ficar vazio ou pela metade.
 * Números em pt-BR ("5.140.000,00"), datas em AAAA-MM-DD, selects pelo `valor` da opção.
 */
export interface CampanhaComercialForm {
  idSituacao: string;
  descricaoCampanha: string;
  dataInicioApuracao: string;
  dataFimApuracao: string;
  idTipoApuracao: string;
  idTipoCalculo: string;
  objetivoTotal: string;
  tipoValor: string;
  extensaoRanking: string;
  observacao: string;
  positivacaoAtrelada: string;
  valorTotalPremiacao: string;
  recebimentoPremiacao: string;
  tipoMeta: string;
  gatilhoVenda: string;
  bitVendedorVenda: boolean | null;
}
