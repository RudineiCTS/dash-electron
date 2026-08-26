import * as XLSX from "xlsx";
import { CampaignResult } from "../interfaces/CampaignResultTelesales";
import { CampaignPersonRow } from "../interfaces/CampaignPersonRow";
import { CampaignSalesRow } from "../interfaces/CampaignSalesRow";

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
