import { useCallback, useEffect, useState } from 'react';
import { getCamapignTelesalerPerPeriod, getCampaignSummaryPerPeriod } from '../services/campaign.teleseler';
export function useCampaign(dateCompetency, dateSummary) {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    // Estado do resumo
    const [summary, setSummary] = useState([]);
    const [loadingSummary, setLoadingSummary] = useState(false);
    const [errorSummary, setErrorSummary] = useState("");
    const fetchCampaign = useCallback(async (signal) => {
        try {
            setLoading(true);
            setError("");
            const data = await getCamapignTelesalerPerPeriod(dateCompetency, signal);
            setCampaigns(data);
        }
        catch (err) {
            // Não trata erro de abort como erro real
            if (err instanceof Error && err.name === 'AbortError')
                return;
            setError(`Erro ao buscar Campanhas pelo período ${dateCompetency}`);
        }
        finally {
            setLoading(false);
        }
    }, [dateCompetency]); // 👈 recria a função só quando a data muda
    const fetchSummary = useCallback(async (signal) => {
        try {
            setLoadingSummary(true);
            setErrorSummary("");
            const data = await getCampaignSummaryPerPeriod(dateSummary, signal);
            setSummary(data);
        }
        catch (err) {
            if (err instanceof Error && err.name === 'AbortError')
                return;
            setErrorSummary(`Erro ao buscar resumo a partir de ${dateSummary}`);
        }
        finally {
            setLoadingSummary(false);
        }
    }, [dateSummary]);
    useEffect(() => {
        const controller = new AbortController();
        fetchCampaign(controller.signal);
        return () => controller.abort(); // cancela se o efeito rodar de novo ou desmontar
    }, [fetchCampaign]); // 👈 agora reage à mudança de data
    useEffect(() => {
        const controller = new AbortController();
        fetchSummary(controller.signal);
        return () => controller.abort();
    }, [fetchSummary]);
    return {
        campaigns,
        loading,
        error,
        fetchCampaign,
        summary,
        loadingSummary,
        errorSummary,
        fetchSummary
    };
}
//# sourceMappingURL=useCampaign.js.map