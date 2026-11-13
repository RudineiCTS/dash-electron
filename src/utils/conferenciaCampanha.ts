/**
 * Conferência do retorno da query de apuração (lado do sistema) com outra base em Excel (lado da planilha).
 * Regras (definidas com o usuário): vendedor casa pelo ID; supervisor e gerente casam pelo nome.
 * A base pode vir em abas por papel (VENDEDOR, SUPERVISOR, GERENTE) e pode não trazer tudo (prêmio, gerente,
 * outras pessoas): o que não foi informado conta como 0 e a validação devolve avisos para a tela mostrar.
 * Funções puras: nada aqui depende de tela.
 */

export interface PessoaSistema {
  /** 1 gerente, 2 supervisor, 3/4/5/6 vendedor, grandes contas, pessoa interna, televendas */
  tipoPessoa: number;
  idPessoa: number;
  nome: string;
  valor: number;
  premio: number;
}

/** Papel da aba da base: define contra quem o nome ou o ID é conferido. "misto" = qualquer pessoa (aba única). */
export type PapelAba = "vendedor" | "supervisor" | "gerente" | "misto";

export const ROTULO_PAPEL: Record<PapelAba, string> = {
  vendedor: "Vendedores",
  supervisor: "Supervisores",
  gerente: "Gerentes",
  misto: "Todas as pessoas",
};

const ROTULO_PAPEL_SINGULAR: Record<PapelAba, string> = {
  vendedor: "vendedor",
  supervisor: "supervisor",
  gerente: "gerente",
  misto: "pessoa",
};

export interface LinhaBase {
  /** Aba de onde veio e número da linha na planilha (1 = primeira linha), para apontar a origem nas observações. */
  aba: string;
  papel: PapelAba;
  linhaNaPlanilha: number;
  id: number | null;
  nome: string;
  valor: number | null;
  premio: number | null;
}

export type StatusConferencia = "ok" | "divergente" | "so_sistema" | "so_planilha" | "ambiguo";

export interface ResultadoConferencia {
  tipoPessoa: number | null;
  idPessoa: number | null;
  nome: string;
  valorSistema: number | null;
  valorBase: number | null;
  difValor: number | null;
  premioSistema: number | null;
  premioBase: number | null;
  difPremio: number | null;
  status: StatusConferencia;
  /** Como casou (ID ou nome) e avisos (linhas repetidas, nome ambíguo...). */
  observacao: string;
  /** Zerado de um lado só e ausente do outro: conta como OK, mas pode ser ocultado. */
  zeradaForaDaBase: boolean;
}

export interface OpcoesConferencia {
  /** Diferença máxima aceita (em R$) para considerar os valores iguais. */
  tolerancia: number;
}

export interface SaidaConferencia {
  resultados: ResultadoConferencia[];
  avisos: string[];
}

export interface MapeamentoColunas {
  /** Índice (0-based) da coluna na planilha; -1 = não usar. */
  id: number;
  nome: number;
  valor: number;
  premio: number;
}

export const SEM_COLUNA = -1;

const TIPOS_VENDEDOR = [3, 4, 5, 6];

function papelDoTipo(tipo: number): PapelAba {
  if (tipo === 1) return "gerente";
  if (tipo === 2) return "supervisor";
  return "vendedor";
}

function tipoCombinaComPapel(tipo: number, papel: PapelAba): boolean {
  if (papel === "misto") return true;
  if (papel === "gerente") return tipo === 1;
  if (papel === "supervisor") return tipo === 2;
  return TIPOS_VENDEDOR.includes(tipo);
}

/** Maiúsculas, sem acento, sem pontuação e com espaços únicos: "José  da Silva." -> "JOSE DA SILVA". */
export function normalizarNome(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, " ")
    .trim();
}

/** Nome para casar: igual a normalizarNome, mas ignora o que vem entre parênteses ("MICHELLI COSTA (LOJA VIRTUAL)"). */
export function nomeParaCasar(texto: string): string {
  return normalizarNome(texto.replace(/\([^)]*\)/g, " "));
}

/**
 * Converte o valor de uma célula em número. Aceita número do Excel, "1.234,56", "R$ 1.234,56", "-1.234,56",
 * "(1.234,56)" e "1234.56". Vazio ou texto que não é número devolve null.
 */
