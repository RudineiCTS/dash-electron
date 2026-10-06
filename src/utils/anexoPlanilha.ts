import * as XLSX from "xlsx";

export type TipoAnexo = "clients" | "products";
export type TipoValor = "ID" | "EAN" | "CPF/CNPJ" | "DESCONHECIDO";

export interface PerfilColuna {
  aba: string;
  coluna: string;
  cabecalho: string | null;
  valoresNumericos: number;
  menorTamanho: number;
  maiorTamanho: number;
  tipoProvavel: TipoValor;
}

export interface LeituraAnexoPlanilha {
  aba: string | null;
  coluna: string | null;
  cabecalho: string | null;
  tipoValor: TipoValor;
  ambiguo: boolean;
  /** Valores distintos da coluna escolhida, na ordem em que aparecem. */
  valores: string[];
  colunas: PerfilColuna[];
  avisos: string[];
}

interface ColunaScan {
  aba: string;
  indice: number;
  letra: string;
  cabecalho: string | null;
  ultimoTexto: string | null;
  viuNumero: boolean;
  textosAposNumero: number;
  valores: string[];
  tamanhos: Map<number, number>;
}

const MAX_VALORES_POR_COLUNA = 200_000;
const CNPJ = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
const CPF = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
const SO_DIGITOS = /^\d+$/;

export function valoresPorExtenso(n: number): string {
  return `${n} ${n === 1 ? "valor" : "valores"}`;
}

function paraDigitos(valor: unknown): string | null {
  if (typeof valor === "number") {
    if (valor >= 0 && valor < 1e15 && Math.abs(valor - Math.round(valor)) < 1e-9) {
      return String(Math.round(valor));
    }
    return null;
  }
  if (typeof valor !== "string") return null;

  const texto = valor.trim();
  if (SO_DIGITOS.test(texto)) return texto;
  if (CNPJ.test(texto) || CPF.test(texto)) return texto.replace(/\D/g, "");
  return null;
}

function tamanhoTipico(coluna: ColunaScan): number {
  let melhor = 0;
  let contagemMelhor = 0;
  for (const [tamanho, contagem] of coluna.tamanhos) {
    if (contagem > contagemMelhor) {
      melhor = tamanho;
      contagemMelhor = contagem;
    }
  }
  return melhor;
}

/**
 * Até 7 dígitos = ID interno; clientes com 11 a 14 = CPF/CNPJ; produtos com 8 a 14 = EAN.
 * O cabeçalho engana (já houve coluna "IDCLIENTE" com CNPJ e "idproduto" com código de barras),
 * por isso a classificação vem do conteúdo.
 */
export function classificarValores(tipo: TipoAnexo, tamanhoTipicoEmDigitos: number): TipoValor {
  if (tamanhoTipicoEmDigitos >= 1 && tamanhoTipicoEmDigitos <= 7) return "ID";
  if (tipo === "clients" && tamanhoTipicoEmDigitos >= 11 && tamanhoTipicoEmDigitos <= 14) return "CPF/CNPJ";
  if (tipo === "products" && tamanhoTipicoEmDigitos >= 8 && tamanhoTipicoEmDigitos <= 14) return "EAN";
  return "DESCONHECIDO";
}

function escanearAba(nomeAba: string, aba: XLSX.WorkSheet): ColunaScan[] {
  const ref = aba["!ref"];
  if (!ref) return [];

  const primeiraColuna = XLSX.utils.decode_range(ref).s.c;
  const linhas = XLSX.utils.sheet_to_json<unknown[]>(aba, { header: 1, raw: true, defval: null });
  const porColuna = new Map<number, ColunaScan>();

  for (const linha of linhas) {
    for (let i = 0; i < linha.length; i++) {
      const valor = linha[i];
      if (valor === null || valor === undefined || valor === "") continue;

      let scan = porColuna.get(i);
      if (!scan) {
        scan = {
          aba: nomeAba,
          indice: primeiraColuna + i,
          letra: XLSX.utils.encode_col(primeiraColuna + i),
          cabecalho: null,
          ultimoTexto: null,
          viuNumero: false,
          textosAposNumero: 0,
          valores: [],
          tamanhos: new Map(),
        };
        porColuna.set(i, scan);
      }

      const digitos = paraDigitos(valor);
      if (digitos !== null) {
        if (!scan.viuNumero) {
          scan.viuNumero = true;
          scan.cabecalho = scan.ultimoTexto;
        }
        if (scan.valores.length < MAX_VALORES_POR_COLUNA) {
          scan.valores.push(digitos);
          scan.tamanhos.set(digitos.length, (scan.tamanhos.get(digitos.length) ?? 0) + 1);
        }
      } else if (typeof valor === "string") {
        const texto = valor.trim();
        if (!texto) continue;
        scan.ultimoTexto = texto.length > 80 ? texto.slice(0, 80) : texto;
        if (scan.viuNumero) scan.textosAposNumero++;
      }
    }
  }

  return [...porColuna.values()];
}

