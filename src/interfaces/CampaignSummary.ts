export interface CampaignSummary {
  idCampaign: number;
  campaignDescription: string;
  competenceDate: string; // ISO 8601 datetime - ex: "2026-06-30T00:00:00"
  campaignTypeDescription: string;
  goalValue: number;
  assessedValue: number;
  assessedValueBees: number | null;
  totalAward: number;
  totalPot: number;
  percentageAchieved: number;
  notes: string;
  typeCampaign?: string;
}