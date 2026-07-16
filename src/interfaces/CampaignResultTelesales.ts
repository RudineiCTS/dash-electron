export interface CampaignResult {
  idCampaign: number;
  campaignDescription: string;
  competenceDate: string; // ISO date string, e.g. "2026-07-31T00:00:00"
  campaignTypeDescription: string;
  idSupervisor: number;
  supervisorName: string;
  idPersonSales: number;
  operatorName: string;
  individualTarget: number;
  assessedValue: number;
  percentageAchieved: number;
  ranking: number;
  award: number;
  calculationLog: string;
  calculationDate: string; // ISO date string with milliseconds, e.g. "2026-07-15T05:56:33.74"
}
interface CampaignTelesalesRowPerson {
  idPersonSales: number;
  operatorName: string;
  individualTarget: number;
  assessedValue: number;
  percentageAchieved: number;
  ranking: number;
  award: number;
}