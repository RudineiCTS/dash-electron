import {
  CampaignRegistration,
  CampaignRegistrationFileType,
  CampaignRegistrationFilter,
} from "../interfaces/CampaignRegistration";
import { api } from "./api";

export async function getCampaignRegistrations(
  filter: CampaignRegistrationFilter,
  signal?: AbortSignal
): Promise<CampaignRegistration[]> {
  const response = await api.get<CampaignRegistration[]>(`campaign-registration`, {
    params: {
      periodFrom: filter.periodFrom,
      periodTo: filter.periodTo,
    },
    signal,
  });
  return response.data;
}

export async function getCampaignRegistrationFile(
  idConference: number,
  type: CampaignRegistrationFileType,
  signal?: AbortSignal
): Promise<Blob> {
  const response = await api.get<Blob>(`campaign-registration/${idConference}/files/${type}`, {
    responseType: "blob",
    signal,
  });
  return response.data;
}
