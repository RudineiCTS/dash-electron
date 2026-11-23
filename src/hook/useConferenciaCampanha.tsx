import { useCallback, useMemo, useState } from "react";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import { RetornoScript, TIPO_PESSOA_ROTULO } from "../interfaces/CampanhaFarmaResultado";
import { downloadExcelMultiSheet } from "../utils/excelExport";
import {
  conferir,
  detectarLinhaCabecalho,
  detectarPapel,
  InfoAba,
  lerBase,
  LinhaBase,
  MapeamentoColunas,
  PapelAba,
  PessoaSistema,
  ResultadoConferencia,
  resumir,
  ROTULO_STATUS,
  SEM_COLUNA,
  sugerirColunas,
  validarBase,
} from "../utils/conferenciaCampanha";

/** Uma aba da planilha da outra base, com o papel e as colunas que a tela deduziu (o usuário pode ajustar). */
export interface AbaBase {
  nome: string;
  linhas: unknown[][];
  papel: PapelAba;
  /** Linha (0-based) do cabeçalho. */
  linhaCabecalho: number;
  mapa: MapeamentoColunas;
  incluir: boolean;
}

function letraDaColuna(indice: number): string {
  return XLSX.utils.encode_col(indice);
}

export function opcoesDeColuna(aba: AbaBase): string[] {
  const quantidade = aba.linhas.slice(0, 50).reduce((max, l) => Math.max(max, l?.length ?? 0), 0);
  return Array.from({ length: quantidade }, (_, i) => {
    const texto = String(aba.linhas[aba.linhaCabecalho]?.[i] ?? "").trim();
    return texto ? `${letraDaColuna(i)} · ${texto}` : letraDaColuna(i);
  });
}

function montarAba(nome: string, linhas: unknown[][]): AbaBase {
  const linhaCabecalho = detectarLinhaCabecalho(linhas);
  const textos = (linhas[linhaCabecalho] ?? []).map((c) => String(c ?? ""));
  return {
    nome,
    linhas,
    papel: detectarPapel(nome),
    linhaCabecalho,
    mapa: sugerirColunas(textos),
    incluir: true,
  };
}

/** Aba usável: tem a coluna de valor e pelo menos uma entre ID e nome. */
function abaConferivel(aba: AbaBase): boolean {
  return aba.mapa.valor !== SEM_COLUNA && (aba.mapa.id !== SEM_COLUNA || aba.mapa.nome !== SEM_COLUNA);
}

/**
 * Conferência do retorno do script (sistema) com uma base em Excel enviada pelo usuário.
 * A base pode ter uma aba por papel (VENDEDOR, SUPERVISOR, GERENTE). Tudo acontece no navegador:
 * a planilha não é enviada a lugar nenhum.
 */
export interface OpcoesConferenciaCampanha {
  /**
   * Tipos de pessoa (1 gerente, 2 supervisor, 3 vendedor...) que entram na conferência; null/omitido = todos.
   * As linhas da planilha de pessoas de outro tipo são descartadas, não viram "só na planilha".
   */
  tiposIncluidos?: number[] | null;
  /** Como chamar o prêmio nas colunas do arquivo baixado (ex.: "Prêmio (pontos)"); padrão "Prêmio". */
  rotuloPremio?: string;
}

