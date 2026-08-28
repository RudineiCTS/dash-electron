export interface CampaignScriptResponse {
    idCampaign: number;
    available: boolean;
    script: string | null;
    reason: string | null;
}
