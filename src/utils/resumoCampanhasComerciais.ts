import dayjs from "dayjs";
import { CampanhaComercial } from "../interfaces/CampanhaComercial";

export type TipoSituacao = "cancelada" | "calculando" | "outra";

/** As situações vêm do cadastro (tblCampanhaComercialPeriodoCompetenciaSituacao); aqui só se reconhece pelo texto. */
export function tipoDaSituacao(descricao: string | null | undefined): TipoSituacao {
  const d = (descricao ?? "").toLowerCase();
  if (d.includes("cancel")) return "cancelada";
  // só "Calculando": "Calculada" é outra situação (já apurada)
  if (d.includes("calculando")) return "calculando";
  return "outra";
}

/** Texto da situação exibido na tela: "Calculando" (como vem do cadastro) aparece como "Calculo Disp."; as demais ficam como estão. */
export function rotuloSituacao(descricao: string | null | undefined): string {
  if (tipoDaSituacao(descricao) === "calculando") return "Calculo Disp.";
  return descricao ?? "—";
}

/**
 * Situações (IDCampanhaComercialPeriodoCompetenciaSituacao) que a procedure uspUsuCalculaCampanhaComercial aceita:
 * 1 = Aberta e 3 = Calculando. Qualquer outra é ignorada por ela, então a tela nem deixa selecionar.
 */
const SITUACOES_CALCULAVEIS = [1, 3];

export const podeCalcular = (c: CampanhaComercial) => SITUACOES_CALCULAVEIS.includes(c.idSituacao);

export const ehCancelada = (c: CampanhaComercial) => tipoDaSituacao(c.descricaoSituacao) === "cancelada";

export interface ResumoCampanhas {
  total: number;
  ativas: number;
  canceladas: number;
  /** Soma do objetivo total das campanhas não canceladas. */
  objetivoAtivas: number;
  emCalculo: number;
}

export function resumirCampanhas(campanhas: CampanhaComercial[]): ResumoCampanhas {
  const ativas = campanhas.filter((c) => !ehCancelada(c));
  return {
    total: campanhas.length,
    ativas: ativas.length,
    canceladas: campanhas.length - ativas.length,
    objetivoAtivas: ativas.reduce((soma, c) => soma + (c.objetivoTotal ?? 0), 0),
    emCalculo: campanhas.filter((c) => tipoDaSituacao(c.descricaoSituacao) === "calculando").length,
  };
}

/** Situações presentes nas campanhas, com a quantidade de cada uma (na ordem do cadastro). */
export function contarPorSituacao(campanhas: CampanhaComercial[]): { situacao: string; quantidade: number }[] {
  const porId = new Map<number, { situacao: string; quantidade: number }>();
  for (const c of campanhas) {
    const atual = porId.get(c.idSituacao);
    if (atual) atual.quantidade += 1;
    else porId.set(c.idSituacao, { situacao: c.descricaoSituacao ?? `Situação ${c.idSituacao}`, quantidade: 1 });
  }
  return [...porId.entries()].sort(([a], [b]) => a - b).map(([, v]) => v);
}

/** Período como "21/09 → 30/11" e "71 dias" (inclusive os dois extremos); null quando a campanha não tem datas. */
export function descreverPeriodo(c: CampanhaComercial): { intervalo: string; dias: string } | null {
  if (!c.dataInicioApuracao || !c.dataFimApuracao) return null;
  const inicio = dayjs(c.dataInicioApuracao);
  const fim = dayjs(c.dataFimApuracao);
  const dias = fim.startOf("day").diff(inicio.startOf("day"), "day") + 1;
  return {
    intervalo: `${inicio.format("DD/MM")} → ${fim.format("DD/MM")}`,
    dias: `${dias} ${dias === 1 ? "dia" : "dias"}`,
  };
}

/** "7 dias para o fim do período", "Último dia do período" ou "Período encerrado". */
export function descreverEncerramento(dataFim: string, hoje = dayjs()): string {
  const dias = dayjs(dataFim).startOf("day").diff(hoje.startOf("day"), "day");
  if (dias < 0) return "Período encerrado";
  if (dias === 0) return "Último dia do período";
  return `${dias} ${dias === 1 ? "dia" : "dias"} para o fim do período`;
}

/** R$ sem centavos, para os cards ("R$ 7.110.000"). */
export function formatarReaisInteiros(valor: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(valor);
}
