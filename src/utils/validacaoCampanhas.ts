import { RetornoScript } from "../interfaces/CampanhaFarmaResultado";
import { CampanhaValidacao, PedidoValidacao, ResultadoValidacao } from "../interfaces/ValidacaoCampanha";

/**
 * Tipos de pessoa cujo valor apurado é a soma dos próprios pedidos: 3 = Vendedor, 4 = Grandes Contas, 6 = Televendas.
 * Supervisor, gerente e pessoa interna são somas de outras pessoas, e por isso não têm pedidos próprios.
 */
const TIPOS_COM_PEDIDOS = [3, 4, 6];

export const temDetalhePedidos = (r: ResultadoValidacao) =>
  r.idPessoa != null && r.tipoPessoaId != null && TIPOS_COM_PEDIDOS.includes(r.tipoPessoaId);

/** Campanhas presentes nas linhas de resultado, na ordem em que aparecem (a API já ordena por campanha). */
export function agruparCampanhas(resultados: ResultadoValidacao[]): CampanhaValidacao[] {
  const porId = new Map<number, CampanhaValidacao>();
  for (const r of resultados) {
    const atual = porId.get(r.idCampanha);
    if (atual) atual.pessoas += 1;
    else {
      porId.set(r.idCampanha, {
        idCampanha: r.idCampanha,
        descricao: r.descricaoCampanha ?? `Campanha ${r.idCampanha}`,
        dataInicioApuracao: r.dataInicioApuracao,
        dataFimApuracao: r.dataFimApuracao,
        descricaoTipoCalculo: r.descricaoTipoCalculo,
        pessoas: 1,
      });
    }
  }
  return [...porId.values()];
}

export interface ResumoResultados {
  pessoas: number;
  /** Soma do valor apurado de vendedor, grandes contas e televendas (os demais são somas deles). */
  valorApurado: number;
  /** Soma da premiação de todas as pessoas. */
  premiacao: number;
  /** Data do cálculo mais recente (ISO); null se nenhuma linha tem. */
  ultimoCalculo: string | null;
}

export function resumirResultados(linhas: ResultadoValidacao[]): ResumoResultados {
  let valorApurado = 0;
  let premiacao = 0;
  let ultimoCalculo: string | null = null;
  for (const r of linhas) {
    if (r.tipoPessoaId != null && TIPOS_COM_PEDIDOS.includes(r.tipoPessoaId)) valorApurado += r.valorApurado ?? 0;
    premiacao += r.premiacaoValor ?? 0;
    if (r.dataCalculo && (!ultimoCalculo || r.dataCalculo > ultimoCalculo)) ultimoCalculo = r.dataCalculo;
  }
  return { pessoas: linhas.length, valorApurado, premiacao, ultimoCalculo };
}

/** Tipos de pessoa presentes nas linhas, com a quantidade de cada um (na ordem do código do tipo). */
export function contarPorTipoPessoa(linhas: ResultadoValidacao[]): { tipo: string; quantidade: number }[] {
  const porTipo = new Map<string, { ordem: number; quantidade: number }>();
  for (const r of linhas) {
    const tipo = r.tipoPessoa ?? "Sem tipo";
    const atual = porTipo.get(tipo);
    if (atual) atual.quantidade += 1;
    else porTipo.set(tipo, { ordem: r.tipoPessoaId ?? 99, quantidade: 1 });
  }
  return [...porTipo.entries()].sort(([, a], [, b]) => a.ordem - b.ordem).map(([tipo, v]) => ({ tipo, quantidade: v.quantidade }));
}

export interface ResumoPedidos {
  linhas: number;
  /** Pedidos distintos (um pedido pode ter várias linhas de produto). */
  pedidos: number;
  /** Soma de tudo o que está gravado. */
  total: number;
  /** Soma do que contou no resultado (ConsideradoNoApurado). */
  totalConsiderado: number;
  totalForaDoApurado: number;
  linhasForaDoApurado: number;
  linhasPorExclusivo: number;
}

