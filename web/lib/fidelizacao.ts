import { api } from '@shared/services/api'

/** Período de apuração (GET /api/fidelizacao/periodos). */
export interface FidelizacaoPeriodo {
  idPeriodo: number
  dataInicio: string
  dataFim: string
}

/** Uma pessoa em um KPI no período (GET /api/fidelizacao/resultado). */
export interface FidelizacaoLinha {
  idPessoa: number
  /** Meta da pessoa no período: com ela abre os clientes do KPI. */
  idMeta: number | null
  pessoa: string | null
  idSupervisor: number | null
  tipoPessoa: string | null
  idKpi: number | null
  idFormulaCalculo: number | null
  /** KPI de Hits: clientes e produtos distintos da conta (Hits = clientes x produtos); 0 se não houver. */
  hitsClientes: number
  hitsProdutos: number
  /** Como o KPI abre os clientes (definido pela fórmula de cálculo do KPI); null = sem abertura. */
  tipoDetalhe: 'valor' | 'cobertura' | 'hits' | null
  codigoKpi: string | null
  nomeKpi: string | null
  descricaoKpi: string | null
  valorPremio: number
  valorApurado: number
  valorMeta: number
  /** Percentual realizado (100 = meta batida). */
  realizado: number
  dataCalculo: string | null
}

export async function getFidelizacaoPeriodos(signal?: AbortSignal): Promise<FidelizacaoPeriodo[]> {
  const response = await api.get<FidelizacaoPeriodo[]>('fidelizacao/periodos', { params: { quantidade: 12 }, signal })
  return response.data
}

/** `idPessoa`: só o resultado dessa pessoa; `null` = do time todo (visão do gestor). */
export async function getFidelizacaoResultado(
  idPeriodo: number,
  idPessoa: number | null,
  signal?: AbortSignal,
): Promise<FidelizacaoLinha[]> {
  const response = await api.get<FidelizacaoLinha[]>('fidelizacao/resultado', {
    params: { idPeriodo, ...(idPessoa ? { idPessoa } : {}) },
    signal,
  })
  return response.data
}

/** Cliente que compõe um KPI de valor (Loja Virtual / Setor). */
export interface FidelizacaoClienteValor {
  idPessoaCliente: number
  nomeCliente: string | null
  valorVenda: number
  valorVendaBees: number
  valorTotal: number
}

/** Cliente que compõe um KPI de Hits, com quantos produtos distintos comprou. */
export interface FidelizacaoClienteHits {
  idPessoaCliente: number
  nomeCliente: string | null
  quantidadeProdutos: number
  valorFaturado: number
}

/** Abertura de um KPI (GET /api/fidelizacao/clientes). */
export interface FidelizacaoDetalhe {
  /** "valor" (Loja Virtual / Setor), "cobertura" (clientes positivados), "hits" ou "nenhum". */
  tipo: 'valor' | 'cobertura' | 'hits' | 'nenhum'
  valores: FidelizacaoClienteValor[]
  hits: FidelizacaoClienteHits[]
}

export interface FidelizacaoProdutoHits {
  idProduto: number
  descProduto: string | null
  valorFaturado: number
}

export async function getFidelizacaoClientes(idMeta: number, idKpi: number, signal?: AbortSignal): Promise<FidelizacaoDetalhe> {
  const response = await api.get<FidelizacaoDetalhe>('fidelizacao/clientes', { params: { idMeta, idKpi }, signal })
  return response.data
}

export async function getFidelizacaoProdutos(
  idMeta: number,
  idKpi: number,
  idPessoaCliente: number,
  signal?: AbortSignal,
): Promise<FidelizacaoProdutoHits[]> {
  const response = await api.get<FidelizacaoProdutoHits[]>('fidelizacao/produtos', { params: { idMeta, idKpi, idPessoaCliente }, signal })
  return response.data
}

/** Cliente da carteira de uma pessoa no período (GET /api/fidelizacao/carteira). */
export interface FidelizacaoCarteiraCliente {
  idPessoaCliente: number
  nomeCliente: string | null
  /** Data de cadastro (yyyy-MM-dd, texto). */
  dataCadastroCliente: string | null
  limiteDisponivel: number
  telefone: string | null
  telefone2: string | null
  /** "LOJA VIRTUAL" ou "SETOR" (pelo gerente atual do cliente). */
  tipoCarteira: string
  /** Vendas do cliente nos últimos 3 meses (pedidos faturados e com devolução parcial, de qualquer operador). */
  vendas3Meses: number
  /** Aparece nos clientes calculados dos KPIs da pessoa no período. */
  comCompra: boolean
}

export async function getFidelizacaoCarteira(
  idPeriodo: number,
  idPessoa: number,
  signal?: AbortSignal,
): Promise<FidelizacaoCarteiraCliente[]> {
  const response = await api.get<FidelizacaoCarteiraCliente[]>('fidelizacao/carteira', { params: { idPeriodo, idPessoa }, signal })
  return response.data
}

