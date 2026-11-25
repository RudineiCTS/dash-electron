import * as XLSX from "xlsx";
import { CampaignResult } from "../interfaces/CampaignResultTelesales";
import { CampaignPersonRow } from "../interfaces/CampaignPersonRow";
import { CampaignSalesRow } from "../interfaces/CampaignSalesRow";
import { CampanhaComercialResultadoLinha } from "../interfaces/CampanhaComercial";
import { TIPO_PESSOA_ROTULO } from "../interfaces/CampanhaFarmaResultado";
import { PedidoValidacao, ResultadoValidacao } from "../interfaces/ValidacaoCampanha";
import { conferirValor, resumirPedidos, rotuloOrigem } from "./validacaoCampanhas";
import dayjs from "dayjs";

/**
 * Pedidos considerados na apuração de uma pessoa numa campanha (tela de Validação), em duas abas:
 * "Pedidos" (todas as linhas, não só as que aparecem na tela) e "Resumo" (a conferência com o valor apurado).
 */
export function exportPedidosValidacaoToExcel(linha: ResultadoValidacao, pedidos: PedidoValidacao[], filename: string) {
  const resumo = resumirPedidos(pedidos);
  const conferencia = conferirValor(linha.valorApurado, resumo.totalConsiderado);
  const data = (iso: string | null) => (iso ? dayjs(iso).format("DD/MM/YYYY") : null);

  const cabecalho = [
    "Pedido",
    "Faturamento",
    "ID Cliente",
    "Cliente",
    "ID Produto",
    "Produto",
    "ID Fabricante",
    "Fabricante",
    "Linha de produto",
    "Operação",
    "Origem",
    "Quantidade",
    "Valor",
    "Crédito",
    "ID Vendedor da venda",
    "Vendedor da venda",
    "No apurado",
    "Data da apuração",
  ];

  const linhas = pedidos.map((p) => [
    p.idPedido,
    data(p.dataFaturamento),
    p.idCliente,
    p.nomeCliente,
    p.idProduto,
    p.descricaoProduto,
    p.idFabricante,
    p.nomeFabricante,
    p.idProdutoLinha,
    p.idOperacao,
    rotuloOrigem(p.idOrigem),
    p.quantidade,
    p.valorCampanha,
    p.creditadoPorExclusivo ? "Exclusivo" : "Venda própria",
    p.idVendedorVenda,
    p.nomeVendedorVenda,
    p.consideradoNoApurado ? "Sim" : "Não",
    p.dataApuracao ? dayjs(p.dataApuracao).format("DD/MM/YYYY HH:mm") : null,
  ]);

  const resumoLinhas: (string | number | null)[][] = [
    ["Campanha", `${linha.idCampanha} · ${linha.descricaoCampanha ?? ""}`],
    ["Competência", data(linha.dataCompetencia)],
    ["Pessoa", `${linha.nomePessoa ?? ""} (${linha.idPessoa ?? ""})`],
    ["Tipo", linha.tipoPessoa],
    [],
    ["Valor apurado", linha.valorApurado],
    ["Soma dos pedidos considerados", resumo.totalConsiderado],
    ["Diferença (apurado - pedidos)", conferencia.diferenca],
    ["Confere com o apurado", conferencia.confere ? "Sim" : "Não"],
    [],
    ["Linhas", resumo.linhas],
    ["Pedidos distintos", resumo.pedidos],
    ["Linhas fora do apurado", resumo.linhasForaDoApurado],
    ["Valor fora do apurado", resumo.totalForaDoApurado],
    ["Linhas por exclusivo", resumo.linhasPorExclusivo],
    [],
    ["Gerado em", dayjs().format("DD/MM/YYYY HH:mm")],
  ];

  downloadExcelMultiSheet(
    [
      { name: "Pedidos", rows: [cabecalho, ...linhas] },
      { name: "Resumo", rows: resumoLinhas },
    ],
    filename
  );
}

