import { CampaignPersonRow } from "../interfaces/CampaignPersonRow";
import { CampaignSalesRow } from "../interfaces/CampaignSalesRow";

function csvEscape(value: string | number | null): string {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function downloadCsv(headers: string[], rows: (string | number | null)[][], filename: string) {
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

export function exportCampaignSalesRowsToCsv(rows: CampaignSalesRow[], filename: string) {
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
    row.cnpj,
    row.razaoSocial,
    row.produto,
    row.codBarras,
    row.quantidade,
    row.total,
    row.nomeVendedor,
  ]);

  downloadCsv(headers, data, filename);
}
