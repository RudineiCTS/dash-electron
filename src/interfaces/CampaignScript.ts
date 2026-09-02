export interface CampaignScriptResponse {
    idCampaign: number;
    available: boolean;
    simpleScript: string | null;
    completeScript: string | null;
    reason: string | null;
}
