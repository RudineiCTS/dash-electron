import { SellOutMonthlyResponse, SellOutSummaryInterface, SellOutSummaryMonthly } from "../interfaces/sellOutSummaryType";
import { api} from "./api";




export async function getCamapignTelesalerSellOutSummaryMonthly(data: SellOutSummaryInterface , signal?: AbortSignal): Promise<SellOutSummaryMonthly[]>{
    const response = await api.post<SellOutSummaryMonthly[]>(
        `sellout-summary/monthly`,
         data,
         {signal}
        );
    return response.data as SellOutSummaryMonthly[]
}