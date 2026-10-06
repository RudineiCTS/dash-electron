export interface CampaignRegistrationFilter {
  periodFrom: string;
  periodTo: string;
}

export type CampaignRegistrationFileType = "clients" | "products";

export interface CampaignRegistration {
  /** Chave da conferência; idCampaign fica nulo até a campanha ser processada. */
  idConference: number;
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
  hasClientsFile: boolean;
  clientsFileName: string | null;
  hasProductsFile: boolean;
  productsFileName: string | null;
}
