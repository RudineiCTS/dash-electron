import { CampaignResult } from "../interfaces/CampaignResultTelesales";
import { CampaignPersonRow } from "../interfaces/CampaignPersonRow";
import { CampaignSalesRow } from "../interfaces/CampaignSalesRow";
import { ProductCampaign } from "../interfaces/TParamsCampaign";

export function csvEscape(value: string | number | null): string {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

export function downloadCsv(headers: string[], rows: (string | number | null)[][], filename: string) {
  const lines = rows.map((row) => row.map(csvEscape).join(";"));
  const csv = [headers.map(csvEscape).join(";"), ...lines].join("\r\n");
  const BOM = "﻿";
  const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

export function exportCampaignPersonRowsToCsv(rows: CampaignPersonRow[], filename: string) {
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

  downloadCsv(headers, data, filename);
}

export function exportCampaingTelesalesPersonRowsToCsv(rows: CampaignResult[], filename:string){
  const headers =[
    'ID Campanha',
    'Campanha',
    'Data Competência',
    'Tipo Campanha',
    'ID Supervisor',
    'Supervisor',
    'ID Pessoa',
    'Nome',
    'Objetivo',
    'Valor Apurado',
    'Percentual ',
    'Ranking',
    'Premio'
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
    row.award
  ]);
   downloadCsv(headers, data, filename);
}


export function exportCampaignSalesRowsToCsv(
  rows: CampaignSalesRow[],
  filename: string
) {

  const headers = [
    "CNPJ",
    "Razão Social",
    "Produto",
    "CodBarras",
    "Quantidade",
    "Total",
    "Nome Vendedor",
  ];

    const data = rows.map(row => [
      `="${row.cpfcnpj}"`,
      row.legalName,
      row.productName,
      `="${row.productEan}"`,
      row.quantitySold,
      row.valueSold,
      row.sellerName,
    ]);

  downloadCsv(headers, data, filename);
}

export function exportProductsToCsv(rows:ProductCampaign[], filename:string){
  const header = [
    "ID Campanha",
    "ID Produto",
    "Descrição",
    "Ativo"
  ]
  const data = rows.map((row)=>[
    row.idCampaign,
    row.idProduct,
    row.name,
    row.isValid
  ])
}