export function paraNumero(valor: unknown): number | null {
  if (valor === null || valor === undefined || valor === "") return null;
  if (typeof valor === "number") return Number.isFinite(valor) ? valor : null;
  if (typeof valor !== "string") return null;

  let texto = valor.trim().replace(/\s+/g, "").replace(/^R\$/i, "");
  if (!texto) return null;

  let negativo = false;
  if (/^\(.*\)$/.test(texto)) {
    negativo = true;
    texto = texto.slice(1, -1);
  }
  if (texto.startsWith("-")) {
    negativo = !negativo;
    texto = texto.slice(1);
  }

  if (!/^[\d.,]+$/.test(texto)) return null;

  let normalizado: string;
  if (texto.includes(",")) {
    // pt-BR: ponto é milhar, vírgula é decimal
    normalizado = texto.replace(/\./g, "").replace(",", ".");
  } else if (/^\d{1,3}(\.\d{3})+$/.test(texto)) {
    // "1.234" ou "1.234.567": milhar
    normalizado = texto.replace(/\./g, "");
  } else {
    normalizado = texto; // "1234.56": ponto decimal
  }

  const numero = Number(normalizado);
  if (!Number.isFinite(numero)) return null;
  return negativo ? -numero : numero;
}

/** ID inteiro da célula (aceita 1234, "1234", "1234.0"); outra coisa devolve null. */
export function paraId(valor: unknown): number | null {
  if (valor === null || valor === undefined || valor === "") return null;
  if (typeof valor === "number") return Number.isInteger(valor) ? valor : null;
  if (typeof valor !== "string") return null;
  const texto = valor.trim().replace(/\.0+$/, "");
  return /^\d+$/.test(texto) ? Number(texto) : null;
}

/** Sugere as colunas da base pelo texto do cabeçalho. */
export function sugerirColunas(cabecalhos: string[]): MapeamentoColunas {
  const normalizados = cabecalhos.map((c) => normalizarNome(c ?? ""));
  const achar = (...criterios: RegExp[]): number => {
    for (const criterio of criterios) {
      const indice = normalizados.findIndex((c) => c && criterio.test(c));
      if (indice >= 0) return indice;
    }
    return SEM_COLUNA;
  };

  // "IDVEND" (sem espaço) e "ID VENDEDOR" valem; "REALIZADO GENOMMA S O" e "TOTAL VENDIDO" valem como valor
  const id = achar(/^(ID|COD|CODIGO|MATRICULA|CHAPA|RCA)( .*)?$/, /\b(ID|CODIGO|MATRICULA)\b/, /^ID[A-Z]+$/);
  let nome = achar(
    /^(NOME|COLABORADOR|PESSOA|VENDEDOR|FUNCIONARIO|REPRESENTANTE|SUPERVISOR|GERENTE)( .*)?$/,
    /\bNOME\b/
  );
  if (nome === id) nome = SEM_COLUNA;

  const premio = achar(/\bPREMIO\b/, /\bPREMIACAO\b/);
  let valor = achar(
    /\b(VALOR )?APURADO\b/,
    /\bREALIZADO\b/,
    /^(VALOR|VENDA|VENDAS|TOTAL|RESULTADO)( .*)?$/
  );
  if (valor === premio) valor = SEM_COLUNA;

  return { id, nome, valor, premio };
}

/** Deduz o papel da aba pelo nome dela (VENDEDOR, SUPERVISOR, GERENTE); sem pista, "misto". */
export function detectarPapel(nomeAba: string): PapelAba {
  const nome = normalizarNome(nomeAba);
  if (/\bSUPERVIS/.test(nome)) return "supervisor";
  if (/\bGERENT/.test(nome)) return "gerente";
  if (/\b(VENDEDOR|VENDEDORES|VEND|RCA|REPRESENTANTE)\b/.test(nome)) return "vendedor";
  return "misto";
}

/** Linha (0-based) que parece o cabeçalho: a primeira com 2 ou mais textos que não são números. */
export function detectarLinhaCabecalho(linhas: unknown[][]): number {
  for (let i = 0; i < Math.min(linhas.length, 30); i++) {
    const textos = (linhas[i] ?? []).filter(
      (c) => typeof c === "string" && c.trim() !== "" && paraNumero(c) === null
    );
    if (textos.length >= 2) return i;
  }
  return 0;
}

