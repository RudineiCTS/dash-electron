import { useCallback, useEffect, useState } from "react";
import { CampaignConditioning } from "../interfaces/CampaignConditioning";
import { getCampaignConditioning } from "../services/campaignConditioning";

export function useCampaignConditioning(idCampaign: number) {
  const [conditioning, setConditioning] = useState<CampaignConditioning[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchConditioning = useCallback(async (signal?: AbortSignal) => {
    if (!idCampaign) return;
    try {
      setLoading(true);
      setError("");
      const data = await getCampaignConditioning(idCampaign, signal);
      setConditioning(data);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError("Erro ao buscar a campanha condicionante");
    } finally {
      setLoading(false);
    }
  }, [idCampaign]);

  useEffect(() => {
    const controller = new AbortController();
    fetchConditioning(controller.signal);
    return () => controller.abort();
  }, [fetchConditioning]);

  return {
    conditioning,
    loading,
    error,
    setError,
  };
}
