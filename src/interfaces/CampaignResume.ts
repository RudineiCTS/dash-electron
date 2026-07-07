export interface CampaignCompetencePeriod {
  idCampaign: number;
  competenceDate: string; // ISO 8601 datetime - ex: "2026-06-30T00:00:00"
  idCompetencePeriodStatus: number;
  startDate: string; // ISO 8601 datetime
  endDate: string; // ISO 8601 datetime
  totalRanking: number;
  description: string;
  idAssessmentType: string;
  idCalculationMethod: string;
  validationRule: number;
  valueType: number;
  earlyEndDate: string; // ISO 8601 datetime com milissegundos
  notes: string;
  considersExclusives: boolean;
  campaignType: string | null;
}