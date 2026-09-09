export interface CampaignConditioning {
    idCampaign: number;
    idConditioningCampaign: number;
    validationResult: number | null;
    conditioningCampaignDescription: string | null;
    competenceDate: string | null;
    conditioningCampaignTypeDescription: string | null;
    goalValue: number | null;
    assessedValue: number | null;
    assessedValueBees: number | null;
    totalAward: number | null;
    totalPot: number | null;
    percentageAchieved: number | null;
    notes: string | null;
}