export function useConferenciaCampanha(retorno: RetornoScript | null, opcoes: OpcoesConferenciaCampanha = {}) {
  const tiposIncluidos = opcoes.tiposIncluidos ?? null;
  const rotuloPremio = opcoes.rotuloPremio ?? "Prêmio";
  const chaveTipos = tiposIncluidos ? tiposIncluidos.join(",") : "todos";
  const [nomeArquivo, setNomeArquivo] = useState("");
  const [abas, setAbas] = useState<AbaBase[]>([]);
  /** Sobe a cada planilha carregada; a tela usa para abrir o popup de avisos uma vez por arquivo. */
  const [versaoArquivo, setVersaoArquivo] = useState(0);
  /** Versão do arquivo cujos avisos o usuário já viu (-1 = pediu para ver de novo). */
  const [versaoVista, setVersaoVista] = useState(0);
  const [tolerancia, setTolerancia] = useState(0.01);
  const [lendo, setLendo] = useState(false);
  const [erro, setErro] = useState("");

  const carregarArquivo = useCallback(async (arquivo: File) => {
    setErro("");
    setLendo(true);
    try {
      const buffer = await arquivo.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });

      const lista: AbaBase[] = [];
      workbook.SheetNames.forEach((nome, i) => {
        const oculta = (workbook.Workbook?.Sheets?.[i]?.Hidden ?? 0) > 0;
        if (oculta) return;
        const linhas = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[nome], {
          header: 1,
          raw: true,
          defval: null,
        });
        // aba vazia continua na lista: a validação avisa que ela não trouxe dados
        lista.push(montarAba(nome, linhas));
      });

      if (lista.length === 0) {
        setErro("A planilha não tem nenhuma aba visível.");
        return;
      }

      setNomeArquivo(arquivo.name);
      setAbas(lista);
      setVersaoArquivo((v) => v + 1);
    } catch {
      setErro("Não foi possível ler o arquivo. Verifique se é um .xlsx ou .xls válido.");
    } finally {
      setLendo(false);
    }
  }, []);

  const limparArquivo = useCallback(() => {
    setNomeArquivo("");
    setAbas([]);
    setErro("");
  }, []);

  const alterarAba = useCallback((indice: number, mudanca: Partial<AbaBase>) => {
    setAbas((atual) => atual.map((a, i) => (i === indice ? { ...a, ...mudanca } : a)));
  }, []);

  const alterarLinhaCabecalho = useCallback((indice: number, linha: number) => {
    setAbas((atual) =>
      atual.map((a, i) => {
        if (i !== indice) return a;
        const valida = Math.max(0, linha);
        const textos = (a.linhas[valida] ?? []).map((c) => String(c ?? ""));
        return { ...a, linhaCabecalho: valida, mapa: sugerirColunas(textos) };
      })
    );
  }, []);

  const alterarColuna = useCallback((indice: number, campo: keyof MapeamentoColunas, coluna: number) => {
    setAbas((atual) => atual.map((a, i) => (i === indice ? { ...a, mapa: { ...a.mapa, [campo]: coluna } } : a)));
  }, []);

  const sistema = useMemo<PessoaSistema[]>(
    () =>
      (retorno?.linhas ?? []).map((l) => ({
        tipoPessoa: l.tipoPessoa,
        idPessoa: l.idPessoa,
        nome: l.nomePessoa,
        valor: l.valorApurado,
        premio: l.premio,
      })),
    [retorno]
  );

  const abasUsadas = abas.filter((a) => a.incluir);

  const saida = useMemo(() => {
    if (!retorno || abasUsadas.length === 0) return null;

    const base: LinhaBase[] = [];
    const infos: InfoAba[] = [];

    for (const aba of abasUsadas) {
      const lidas = abaConferivel(aba) ? lerBase(aba.linhas, aba.linhaCabecalho, aba.mapa, aba.nome, aba.papel) : [];
      base.push(...lidas);
      infos.push({
        nome: aba.nome,
        papel: aba.papel,
        linhasDeDados: lidas.length,
        temColunaValor: aba.mapa.valor !== SEM_COLUNA,
        temColunaPremio: aba.mapa.premio !== SEM_COLUNA,
        linhasComPremio: lidas.filter((l) => l.premio !== null).length,
      });
    }

    // confere contra TODAS as pessoas (assim a linha da planilha de um tipo não escolhido ainda acha o dono dela) e
    // só depois tira da tela os tipos que o usuário não quer comparar
    const conferencia = conferir(sistema, base, { tolerancia });
    const incluidos = chaveTipos === "todos" ? null : chaveTipos.split(",").filter(Boolean).map(Number);
    const resultados = incluidos
      ? conferencia.resultados.filter((r) => r.tipoPessoa === null || incluidos.includes(r.tipoPessoa))
      : conferencia.resultados;
    const sistemaConsiderado = incluidos ? sistema.filter((p) => incluidos.includes(p.tipoPessoa)) : sistema;

    return {
      resultados,
      // primeiro o que a base não trouxe (vai para o popup), depois os avisos do casamento
      avisos: [...validarBase(sistemaConsiderado, infos, resultados), ...conferencia.avisos],
      linhasNaBase: base.length,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retorno, abas, sistema, tolerancia, chaveTipos]);

  const resumo = useMemo(() => (saida ? resumir(saida.resultados) : null), [saida]);

  // o popup abre uma vez por planilha enviada (assim que há retorno para conferir) e pode ser reaberto
  const avisosPendentes = !!saida && saida.avisos.length > 0 && versaoVista !== versaoArquivo;
  const fecharAvisos = useCallback(() => setVersaoVista(versaoArquivo), [versaoArquivo]);
  const reabrirAvisos = useCallback(() => setVersaoVista(-1), []);

  const baixarDivergencias = useCallback(() => {
    if (!saida) return;

    const cabecalho = [
      "Status",
      "Tipo",
      "ID",
      "Nome",
      "Valor sistema",
      "Valor base",
      "Dif. valor",
      `${rotuloPremio} sistema`,
      `${rotuloPremio} base`,
      `Dif. ${rotuloPremio.charAt(0).toLowerCase()}${rotuloPremio.slice(1)}`,
      "Observação",
    ];
    const paraLinha = (r: ResultadoConferencia): (string | number | null)[] => [
      ROTULO_STATUS[r.status],
      r.tipoPessoa === null ? "" : TIPO_PESSOA_ROTULO[r.tipoPessoa] ?? String(r.tipoPessoa),
      r.idPessoa,
      r.nome,
      r.valorSistema,
      r.valorBase,
      r.difValor,
      r.premioSistema,
      r.premioBase,
      r.difPremio,
      r.observacao,
    ];

    const todas = saida.resultados.filter((r) => !r.zeradaForaDaBase);
    const problemas = saida.resultados.filter((r) => r.status !== "ok");

    downloadExcelMultiSheet(
      [
        { name: "Divergências", rows: [cabecalho, ...problemas.map(paraLinha)] },
        { name: "Conferência", rows: [cabecalho, ...todas.map(paraLinha)] },
        { name: "Avisos", rows: [["Avisos da conferência"], ...saida.avisos.map((a) => [a])] },
      ],
      `conferencia-campanha-${dayjs().format("YYYYMMDD-HHmm")}.xlsx`
    );
  }, [saida, rotuloPremio]);

  return {
    nomeArquivo,
    abas,
    versaoArquivo,
    tolerancia,
    setTolerancia,
    lendo,
    erro,
    podeConferir: !!saida,
    resultados: saida?.resultados ?? [],
    avisos: saida?.avisos ?? [],
    avisosPendentes,
    fecharAvisos,
    reabrirAvisos,
    linhasNaBase: saida?.linhasNaBase ?? 0,
    resumo,
    carregarArquivo,
    limparArquivo,
    alterarAba,
    alterarLinhaCabecalho,
    alterarColuna,
    baixarDivergencias,
  };
}

export type ConferenciaCampanha = ReturnType<typeof useConferenciaCampanha>;