/** Linhas de dados da aba (depois do cabeçalho) já convertidas, ignorando linhas totalmente vazias. */
export function lerBase(
  linhas: unknown[][],
  linhaCabecalho: number,
  mapa: MapeamentoColunas,
  aba = "",
  papel: PapelAba = "misto"
): LinhaBase[] {
  const base: LinhaBase[] = [];

  for (let i = linhaCabecalho + 1; i < linhas.length; i++) {
    const linha = linhas[i] ?? [];
    const celula = (indice: number) => (indice >= 0 ? linha[indice] : undefined);

    const id = paraId(celula(mapa.id));
    const nome = String(celula(mapa.nome) ?? "").trim();
    const valor = paraNumero(celula(mapa.valor));
    const premio = paraNumero(celula(mapa.premio));

    if (id === null && !nome && valor === null && premio === null) continue;
    base.push({ aba, papel, linhaNaPlanilha: i + 1, id, nome, valor, premio });
  }

  return base;
}

const arredondar = (valor: number) => Math.round(valor * 100) / 100;

interface Acumulado {
  valor: number;
  premio: number;
  linhas: string[];
  porNome: boolean;
}

function origem(linha: LinhaBase): string {
  return linha.aba ? `${linha.aba}, linha ${linha.linhaNaPlanilha}` : `linha ${linha.linhaNaPlanilha}`;
}

/**
 * Casa cada linha da base com uma pessoa do sistema e compara valor e prêmio.
 * - aba de vendedores: casa pelo ID com vendedor/grandes contas/pessoa interna/televendas;
 * - aba de supervisores e de gerentes: casa pelo nome (ou pelo ID, se tiver) com supervisor e gerente;
 * - aba "misto": ID com qualquer pessoa; sem ID, nome contra supervisores e gerentes;
 * - o que não foi informado na base conta como 0: pessoa do sistema sem linha vira "só no sistema" com base 0,
 *   e prêmio vazio na base vale 0.
 */
