import {useCallback, useEffect, useState} from 'react'
import { getCamapignTelesalerPerPeriod, getCampaignSummaryPerPeriod } from '../services/campaign.teleseler'
import { CampaignCompetencePeriod } from '../interfaces/CampaignResume';
import { CampaignSummary } from '../interfaces/CampaignSummary';
import { campaignSummaryMock } from '../mock/campaignSummary';

interface typeUseCampaign {
  dateCompetency?:string,
  dateSummary?:string
}

function computeTotalCard(data: CampaignSummary[]) {
  return data.reduce((acc, item) => ({
    totalMeta: acc.totalMeta + item.goalValue,
    totalValor: acc.totalValor + item.assessedValue,
    premiacaoTotal: acc.premiacaoTotal + item.totalAward,
    totalValorBess: acc.totalValorBess + item.assessedValueBees!,
    percentTotal: 0
  }), {
    totalMeta: 0,
    totalValor: 0,
    totalValorBess:0,
    premiacaoTotal: 0,
    percentTotal: 0
  });
}
export function useCampaign({dateCompetency,dateSummary}:typeUseCampaign){    
    const [campaigns, setCampaigns] = useState<CampaignCompetencePeriod[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
      // Estado do resumo
    const [summary, setSummary] = useState<CampaignSummary[]>([]);
    const [loadingSummary, setLoadingSummary] = useState(false);
    const [errorSummary, setErrorSummary] = useState("");
    const [totalCard, setTotalCard] = useState({totalMeta:0,          totalValor:0,          premiacaoTotal:0,          percentTotal:0, totalValorBess:0})

    const fetchCampaign = useCallback(async (signal?: AbortSignal) => {
      try {
        setLoading(true);
        setError("");

        const data = await getCamapignTelesalerPerPeriod(dateCompetency!, signal);

        setCampaigns(data);
      } catch (err) {
        // Não trata erro de abort como erro real
        if (err instanceof Error && err.name === 'AbortError') return;

        setError(`Erro ao buscar Campanhas pelo período ${dateCompetency}`);
      } finally {
        setLoading(false);
      }
    }, [dateCompetency]); // 👈 recria a função só quando a data muda


    const fetchSummary = useCallback(async (signal?:AbortSignal)=>{
     try {
        setLoadingSummary(true);
        setErrorSummary("");

        const data = await getCampaignSummaryPerPeriod(dateSummary!, signal);
        setSummary(data);
        setTotalCard(computeTotalCard(data));
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;

        // API indisponível (ex: backend desligado em dev) -> cai para dados mockados.
        console.warn(`Falha ao buscar resumo a partir de ${dateSummary}, usando dados de exemplo.`, err);
        setErrorSummary(`Erro ao buscar resumo a partir de ${dateSummary} — exibindo dados de exemplo`);
        setSummary(campaignSummaryMock);
        setTotalCard(computeTotalCard(campaignSummaryMock));
      } finally {
        setLoadingSummary(false);
    }
    }, [dateSummary])

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
    fetchSummary,
    totalCard
  };
}