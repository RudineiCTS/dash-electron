import { CampaignCompetencePeriod } from "src/interfaces/CampaignResume";
import { api } from "./api";
import dayjs from "dayjs";

export async function getCamapignTelesalerPerPeriod(date: Date| string, signal?: AbortSignal): Promise<CampaignCompetencePeriod[]>{
    const formattedDate = dayjs(date).format('YYYY-MM-DD');
    const response = await api.get<CampaignCompetencePeriod[]>(
        `campaign/period`,
         {params: {date: formattedDate }, signal}
        );
    return response.data
}
