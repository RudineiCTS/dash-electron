import {
  CampanhaComercial,
  CampanhaComercialForm,
  CampanhaComercialUpdate,
} from "../interfaces/CampanhaComercial";
import { formatarCampoBr, paraNumeroBr } from "./numeroBr";

function textoNumero(valor: number | null): string {
  return valor == null ? "" : formatarCampoBr(valor);
}

/** Valor da campanha como o usuário vê e edita na grid. */
export function paraForm(c: CampanhaComercial): CampanhaComercialForm {
  return {
    idSituacao: String(c.idSituacao),
    descricaoCampanha: c.descricaoCampanha,
    dataInicioApuracao: c.dataInicioApuracao?.slice(0, 10) ?? "",
    dataFimApuracao: c.dataFimApuracao?.slice(0, 10) ?? "",
    idTipoApuracao: String(c.idTipoApuracao),
    idTipoCalculo: String(c.idTipoCalculo),
    objetivoTotal: textoNumero(c.objetivoTotal),
    tipoValor: c.tipoValor.trim(),
    extensaoRanking: c.extensaoRanking?.trim() ?? "",
    observacao: c.observacao ?? "",
    positivacaoAtrelada: c.positivacaoAtrelada == null ? "" : String(c.positivacaoAtrelada),
    valorTotalPremiacao: textoNumero(c.valorTotalPremiacao),
    recebimentoPremiacao: c.recebimentoPremiacao ?? "",
    tipoMeta: String(c.tipoMeta),
    gatilhoVenda: textoNumero(c.gatilhoVenda),
    bitVendedorVenda: c.bitVendedorVenda,
  };
}

/** Campo numérico em pt-BR: "5.140.000,00", "5140000,5" ou "5140000.50". */
const NUMERO_VALIDO = /^(\d{1,3}(\.\d{3})+|\d+)(,\d+)?$|^\d+\.\d{1,2}$/;

/** Mantém só o que faz sentido digitar num campo de valor (dígitos, ponto e vírgula). */
export function filtrarDigitacaoNumero(texto: string): string {
  return texto.replace(/[^\d.,]/g, "");
}

function numeroOuNulo(texto: string): number | null {
  const t = texto.trim();
  return t === "" ? null : paraNumeroBr(t);
}

/** Mensagem do primeiro problema da linha, ou null se pode salvar. */
export function validarForm(f: CampanhaComercialForm): string | null {
  if (!f.descricaoCampanha.trim()) return "Informe a descrição da campanha.";
  if (f.descricaoCampanha.trim().length > 200) return "A descrição aceita no máximo 200 caracteres.";
  if (f.recebimentoPremiacao.trim().length > 300) return "O recebimento da premiação aceita no máximo 300 caracteres.";
  if (f.extensaoRanking.trim().length > 1) return "A extensão do ranking aceita apenas 1 caractere.";
  if (f.dataInicioApuracao && f.dataFimApuracao && f.dataInicioApuracao > f.dataFimApuracao) {
    return "O início da apuração não pode ser depois do fim.";
  }
  if (!f.idSituacao || !f.idTipoApuracao || !f.idTipoCalculo || !f.tipoValor || !f.tipoMeta) {
    return "Preencha situação, tipo de apuração, tipo de cálculo, tipo de valor e tipo de meta.";
  }

  const campos: [string, string][] = [
    ["Objetivo total", f.objetivoTotal],
    ["Prêmio total", f.valorTotalPremiacao],
    ["Gatilho de venda", f.gatilhoVenda],
  ];
  for (const [nome, texto] of campos) {
    if (texto.trim() !== "" && !NUMERO_VALIDO.test(texto.trim())) return `${nome}: número inválido.`;
  }
  if (f.positivacaoAtrelada.trim() !== "" && !/^\d+$/.test(f.positivacaoAtrelada.trim())) {
    return "Positivação atrelada: use apenas números inteiros.";
  }
  return null;
}

/** Corpo do PUT. Chame só depois de `validarForm` devolver null. */
export function formParaApi(f: CampanhaComercialForm): CampanhaComercialUpdate {
  return {
    idSituacao: Number(f.idSituacao),
    descricaoCampanha: f.descricaoCampanha.trim(),
    dataInicioApuracao: f.dataInicioApuracao || null,
    dataFimApuracao: f.dataFimApuracao || null,
    idTipoApuracao: Number(f.idTipoApuracao),
    idTipoCalculo: Number(f.idTipoCalculo),
    objetivoTotal: numeroOuNulo(f.objetivoTotal),
    tipoValor: f.tipoValor,
    extensaoRanking: f.extensaoRanking.trim() || null,
    observacao: f.observacao.trim() || null,
    positivacaoAtrelada: f.positivacaoAtrelada.trim() === "" ? null : Number(f.positivacaoAtrelada),
    valorTotalPremiacao: numeroOuNulo(f.valorTotalPremiacao),
    recebimentoPremiacao: f.recebimentoPremiacao.trim() || null,
    tipoMeta: Number(f.tipoMeta),
    gatilhoVenda: numeroOuNulo(f.gatilhoVenda),
    bitVendedorVenda: f.bitVendedorVenda,
  };
}

export function formsIguais(a: CampanhaComercialForm, b: CampanhaComercialForm): boolean {
  return (Object.keys(a) as (keyof CampanhaComercialForm)[]).every((chave) => a[chave] === b[chave]);
}
