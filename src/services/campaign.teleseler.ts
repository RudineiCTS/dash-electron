import { CampaignCompetencePeriod } from "src/interfaces/CampaignResume";
import { api } from "./api";
import dayjs from "dayjs";
import { CampaignSummary } from "../interfaces/CampaignSummary";
import { CampaignResult } from "../interfaces/CampaignResultTelesales";
import { CampaignSalesRow } from "../interfaces/CampaignSalesRow";

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
export async function getCampaignSummaryDetailsById(idCampaign:number, signal?: AbortSignal):Promise<CampaignResult[]>{
    const response = await api.get<CampaignResult[]>(
        `campaign-summary/details/${idCampaign}`,
        {   signal   }
    );
    return response.data;

}

export async function getCampaignResumeSellOutDetailsById(idCampaign:number, signal?: AbortSignal):Promise<CampaignSalesRow[]>{
    const response = await api.get<CampaignSalesRow[]>(
        `campaign-resume-sellout/${idCampaign}`,
        {   signal   }
    );
    return response.data;

}