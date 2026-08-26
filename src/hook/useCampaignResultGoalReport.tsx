import { useCallback, useEffect, useState } from "react";
import { CampaignResultGoalReport, CampaignResultGoalReportFilter } from "../interfaces/CampaignResultGoalReport";
import { getCampaignResultGoalReport } from "../services/campaignResultGoalReport.teleseler";

export function useCampaignResultGoalReport(filter: CampaignResultGoalReportFilter | null) {
  const [campaignResultGoalReport, setCampaignResultGoalReport] = useState<CampaignResultGoalReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchCampaignResultGoalReport = useCallback(async (signal?: AbortSignal) => {
    if (!filter) return;
    try {
      setLoading(true);
      setError("");
      const data = await getCampaignResultGoalReport(filter, signal);
      setCampaignResultGoalReport(data);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError("Erro ao buscar histórico de campanhas");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    const controller = new AbortController();
    fetchCampaignResultGoalReport(controller.signal);
    return () => controller.abort();
  }, [fetchCampaignResultGoalReport]);

  return {
    campaignResultGoalReport,
    setCampaignResultGoalReport,
    loading,
    error,
    setError,
  };
}
