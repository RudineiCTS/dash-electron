import { CampaignConditioning } from "../interfaces/CampaignConditioning";
import { api } from "./api";

export async function getCampaignConditioning(idCampaign: number, signal?: AbortSignal): Promise<CampaignConditioning[]> {
    const response = await api.get<CampaignConditioning[]>(`campaign-conditioning/${idCampaign}`, { signal });
    return response.data;
}
