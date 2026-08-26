export interface CampaignRegistrationFilter {
  inclusionDateFrom: string;
  inclusionDateTo: string;
}

export interface CampaignRegistration {
  idCampaign: number | null;
  campaignDescription: string | null;
  startDate: string | null;
  endDate: string | null;
  goalValue: number | null;
  assessmentType: string | null;
  paymentType: string | null;
  valueTrigger: string | null;
  cnpjTrigger: string | null;
  manufacturers: string | null;
  positivationAward: string | null;
  volumeAward: string | null;
  supervisorAssistantAward: number | null;
  supervisorAward: number | null;
  registrationNotes: string | null;
  notes: string | null;
  status: string | null;
  processingDate: string | null;
}
