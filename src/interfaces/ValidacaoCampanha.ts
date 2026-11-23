/** Uma linha do resultado calculado de uma campanha comercial (tblCampanhaComercialResultado), como a API devolve. */
export interface ResultadoValidacao {
  idCampanha: number;
  /** Último dia do mês de competência (ISO). */
  dataCompetencia: string | null;
  dataInicioApuracao: string | null;
  dataFimApuracao: string | null;
  descricaoCampanha: string | null;
  descricaoTipoCalculo: string | null;
  /** Descrição (Vendedor, Supervisor, Gerente...). */
  tipoPessoa: string | null;
  /** 1 = Gerente, 2 = Supervisor, 3 = Vendedor, 4 = Grandes Contas, 5 = Pessoa Interna, 6 = Televendas */
  tipoPessoaId: number | null;
  idPessoa: number | null;
  nomePessoa: string | null;
  idSupervisor: number | null;
  nomeSupervisor: string | null;
  idGerente: number | null;
  nomeGerente: string | null;
  objetivo: number | null;
  valorApurado: number | null;
  percentualRealizado: number | null;
  colocacao: string | null;
  premiacaoPontos: number | null;
  premiacaoValor: number | null;
  logCalculo: string | null;
  /** ISO */
  dataCalculo: string | null;
}

/** Um pedido/produto considerado na apuração (tblCampanhaComercialRetornoPedido), com nomes de cliente/produto/fabricante. */
export interface PedidoValidacao {
  idPedido: number | null;
  dataFaturamento: string | null;
  idCliente: number | null;
  nomeCliente: string | null;
  idProduto: number | null;
  descricaoProduto: string | null;
  idFabricante: number | null;
  nomeFabricante: string | null;
  idProdutoLinha: number | null;
  idOperacao: number | null;
  idOrigem: number | null;
  quantidade: number | null;
  valorCampanha: number;
  /** Quem fez a venda (pode ser diferente de quem recebeu o crédito, quando há exclusivo). */
  idVendedorVenda: number | null;
  nomeVendedorVenda: string | null;
  creditadoPorExclusivo: boolean;
  /** false = passou nos filtros da campanha, mas não entrou no resultado de ninguém. */
  consideradoNoApurado: boolean;
  dataApuracao: string | null;
}

/** Campanha da competência (agrupada a partir das linhas de resultado). */
export interface CampanhaValidacao {
  idCampanha: number;
  descricao: string;
  dataInicioApuracao: string | null;
  dataFimApuracao: string | null;
  descricaoTipoCalculo: string | null;
  pessoas: number;
}

/** Estado do carregamento dos pedidos de uma pessoa numa campanha. */
export interface PedidosCarregados {
  loading: boolean;
  erro: string;
  pedidos: PedidoValidacao[];
}
