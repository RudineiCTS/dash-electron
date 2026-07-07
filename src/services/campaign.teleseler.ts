import { CampaignCompetencePeriod } from "src/interfaces/CampaignResume";
import { api } from "./api";
import dayjs from "dayjs";
import { CampaignSummary } from "../interfaces/CampaignSummary";

export async function getCamapignTelesalerPerPeriod(date: Date| string, signal?: AbortSignal): Promise<CampaignCompetencePeriod[]>{
    const formattedDate = dayjs(date).format('YYYY-MM-DD');
    const response = await api.get<CampaignCompetencePeriod[]>(
        `campaign/period`,
         {params: {date: formattedDate }, signal}
        );
    return response.data
}
export async function getCampaignSummaryPerPeriod(date:Date |string, signal?: AbortSignal):Promise<CampaignSummary[]>{
    const formateedDate = dayjs(date).format('YYYY-MM-DD');
    const response = await api.get<CampaignSummary[]>(
        'campaign-summary',
        {params:{competenceDateFrom:formateedDate}, signal}
    )
    console.log(formateedDate);
    return response.data
}
