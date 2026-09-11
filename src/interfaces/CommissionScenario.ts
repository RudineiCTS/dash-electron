export interface CommissionScenario {
    idScenario: number;
    scenarioDescription: string | null;
    idPeriodCompetence: number;
    startDate: string | null;
    endDate: string | null;
    idPeriodCompetenceStatus: number | null;
    periodCompetenceStatusDescription: string | null;
    sellerCount: number;
}

export interface CommissionScenarioCopyRequest {
    sourceScenarioId: number;
    newScenarioId: number;
    description: string;
    newPeriodCompetenceId: number;
    startDate: string;
    endDate: string;
}

export interface CommissionScenarioCopyResult {
    success: boolean;
    errorMessage: string | null;
}
