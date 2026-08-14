import { DynamicReportRequest, DynamicReportResponse } from "../interfaces/DynamicReport";
import { api } from "./api";

export async function getDynamicReport(data: DynamicReportRequest, signal?: AbortSignal): Promise<DynamicReportResponse> {
    const response = await api.post<DynamicReportResponse>(
        `dynamic-report`,
        data,
        { signal }
    );
    return response.data as DynamicReportResponse;
}
