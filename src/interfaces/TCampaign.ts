export type CampaignStatus = "ativa" | "encerrada" | "rascunho";

export interface CampaignPeriodo {
  inicio: string;
  fim: string;
}

export interface Campaign {
  idCampaign:number;
  name: string;
  status: CampaignStatus;
  periodo: CampaignPeriodo;
  meta: string;
  valorIndustria: string;
  formaRecebimento: string;
  fabricantes: string[];
  produtos: string[];
  anexoProduto: boolean;
  anexoCliente: boolean;
}