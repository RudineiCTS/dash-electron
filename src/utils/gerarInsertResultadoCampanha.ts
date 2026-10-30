import dayjs from "dayjs";
import { LinhaResultadoCampanha } from "../interfaces/CampanhaFarmaResultado";

export interface DadosInsertResultado {
  idCampanha: number;
  descricao: string;
  /** AAAA-MM-DD */
  dataCompetencia: string;
  /** Data/hora da execução do script de apuração (vai em DataCalculo). */
  executadoEm: string;
  linhas: LinhaResultadoCampanha[];
}

const COLUNAS_INSERT = [
  "IDCampanhaComercial",
  "DataCompetencia",
  "DescricaoCampanha",
  "TipoPessoa",
  "IDPessoa",
  "NomeVendedor",
  "IDSupervisor",
  "NomeSupervisor",
  "IDGerente",
  "NomeGerente",
  "Objetivo",
  "ValorApurado",
  "PercentualRealizado",
  "Colocacao",
  "PremiacaoPontos",
  "PremiacaoValor",
  "LogCalculo",
  "DataCalculo",
];

function sqlTexto(valor: string): string {
  return `'${valor.replace(/'/g, "''")}'`;
}

/** Ponto decimal, 2 casas, sem separador de milhar. */
function sqlNumero(valor: number): string {
  if (!Number.isFinite(valor)) return "0";
  return String(Math.round(valor * 100) / 100);
}

function logCalculo(linha: LinhaResultadoCampanha): string {
  return (
    `Meta Total: R$${sqlNumero(linha.objetivo)}  Realizado Total: 0  ` +
    `Realizado individual: R$ ${sqlNumero(linha.valorApurado)} Percentual:  0 %`
  );
}

function selectDaLinha(linha: LinhaResultadoCampanha, dados: DadosInsertResultado, dataCalculo: string): string {
  const valores = [
    String(dados.idCampanha),
    sqlTexto(dados.dataCompetencia),
    sqlTexto(dados.descricao),
    String(linha.tipoPessoa),
    String(linha.idPessoa),
    sqlTexto(linha.nomePessoa),
    String(linha.idSupervisor),
    sqlTexto(linha.nomeSupervisor),
    String(linha.idGerente),
    sqlTexto(linha.nomeGerente),
    sqlNumero(linha.objetivo),
    sqlNumero(linha.valorApurado),
    "0", // PercentualRealizado: não usado por enquanto
    "0", // Colocacao: não usado por enquanto
    "0", // PremiacaoPontos: sempre 0 neste fluxo
    sqlNumero(linha.premio),
    sqlTexto(logCalculo(linha)),
    sqlTexto(dataCalculo),
  ];

  return "SELECT " + valores.map((valor, i) => `${valor} ${COLUNAS_INSERT[i]}`).join(", ");
}

/**
 * Script de inserção em tblCampanhaComercialResultado, uma linha por pessoa ligadas por UNION,
 * dentro de BEGIN TRANSACTION / COMMIT. É só texto: a tela não executa nada sozinha.
 */
export function gerarInsertResultadoCampanha(dados: DadosInsertResultado): string {
  const dataCalculo = dayjs(dados.executadoEm).format("YYYY-MM-DD HH:mm:ss");
  const selects = dados.linhas.map((linha, i) => {
    const uniao = i < dados.linhas.length - 1 ? " UNION" : "";
    return `${selectDaLinha(linha, dados, dataCalculo)}${uniao}`;
  });

  return [
    "BEGIN TRANSACTION",
    "",
    "INSERT INTO tblCampanhaComercialResultado",
    "(",
    COLUNAS_INSERT.map((coluna) => `\t${coluna}`).join(",\n"),
    ")",
    selects.join("\n"),
    "",
    "COMMIT",
    "",
  ].join("\n");
}

export interface TotaisRetorno {
  linhas: number;
  totalGerentes: number;
  totalSupervisores: number;
  totalPremio: number;
}

export function calcularTotaisRetorno(linhas: LinhaResultadoCampanha[]): TotaisRetorno {
  const somar = (lista: LinhaResultadoCampanha[], campo: "valorApurado" | "premio") =>
    lista.reduce((acc, l) => acc + l[campo], 0);

  return {
    linhas: linhas.length,
    totalGerentes: somar(linhas.filter((l) => l.tipoPessoa === 1), "valorApurado"),
    totalSupervisores: somar(linhas.filter((l) => l.tipoPessoa === 2), "valorApurado"),
    totalPremio: somar(linhas, "premio"),
  };
}