export function conferir(sistema: PessoaSistema[], base: LinhaBase[], opcoes: OpcoesConferencia): SaidaConferencia {
  const avisos: string[] = [];
  const resultados: ResultadoConferencia[] = [];

  const porId = new Map<number, PessoaSistema>();
  for (const pessoa of sistema) {
    if (porId.has(pessoa.idPessoa)) {
      avisos.push(`ID ${pessoa.idPessoa} aparece mais de uma vez no retorno; só a primeira linha foi considerada.`);
      continue;
    }
    porId.set(pessoa.idPessoa, pessoa);
  }

  const porNome = new Map<string, PessoaSistema[]>();
  for (const pessoa of porId.values()) {
    const chave = nomeParaCasar(pessoa.nome);
    if (!chave) continue;
    porNome.set(chave, [...(porNome.get(chave) ?? []), pessoa]);
  }

  const acumulados = new Map<number, Acumulado>();

  const semCasamento = (linha: LinhaBase, status: "so_planilha" | "ambiguo", observacao: string) => {
    const zerada = status === "so_planilha" && (linha.valor ?? 0) === 0 && (linha.premio ?? 0) === 0;
    resultados.push({
      tipoPessoa: null,
      idPessoa: linha.id,
      nome: linha.nome,
      valorSistema: null,
      valorBase: linha.valor,
      difValor: null,
      premioSistema: null,
      premioBase: linha.premio,
      difPremio: null,
      status: zerada ? "ok" : status,
      observacao: zerada ? `${origem(linha)}: zerada e fora do retorno.` : observacao,
      zeradaForaDaBase: zerada,
    });
  };

  for (const linha of base) {
    const compativel = (p: PessoaSistema) => tipoCombinaComPapel(p.tipoPessoa, linha.papel);

    let alvo: PessoaSistema | undefined;
    let casouPorNome = false;
    let motivoRecusa = "";

    if (linha.id !== null) {
      const pessoa = porId.get(linha.id);
      if (pessoa && compativel(pessoa)) alvo = pessoa;
      else if (pessoa) {
        motivoRecusa = ` O ID ${linha.id} é ${ROTULO_PAPEL_SINGULAR[papelDoTipo(pessoa.tipoPessoa)]} no sistema (${pessoa.nome}); confira na aba correspondente.`;
      }
    }

    // sem ID, ou ID que não casou: nome (supervisores e gerentes; nas abas de vendedor só se o ID não existir)
    const podeCasarPorNome = linha.papel !== "vendedor" || linha.id === null;
    if (!alvo && !motivoRecusa && linha.nome && podeCasarPorNome) {
      const candidatos = (porNome.get(nomeParaCasar(linha.nome)) ?? []).filter(compativel);

      if (candidatos.length > 1) {
        semCasamento(
          linha,
          "ambiguo",
          `${origem(linha)}: o nome bate com mais de uma pessoa do sistema (${candidatos.map((c) => c.idPessoa).join(", ")}).`
        );
        continue;
      }

      if (candidatos.length === 1) {
        alvo = candidatos[0];
        casouPorNome = true;
      }
    }

    if (!alvo) {
      semCasamento(
        linha,
        "so_planilha",
        linha.id === null && linha.nome
          ? `${origem(linha)}: sem ID e nome não encontrado no retorno.${motivoRecusa}`
          : `${origem(linha)}: não encontrada no retorno.${motivoRecusa}`
      );
      continue;
    }

    const acumulado = acumulados.get(alvo.idPessoa) ?? { valor: 0, premio: 0, linhas: [], porNome: casouPorNome };
    acumulado.valor += linha.valor ?? 0;
    acumulado.premio += linha.premio ?? 0;
    acumulado.linhas.push(origem(linha));
    acumulados.set(alvo.idPessoa, acumulado);
  }

  for (const pessoa of porId.values()) {
    const acumulado = acumulados.get(pessoa.idPessoa);

    if (!acumulado) {
      // sem informação na base: conta como 0
      const zerada = pessoa.valor === 0 && pessoa.premio === 0;
      resultados.push({
        tipoPessoa: pessoa.tipoPessoa,
        idPessoa: pessoa.idPessoa,
        nome: pessoa.nome,
        valorSistema: pessoa.valor,
        valorBase: 0,
        difValor: arredondar(0 - pessoa.valor),
        premioSistema: pessoa.premio,
        premioBase: 0,
        difPremio: arredondar(0 - pessoa.premio),
        status: zerada ? "ok" : "so_sistema",
        observacao: zerada ? "Zerada no sistema e fora da base." : "Sem informação na base: considerado 0.",
        zeradaForaDaBase: zerada,
      });
      continue;
    }

    const difValor = arredondar(acumulado.valor - pessoa.valor);
    const difPremio = arredondar(acumulado.premio - pessoa.premio);
    const divergente = Math.abs(difValor) > opcoes.tolerancia || Math.abs(difPremio) > opcoes.tolerancia;

    const notas: string[] = [acumulado.porNome ? "Casou pelo nome." : "Casou pelo ID."];
    if (acumulado.linhas.length > 1) {
      notas.push(`${acumulado.linhas.length} linhas da base somadas (${acumulado.linhas.join("; ")}).`);
    }

    resultados.push({
      tipoPessoa: pessoa.tipoPessoa,
      idPessoa: pessoa.idPessoa,
      nome: pessoa.nome,
      valorSistema: pessoa.valor,
      valorBase: arredondar(acumulado.valor),
      difValor,
      premioSistema: pessoa.premio,
      premioBase: arredondar(acumulado.premio),
      difPremio,
      status: divergente ? "divergente" : "ok",
      observacao: notas.join(" "),
      zeradaForaDaBase: false,
    });
  }

  const repetidas = [...acumulados.values()].filter((a) => a.linhas.length > 1).length;
  if (repetidas > 0) avisos.push(`${repetidas} pessoa(s) com mais de uma linha na base: os valores foram somados.`);

  return { resultados, avisos };
}

/** O que a tela sabe de cada aba da base, para a validação saber o que veio e o que faltou. */
export interface InfoAba {
  nome: string;
  papel: PapelAba;
  linhasDeDados: number;
  temColunaValor: boolean;
  temColunaPremio: boolean;
  /** Quantas linhas da aba trazem prêmio preenchido. */
  linhasComPremio: number;
}

function listarNomes(nomes: string[], limite = 5): string {
  const mostrados = nomes.slice(0, limite).join(", ");
  return nomes.length > limite ? `${mostrados} e mais ${nomes.length - limite}` : mostrados;
}

/**
 * Avisos sobre o que a base NÃO trouxe. Nada disso impede a conferência: o que falta conta como 0.
 * Devolve textos prontos para a tela mostrar num aviso.
 */
