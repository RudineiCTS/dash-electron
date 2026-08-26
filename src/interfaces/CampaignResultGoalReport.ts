export interface CampaignResultGoalReportFilter {
  competenceMonth?: string;
  campaignName?: string;
}

export interface CampaignResultGoalReport {
  idCampaign: number | null;
  campaignDescription: string | null;
  campaignTypeDescription: string | null;
  assessedValue: number | null;
  goalValue: number | null;
}
