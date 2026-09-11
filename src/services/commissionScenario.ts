import { CommissionScenario, CommissionScenarioCopyRequest, CommissionScenarioCopyResult } from "../interfaces/CommissionScenario";
import { api } from "./api";

export async function getCommissionScenarios(top = 10, signal?: AbortSignal): Promise<CommissionScenario[]> {
    const response = await api.get<CommissionScenario[]>("commission-scenario", { params: { top }, signal });
    return response.data;
}

export async function copyCommissionScenario(request: CommissionScenarioCopyRequest, signal?: AbortSignal): Promise<CommissionScenarioCopyResult> {
    try {
        const response = await api.post<CommissionScenarioCopyResult>("commission-scenario/copy", request, { signal });
        return response.data;
    } catch (err) {
        const axiosError = err as { response?: { data?: CommissionScenarioCopyResult } };
        if (axiosError.response?.data) {
            return axiosError.response.data;
        }
        throw err;
    }
}
