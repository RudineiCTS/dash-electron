export interface CampaignSummary {
  idCampaign: number;
  campaignDescription: string;
  competenceDate: string; // ISO 8601 datetime - ex: "2026-06-30T00:00:00"
  campaignTypeDescription: string;
  goalValue: number;
  assessedValue: number;
  assessedValueBees: number | null;
  totalAward: number;
  totalPot: number;
  percentageAchieved: number;
  notes: string;
  typeCampaign?: string;
  isDynamic?: boolean | null;

  idCompetencePeriodStatus: number;
  startDate: string; // ISO 8601 datetime - ex: "2026-07-01T00:00:00"
  endDate: string; // ISO 8601 datetime - ex: "2026-07-30T00:00:00"
  totalRanking: number;
  idAssessmentType: number;
  idCalculationMethod: number;
  validationRule: number;
  valueType: number;
  earlyEndDate: string | null;
  considersExclusives: boolean;

  /**
   * Só no site web, para usuário comum logado: o administrador escondeu o apurado desta campanha. Os valores
   * (assessedValue, assessedValueBees e percentageAchieved) chegam null e não devem ser usados em conta.
   * O app desktop (sem login do site) e o administrador nunca recebem true.
   */
  assessedHidden?: boolean;
  /** Idem para o prêmio: totalAward e totalPot chegam null. */
  prizeHidden?: boolean;
}