import { useCallback, useEffect, useState } from "react";
import { getCampaignResumeSellOutDetailsById, getCampaignSummaryDetailsById } from "../services/campaign.teleseler";
import { CampaignResult } from "../interfaces/CampaignResultTelesales";
import { CampaignSalesRow } from "../interfaces/CampaignSalesRow";

export function useCampaignDetails(idCampaign:number){    
    const [campaignsDetails, setCampaignsDetails] = useState<CampaignResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [campaignResumeSellOut, setCampaignResumeSellOut] = useState<CampaignSalesRow[]>([]);
    const [loadingSellOut, setLoadingSellOut] = useState(false);
    const [errorSellOut, setErrorSellOut] = useState("");

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

    const fetchCampaignResumeSellOut = useCallback(async(signal?:AbortSignal) => {
      try {
        setLoadingSellOut(true);
        setErrorSellOut("")
        const data = await getCampaignResumeSellOutDetailsById(idCampaign!,signal);

        setCampaignResumeSellOut(data);
         } catch (err) {
        // Não trata erro de abort como erro real
        if (err instanceof Error && err.name === 'AbortError') return;

        setError(`Erro ao buscar Campanhas pelo período ${idCampaign}`);
      } finally {
        setLoading(false);
      }
      },[idCampaign])

    
    useEffect(() => {
      const controller = new AbortController();
      fetchCampaignDetails(controller.signal);
      return () => controller.abort(); // cancela se o efeito rodar de novo ou desmontar
    }, [fetchCampaignDetails]); // 👈 agora reage à mudança de data

    useEffect(() => {
      const controller = new AbortController();
      fetchCampaignResumeSellOut(controller.signal);
      return () => controller.abort(); // cancela se o efeito rodar de novo ou desmontar
    }, [fetchCampaignResumeSellOut]); // 👈 agora reage à mudança de data
 return {
    campaignsDetails,
    loading,
    error,
    fetchCampaignDetails,

    campaignResumeSellOut,
    loadingSellOut,
    errorSellOut,
    fetchCampaignResumeSellOut
  }
}