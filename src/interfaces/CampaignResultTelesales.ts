export interface CampaignResult {
  idCampaign: number;
  campaignDescription: string;
  competenceDate: string; // ISO date string, e.g. "2026-07-31T00:00:00"
  campaignTypeDescription: string;
  idSupervisor: number;
  supervisorName: string;
  idPersonSales: number;
  operatorName: string;
  /** Grupo do digitador (Prospeção, Fidelização, Exclusiva, SAC); vazio quando não cadastrado. */
  personGroup?: string | null;
  personSubGroup?: string | null;
  individualTarget: number;
  assessedValue: number;
  percentageAchieved: number;
  ranking: number;
  award: number;
  calculationLog: string;
  calculationDate: string; // ISO date string with milliseconds, e.g. "2026-07-15T05:56:33.74"
  /**
   * TipoPessoa do resultado: 1 = supervisora, 2 = auxiliar de supervisão. Usuário comum logado no site web não
   * recebe as linhas desses dois tipos (só o administrador, e quem chama sem login, como o desktop, as recebe).
   */
  personType?: number | null;
  /** Só no site web, para usuário comum: apurado escondido (assessedValue e percentageAchieved chegam null). */
  assessedHidden?: boolean;
  /** Idem para o prêmio (award chega null). */
  prizeHidden?: boolean;
}
interface CampaignTelesalesRowPerson {
  idPersonSales: number;
  operatorName: string;
  individualTarget: number;
  assessedValue: number;
  percentageAchieved: number;
  ranking: number;
  award: number;
}