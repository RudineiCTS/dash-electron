import { useCallback, useEffect, useState } from "react";
import { ComissaoVendasKpi } from "../interfaces/ComissaoVendasKpi";
import { getComissaoVendasKpi } from "../services/comissaoVendasKpi";

export function useComissaoVendasKpi(dataFim: string | null, reloadToken?: number) {
  const [kpis, setKpis] = useState<ComissaoVendasKpi[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchKpis = useCallback(async (signal?: AbortSignal) => {
    if (dataFim === null) return;
    try {
      setLoading(true);
      setError("");
      const data = await getComissaoVendasKpi(dataFim, signal);
      setKpis(data);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError("Erro ao buscar os KPIs de comissão de vendas");
    } finally {
      setLoading(false);
    }
  }, [dataFim]);

  useEffect(() => {
    const controller = new AbortController();
    fetchKpis(controller.signal);
    return () => controller.abort();
  }, [fetchKpis, reloadToken]);

  return { kpis, loading, error };
}
