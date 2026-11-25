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