/** Pedido não faturado, excluído ou com devolução (GET /api/fidelizacao/pedidos-nao-faturados). */
export interface FidelizacaoPedidoNaoFaturado {
  idPedido: number
  idPrePedido: number | null
  idCliente: number
  nomeCliente: string | null
  /** CARTEIRA, DIGITOU ou AMBOS. */
  origem: string
  /** "LOJA VIRTUAL" ou "SETOR". */
  tipoCarteira: string
  origemDoPedido: string | null
  dataPedido: string
  idSituacao: number
  situacao: string
  dataSituacao: string | null
  /** Valor total da nota (na devolução parcial, não é só o valor devolvido). */
  valorTotal: number
}

export interface FidelizacaoPedidosNaoFaturados {
  /** Período que a tabela guarda (um só: o da última carga). Null se nunca foi carregada. */
  idPeriodo: number | null
  /** Início e fim do período que a tabela guarda. */
  periodoInicio: string | null
  periodoFim: string | null
  geradoEm: string | null
  itens: FidelizacaoPedidoNaoFaturado[]
}

export async function getFidelizacaoPedidosNaoFaturados(idPessoa: number, signal?: AbortSignal): Promise<FidelizacaoPedidosNaoFaturados> {
  const response = await api.get<FidelizacaoPedidosNaoFaturados>('fidelizacao/pedidos-nao-faturados', { params: { idPessoa }, signal })
  return response.data
}

/** Faixa de premiação de um KPI (GET /api/fidelizacao/faixas). Início e fim são % da meta; o prêmio é em R$. */
export interface FidelizacaoFaixa {
  idKpi: number
  valorInicio: number
  valorFim: number | null
  valorPremio: number
}

export async function getFidelizacaoFaixas(idPeriodo: number, signal?: AbortSignal): Promise<FidelizacaoFaixa[]> {
  const response = await api.get<FidelizacaoFaixa[]>('fidelizacao/faixas', { params: { idPeriodo }, signal })
  return response.data
}

/** Produto sugerido à operadora para somar Hits (GET /api/fidelizacao/hits-sugestoes). */
export interface FidelizacaoHitsSugestao {
  idProduto: number
  descProduto: string | null
  /** 1 = o produto que mais clientes da Loja Virtual compram. */
  posicao: number
  /** Clientes da Loja Virtual (empresa toda) que compraram o produto nos últimos 3 meses. */
  clientesDistintos: number
  /** Estoque disponível no momento da carga. */
  estoque: number
}

/** Estoque do produto em uma filial e tipo (GET /api/fidelizacao/hits-sugestoes/{idProduto}/estoque). */
export interface FidelizacaoHitsEstoque {
  idFilial: number
  filial: string | null
  idTipo: number
  tipo: string | null
  quantidade: number
  /** Entra no número de estoque mostrado na lista (tipo Normal, Matriz e Cajamar). */
  contaNoTotal: boolean
}

/** Cliente da carteira que ainda não comprou o produto (GET /api/fidelizacao/hits-sugestoes/{idProduto}/clientes). */
export interface FidelizacaoHitsClienteSemCompra {
  idPessoaCliente: number
  nomeCliente: string | null
  telefone: string | null
  telefone2: string | null
  /** Tamanho da carteira (Loja Virtual) da operadora. */
  totalCarteira: number
}

export async function getFidelizacaoHitsEstoque(idProduto: number, signal?: AbortSignal): Promise<FidelizacaoHitsEstoque[]> {
  const response = await api.get<FidelizacaoHitsEstoque[]>(`fidelizacao/hits-sugestoes/${idProduto}/estoque`, { signal })
  return response.data
}

export async function getFidelizacaoHitsClientesSemCompra(
  idPessoa: number,
  idProduto: number,
  signal?: AbortSignal,
): Promise<FidelizacaoHitsClienteSemCompra[]> {
  const response = await api.get<FidelizacaoHitsClienteSemCompra[]>(`fidelizacao/hits-sugestoes/${idProduto}/clientes`, { params: { idPessoa }, signal })
  return response.data
}

export interface FidelizacaoHitsSugestoes {
  /** Dia em que a lista foi calculada; null se a carga ainda não rodou para a pessoa. */
  dataReferencia: string | null
  geradoEm: string | null
  itens: FidelizacaoHitsSugestao[]
}

export async function getFidelizacaoHitsSugestoes(idPessoa: number, signal?: AbortSignal): Promise<FidelizacaoHitsSugestoes> {
  const response = await api.get<FidelizacaoHitsSugestoes>('fidelizacao/hits-sugestoes', { params: { idPessoa }, signal })
  return response.data
}