function correspondeColuna(scan: ColunaScan, pedida: string): boolean {
  const alvo = pedida.trim().toLowerCase();
  return (
    scan.letra.toLowerCase() === alvo ||
    String(scan.indice + 1) === alvo ||
    (scan.cabecalho?.trim().toLowerCase() === alvo)
  );
}

export function lerAnexoPlanilha(
  buffer: ArrayBuffer | Uint8Array,
  tipo: TipoAnexo,
  opcoes: { coluna?: string } = {}
): LeituraAnexoPlanilha {
  const workbook = XLSX.read(buffer, { type: "array" });
  const scans: ColunaScan[] = [];

  workbook.SheetNames.forEach((nome, i) => {
    const oculta = (workbook.Workbook?.Sheets?.[i]?.Hidden ?? 0) > 0;
    if (!oculta) scans.push(...escanearAba(nome, workbook.Sheets[nome]));
  });

  const candidatas = scans.filter((s) => s.valores.length > 0);
  const avisos: string[] = [];

  const colunas: PerfilColuna[] = [...candidatas]
    .sort((a, b) => b.valores.length - a.valores.length)
    .slice(0, 10)
    .map((s) => ({
      aba: s.aba,
      coluna: s.letra,
      cabecalho: s.cabecalho,
      valoresNumericos: s.valores.length,
      menorTamanho: Math.min(...s.tamanhos.keys()),
      maiorTamanho: Math.max(...s.tamanhos.keys()),
      tipoProvavel: classificarValores(tipo, tamanhoTipico(s)),
    }));

  let escolhida: ColunaScan | undefined;
  let ambiguo = false;

  if (opcoes.coluna?.trim()) {
    escolhida = candidatas.find((s) => correspondeColuna(s, opcoes.coluna!));
    if (!escolhida) avisos.push(`Nenhuma coluna numérica corresponde a '${opcoes.coluna}'.`);
  } else {
    const pontuadas = candidatas.map((s) => ({ scan: s, tipo: classificarValores(tipo, tamanhoTipico(s)) }));
    let grupo = pontuadas.filter((x) => x.tipo === "ID").sort((a, b) => b.scan.valores.length - a.scan.valores.length);
    if (grupo.length === 0) {
      grupo = pontuadas
        .filter((x) => x.tipo === "EAN" || x.tipo === "CPF/CNPJ")
        .sort((a, b) => b.scan.valores.length - a.scan.valores.length);
    }

    escolhida = grupo[0]?.scan;
    ambiguo = grupo.length > 1 && grupo[1].scan.valores.length >= grupo[0].scan.valores.length * 0.5;
    if (ambiguo) avisos.push("Mais de uma coluna parece conter IDs; confirme qual usar antes de gerar.");
  }

  if (!escolhida) {
    avisos.push("Não encontrei coluna com valores numéricos na planilha.");
    return { aba: null, coluna: null, cabecalho: null, tipoValor: "DESCONHECIDO", ambiguo: false, valores: [], colunas, avisos };
  }

  const tipoValor = classificarValores(tipo, tamanhoTipico(escolhida));
  if (tipoValor === "EAN") {
    avisos.push("Os valores têm 8 a 14 dígitos: são códigos de barras (EAN), não IDProduto.");
  }
  if (tipoValor === "CPF/CNPJ") {
    avisos.push("Os valores têm 11 a 14 dígitos: são CPF/CNPJ, não IDCliente.");
  }

  const outras = candidatas
    .filter((s) => s !== escolhida)
    .slice(0, 5)
    .map((s) => `'${s.cabecalho ?? s.letra}' (${classificarValores(tipo, tamanhoTipico(s))}, ${valoresPorExtenso(s.valores.length)})`);
  if (outras.length > 0) avisos.push(`Outras colunas numéricas: ${outras.join("; ")}.`);

  if (escolhida.textosAposNumero > 0) {
    avisos.push(`${escolhida.textosAposNumero} célula(s) de texto no meio dos valores foram ignoradas.`);
  }

  const distintos = [...new Set(escolhida.valores)];
  if (distintos.length < escolhida.valores.length) {
    avisos.push(`${escolhida.valores.length - distintos.length} valor(es) repetido(s) removido(s).`);
  }

  return {
    aba: escolhida.aba,
    coluna: escolhida.letra,
    cabecalho: escolhida.cabecalho,
    tipoValor,
    ambiguo,
    valores: distintos,
    colunas,
    avisos,
  };
}
