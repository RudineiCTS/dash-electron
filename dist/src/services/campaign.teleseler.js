import { api } from "./api";
import dayjs from "dayjs";
export async function getCamapignTelesalerPerPeriod(date, signal) {
    const formattedDate = dayjs(date).format('YYYY-MM-DD');
    const response = await api.get(`campaign/period`, { params: { date: formattedDate }, signal });
    return response.data;
}
export async function getCampaignSummaryPerPeriod(date, signal) {
    const formateedDate = dayjs(date).format('YYYY-MM-DD');
    const response = await api.get('campaign-summary', { params: { competenceDateFrom: formateedDate }, signal });
    console.log(formateedDate);
    return response.data;
}
//# sourceMappingURL=campaign.teleseler.js.map