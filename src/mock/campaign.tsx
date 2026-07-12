import { Campaign } from "../interfaces/TCampaign";

export const campanhaDetalhe : Campaign = {
  idCampaign:1,
  name: "Campanha Cremer",
  status: "ativa",
  periodo: { inicio: "01/06/2026", fim: "30/06/2026" },
  meta: "R$ 48.500,00",
  valorIndustria: "R$ 3.200,00",
  formaRecebimento: "Bonificação",
  fabricantes: ["Cremer", "3M"],
  produtos: ["Curativo Cremer 10x10", "Fita Micropore"],
  anexoProduto: true,
  anexoCliente: false,
};