export function resumirPedidos(pedidos: PedidoValidacao[]): ResumoPedidos {
  const ids = new Set<number>();
  const resumo: ResumoPedidos = {
    linhas: pedidos.length,
    pedidos: 0,
    total: 0,
    totalConsiderado: 0,
    totalForaDoApurado: 0,
    linhasForaDoApurado: 0,
    linhasPorExclusivo: 0,
  };
  for (const p of pedidos) {
    if (p.idPedido != null) ids.add(p.idPedido);
    resumo.total += p.valorCampanha;
    if (p.consideradoNoApurado) resumo.totalConsiderado += p.valorCampanha;
    else {
      resumo.totalForaDoApurado += p.valorCampanha;
      resumo.linhasForaDoApurado += 1;
    }
    if (p.creditadoPorExclusivo) resumo.linhasPorExclusivo += 1;
  }
  resumo.pedidos = ids.size;
  return resumo;
}

/** Diferença abaixo disso é arredondamento (centavo). */
const TOLERANCIA = 0.01;

export interface ConferenciaValor {
  /** Valor apurado no resultado menos a soma dos pedidos considerados. */
  diferenca: number;
  confere: boolean;
}

export function conferirValor(valorApurado: number | null, totalConsiderado: number): ConferenciaValor {
  const diferenca = (valorApurado ?? 0) - totalConsiderado;
  return { diferenca, confere: Math.abs(diferenca) <= TOLERANCIA };
}

/** Como a campanha paga: em dinheiro (PremiacaoValor) ou em pontos (PremiacaoPontos). */
export type TipoPremio = "valor" | "pontos";

/**
 * Sugere o tipo de prêmio olhando o que a campanha calculou: só pontos preenchidos = pontos; qualquer outro caso
 * (só valor, os dois ou nenhum) = dinheiro. A tela deixa o usuário trocar.
 */
export function detectarTipoPremio(linhas: ResultadoValidacao[]): TipoPremio {
  const soma = (campo: "premiacaoPontos" | "premiacaoValor") => linhas.reduce((s, r) => s + Math.abs(r[campo] ?? 0), 0);
  return soma("premiacaoPontos") > 0 && soma("premiacaoValor") === 0 ? "pontos" : "valor";
}

/** Tipos de pessoa presentes nas linhas (código e quantidade), na ordem do código. */
export function tiposPresentes(linhas: ResultadoValidacao[]): { id: number; quantidade: number }[] {
  const porId = new Map<number, number>();
  for (const r of linhas) {
    if (r.tipoPessoaId != null) porId.set(r.tipoPessoaId, (porId.get(r.tipoPessoaId) ?? 0) + 1);
  }
  return [...porId.entries()].sort(([a], [b]) => a - b).map(([id, quantidade]) => ({ id, quantidade }));
}

/**
 * Resultado da campanha no formato que a conferência com planilha espera. O "prêmio" é o valor ou os pontos,
 * conforme `tipoPremio`. Linhas sem ID de pessoa ficam de fora (não dá para casar com a planilha).
 */
export function montarRetornoSistema(linhas: ResultadoValidacao[], tipoPremio: TipoPremio): RetornoScript {
  return {
    executadoEm: linhas.find((r) => r.dataCalculo)?.dataCalculo ?? "",
    linhas: linhas
      .filter((r) => r.idPessoa != null)
      .map((r) => ({
        tipoPessoa: r.tipoPessoaId ?? 0,
        idPessoa: r.idPessoa as number,
        nomePessoa: r.nomePessoa ?? "",
        idSupervisor: r.idSupervisor ?? 0,
        nomeSupervisor: r.nomeSupervisor ?? "",
        idGerente: r.idGerente ?? 0,
        nomeGerente: r.nomeGerente ?? "",
        objetivo: r.objetivo ?? 0,
        valorApurado: r.valorApurado ?? 0,
        premio: (tipoPremio === "pontos" ? r.premiacaoPontos : r.premiacaoValor) ?? 0,
      })),
  };
}

/** Origem dos pedidos (IDOrigem), como nos scripts das campanhas; ID desconhecido aparece como "Origem N". */
const ROTULO_ORIGEM: Record<number, string> = {
  1: "Televendas",
  2: "Internet",
  3: "OL",
  4: "Tablet",
  7: "CPD",
  8: "PBM",
};

export const rotuloOrigem = (id: number | null) => (id == null ? "—" : (ROTULO_ORIGEM[id] ?? `Origem ${id}`));