export function validarBase(sistema: PessoaSistema[], abas: InfoAba[], resultados: ResultadoConferencia[]): string[] {
  const avisos: string[] = [];
  const usadas = abas.filter((a) => a.linhasDeDados > 0 && a.temColunaValor);

  for (const aba of abas) {
    if (aba.linhasDeDados === 0) {
      const doPapel = sistema.filter((p) => aba.papel !== "misto" && papelDoTipo(p.tipoPessoa) === aba.papel);
      const comResultado = doPapel.filter((p) => p.valor !== 0 || p.premio !== 0);
      const detalhe =
        comResultado.length > 0
          ? ` (${comResultado.length} com resultado no sistema: ${listarNomes(comResultado.map((p) => p.nome))})`
          : "";
      avisos.push(`A aba "${aba.nome}" não tem dados: ${descricaoDoQueFalta(aba.papel)} considerados 0${detalhe}.`);
    } else if (!aba.temColunaValor) {
      avisos.push(`A aba "${aba.nome}" não tem coluna de valor identificada: ela foi ignorada.`);
    }
  }

  for (const aba of usadas) {
    if (!aba.temColunaPremio) {
      avisos.push(`A aba "${aba.nome}" não tem coluna de prêmio: prêmio considerado 0 para ${ROTULO_PAPEL[aba.papel].toLowerCase()}.`);
    } else if (aba.linhasComPremio === 0) {
      avisos.push(`A aba "${aba.nome}" tem a coluna de prêmio vazia: prêmio considerado 0 para ${ROTULO_PAPEL[aba.papel].toLowerCase()}.`);
    }
  }

  // papéis que existem no retorno, mas não têm nenhuma aba com dados na base
  const temAba = (papel: PapelAba) => usadas.some((a) => a.papel === papel || a.papel === "misto");
  const papeisNoSistema = new Set(sistema.map((p) => papelDoTipo(p.tipoPessoa)));
  for (const papel of ["gerente", "supervisor", "vendedor"] as const) {
    if (papeisNoSistema.has(papel) && !temAba(papel)) {
      const comValor = sistema.filter((p) => papelDoTipo(p.tipoPessoa) === papel && (p.valor !== 0 || p.premio !== 0)).length;
      if (!abas.some((a) => a.linhasDeDados === 0 && a.papel === papel)) {
        avisos.push(
          `A base não traz ${ROTULO_PAPEL[papel].toLowerCase()}: ${comValor} com resultado no sistema foram considerados 0.`
        );
      }
    }
  }

  // pessoas do sistema com resultado que não aparecem na base
  for (const papel of ["vendedor", "supervisor", "gerente"] as const) {
    if (!temAba(papel)) continue;
    const faltando = resultados.filter(
      (r) => r.status === "so_sistema" && r.tipoPessoa !== null && papelDoTipo(r.tipoPessoa) === papel
    );
    if (faltando.length > 0) {
      avisos.push(
        `${faltando.length} ${ROTULO_PAPEL[papel].toLowerCase()} com resultado no sistema não estão na base (considerados 0): ${listarNomes(
          faltando.map((r) => r.nome)
        )}.`
      );
    }
  }

  return avisos;
}

function descricaoDoQueFalta(papel: PapelAba): string {
  if (papel === "gerente") return "gerentes";
  if (papel === "supervisor") return "supervisores";
  if (papel === "vendedor") return "vendedores";
  return "as pessoas dessa aba";
}

export interface ResumoConferencia {
  total: number;
  ok: number;
  divergentes: number;
  soSistema: number;
  soPlanilha: number;
  ambiguos: number;
  somaDifValor: number;
  somaDifPremio: number;
}

export function resumir(resultados: ResultadoConferencia[]): ResumoConferencia {
  const resumo: ResumoConferencia = {
    total: resultados.length,
    ok: 0,
    divergentes: 0,
    soSistema: 0,
    soPlanilha: 0,
    ambiguos: 0,
    somaDifValor: 0,
    somaDifPremio: 0,
  };

  for (const r of resultados) {
    if (r.status === "ok") resumo.ok++;
    else if (r.status === "divergente") resumo.divergentes++;
    else if (r.status === "so_sistema") resumo.soSistema++;
    else if (r.status === "so_planilha") resumo.soPlanilha++;
    else resumo.ambiguos++;

    resumo.somaDifValor += r.difValor ?? 0;
    resumo.somaDifPremio += r.difPremio ?? 0;
  }

  resumo.somaDifValor = arredondar(resumo.somaDifValor);
  resumo.somaDifPremio = arredondar(resumo.somaDifPremio);
  return resumo;
}

export const ROTULO_STATUS: Record<StatusConferencia, string> = {
  ok: "OK",
  divergente: "Divergente",
  so_sistema: "Sem informação na base",
  so_planilha: "Só na planilha",
  ambiguo: "Ambíguo",
};