/** Resultado calculado de uma campanha comercial (tblCampanhaComercialResultado), uma linha por pessoa. */
export function exportCampanhaComercialResultadoToExcel(rows: CampanhaComercialResultadoLinha[], filename: string) {
  const headers = [
    "ID Campanha",
    "Campanha",
    "Data Competência",
    "Tipo",
    "ID Gerente",
    "Gerente",
    "ID Supervisor",
    "Supervisor",
    "ID Pessoa",
    "Nome",
    "Objetivo",
    "Valor Apurado",
    "% Realizado",
    "Colocação",
    "Premiação Pontos",
    "Premiação Valor",
    "Log do Cálculo",
    "Data Cálculo",
  ];

  const data = rows.map((row) => [
    row.idCampanhaComercial,
    row.descricaoCampanha,
    row.dataCompetencia ? dayjs(row.dataCompetencia).format("DD/MM/YYYY") : null,
    row.tipoPessoa == null ? null : TIPO_PESSOA_ROTULO[row.tipoPessoa] ?? row.tipoPessoa,
    row.idGerente,
    row.nomeGerente,
    row.idSupervisor,
    row.nomeSupervisor,
    row.idPessoa,
    row.nomeVendedor,
    row.objetivo,
    row.valorApurado,
    row.percentualRealizado,
    row.colocacao,
    row.premiacaoPontos,
    row.premiacaoValor,
    row.logCalculo,
    row.dataCalculo ? dayjs(row.dataCalculo).format("DD/MM/YYYY HH:mm") : null,
  ]);

  downloadExcel(headers, data, filename, "Resultado");
}

export function downloadExcel(
  headers: string[],
  rows: (string | number | null)[][],
  filename: string,
  sheetName = "Dados"
) {
  const data = [headers, ...rows.map((row) => row.map((value) => value ?? ""))];
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, filename);
}

export interface ExcelSheet {
  name: string;
  /** cada linha já vem pronta (inclui cabeçalho, blocos de contexto, linhas em branco, etc.) */
  rows: (string | number | null)[][];
}

export function downloadExcelMultiSheet(sheets: ExcelSheet[], filename: string) {
  const workbook = XLSX.utils.book_new();

  sheets.forEach((sheet) => {
    const data = sheet.rows.map((row) => row.map((value) => value ?? ""));
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name.slice(0, 31));
  });

  XLSX.writeFile(workbook, filename);
}

export function exportCampaignPersonRowsToExcel(rows: CampaignPersonRow[], filename: string) {
  const headers = [
    "Pessoa",
    "Matrícula",
    "Tipo",
    "Objetivo",
    "Valor Apurado",
    "% Realizado",
    "Colocação",
    "Premiação",
    "Data Cálculo",
    "Log",
  ];

  const data = rows.map((row) => [
    row.pessoa,
    row.matricula,
    row.tipo,
    row.objetivo,
    row.valorApurado,
    row.percentualRealizado,
    row.colocacao,
    row.premiacao,
    row.dataCalculo,
    row.log,
  ]);

  downloadExcel(headers, data, filename);
}

export function exportCampaingTelesalesPersonRowsToExcel(rows: CampaignResult[], filename: string) {
  const headers = [
    "ID Campanha",
    "Campanha",
    "Data Competência",
    "Tipo Campanha",
    "ID Supervisor",
    "Supervisor",
    "ID Pessoa",
    "Nome",
    "Objetivo",
    "Valor Apurado",
    "Percentual",
    "Ranking",
    "Premio",
  ];

  const data = rows.map((row) => [
    row.idCampaign,
    row.campaignDescription,
    row.competenceDate,
    row.campaignTypeDescription,
    row.idSupervisor,
    row.supervisorName,
    row.idPersonSales,
    row.operatorName,
    row.individualTarget,
    row.assessedValue,
    row.percentageAchieved,
    row.ranking,
    row.award,
  ]);

  downloadExcel(headers, data, filename);
}

export function exportCampaignSalesRowsToExcel(rows: CampaignSalesRow[], filename: string) {
  const headers = [
    "CNPJ",
    "Razão Social",
    "Produto",
    "CodBarras",
    "Quantidade",
    "Total",
    "Nome Vendedor",
  ];

  const data = rows.map((row) => [
    row.cpfcnpj,
    row.legalName,
    row.productName,
    row.productEan,
    row.quantitySold,
    row.valueSold,
    row.sellerName,
  ]);

  downloadExcel(headers, data, filename);
}
