import { CampaignResultGoalReport, CampaignResultGoalReportFilter } from "../interfaces/CampaignResultGoalReport";
import { api } from "./api";

export async function getCampaignResultGoalReport(
  filter: CampaignResultGoalReportFilter,
  signal?: AbortSignal
): Promise<CampaignResultGoalReport[]> {
  const params: Record<string, string> = {};
  if (filter.competenceMonth) params.competenceMonth = filter.competenceMonth;
  if (filter.campaignName) params.campaignName = filter.campaignName;

  const response = await api.get<CampaignResultGoalReport[]>(`campaign-result-goal-report`, {
    params,
    signal,
  });
  return response.data;
}
