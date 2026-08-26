import { useCallback, useEffect, useState } from "react";
import { CampaignRegistration, CampaignRegistrationFilter } from "../interfaces/CampaignRegistration";
import { getCampaignRegistrations } from "../services/campaignRegistration.teleseler";

export function useCampaignRegistration(filter: CampaignRegistrationFilter | null) {
  const [campaignRegistrations, setCampaignRegistrations] = useState<CampaignRegistration[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchCampaignRegistrations = useCallback(async (signal?: AbortSignal) => {
    if (!filter) return;
    try {
      setLoading(true);
      setError("");
      const data = await getCampaignRegistrations(filter, signal);
      setCampaignRegistrations(data);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError("Erro ao buscar campanhas recebidas");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    const controller = new AbortController();
    fetchCampaignRegistrations(controller.signal);
    return () => controller.abort();
  }, [fetchCampaignRegistrations]);

  return {
    campaignRegistrations,
    setCampaignRegistrations,
    loading,
    error,
    setError,
  };
}
