import { useCallback, useEffect, useState } from "react";
import { getCampaignSummaryDetailsById } from "src/services/campaign.teleseler";

export function useCampaignDetails(idCampaign:number){    
    const [campaignsDetails, setCampaignsDetails] = useState<CampaignResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchCampaignDetails = useCallback(async (signal?: AbortSignal) => {
      try {
        setLoading(true);
        setError("");

        const data = await getCampaignSummaryDetailsById(idCampaign!, signal);

        setCampaignsDetails(data);
      } catch (err) {
        // Não trata erro de abort como erro real
        if (err instanceof Error && err.name === 'AbortError') return;

        setError(`Erro ao buscar Campanhas pelo período ${idCampaign}`);
      } finally {
        setLoading(false);
      }
    }, [idCampaign]);

    
    useEffect(() => {
      const controller = new AbortController();
      fetchCampaignDetails(controller.signal);
      return () => controller.abort(); // cancela se o efeito rodar de novo ou desmontar
    }, [fetchCampaignDetails]); // 👈 agora reage à mudança de data
 return {
    campaignsDetails,
    loading,
    error,
    fetchCampaignDetails
  }
}