import { CampaignRegistration, CampaignRegistrationFilter } from "../interfaces/CampaignRegistration";
import { api } from "./api";

export async function getCampaignRegistrations(
  filter: CampaignRegistrationFilter,
  signal?: AbortSignal
): Promise<CampaignRegistration[]> {
  const response = await api.get<CampaignRegistration[]>(`campaign-registration`, {
    params: {
      inclusionDateFrom: filter.inclusionDateFrom,
      inclusionDateTo: filter.inclusionDateTo,
    },
    signal,
  });
  return response.data;
}
