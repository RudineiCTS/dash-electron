/** Número em pt-BR com 2 casas ("5.140.000,00"), para preencher campos de valor. */
export function formatarCampoBr(valor: number): string {
  return valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Aceita "5.140.000,00" (pt-BR) e também "5140000.50" (ponto com até 2 casas = decimal). Vazio ou inválido = 0. */
export function paraNumeroBr(valor: string): number {
  const texto = valor.trim();
  const ehPontoDecimal = !texto.includes(",") && /^-?\d+\.\d{1,2}$/.test(texto);
  const normalizado = ehPontoDecimal ? texto : texto.replace(/\./g, "").replace(",", ".");
  const numero = parseFloat(normalizado);
  return isNaN(numero) ? 0 : numero;
}
