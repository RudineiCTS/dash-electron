import {useCallback, useEffect, useState} from 'react'
import { getCamapignTelesalerPerPeriod } from '../services/campaign.teleseler'
import { CampaignCompetencePeriod } from 'src/interfaces/CampaignResume';

export function useCampaign(dateCompetency:string){
    const [campaigns, setCampaigns] = useState<CampaignCompetencePeriod[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchCampaign = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError("");

      const data = await getCamapignTelesalerPerPeriod(dateCompetency, signal);

      setCampaigns(data);
    } catch (err) {
      // Não trata erro de abort como erro real
      if (err instanceof Error && err.name === 'AbortError') return;

      setError(`Erro ao buscar Campanhas pelo período ${dateCompetency}`);
    } finally {
      setLoading(false);
    }
  }, [dateCompetency]); // 👈 recria a função só quando a data muda

  useEffect(() => {
    const controller = new AbortController();
    fetchCampaign(controller.signal);

    return () => controller.abort(); // cancela se o efeito rodar de novo ou desmontar
  }, [fetchCampaign]); // 👈 agora reage à mudança de data

  return {
    campaigns,
    loading,
    error,
    fetchCampaign,
  };
}