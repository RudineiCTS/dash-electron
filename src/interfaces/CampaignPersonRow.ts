export interface CampaignPersonRow {
  id: string;
  pessoa: string;
  matricula: string;
  tipo: string;
  objetivo: number;
  valorApurado: number;
  percentualRealizado: number | null;
  colocacao: string | null;
  premiacao: number | null;
  dataCalculo: string;
  log: string;
  /** Rótulo do grupo exibido acima desta linha quando ela é filha de outra (ex: "Grandes Contas"). */
  group?: string;
  children?: CampaignPersonRow[];
}
