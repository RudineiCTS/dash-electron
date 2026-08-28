import { CampaignScriptResponse } from "../interfaces/CampaignScript";
import { api } from "./api";

export async function getCampaignScript(idCampaign: number, signal?: AbortSignal): Promise<CampaignScriptResponse> {
    const response = await api.get<CampaignScriptResponse>(`campaign-script/${idCampaign}`, { signal });
    return response.data;
}
