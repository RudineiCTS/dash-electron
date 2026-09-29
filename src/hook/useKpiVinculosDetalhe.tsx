import { useCallback, useEffect, useState } from "react";
import { KpiVinculosDetalhe } from "../interfaces/KpiVinculo";
import { getKpiVinculosDetalhe } from "../services/comissaoVendasKpiVinculos";

export function useKpiVinculosDetalhe(idComissaoVendasKpi: number | null) {
  const [detalhe, setDetalhe] = useState<KpiVinculosDetalhe | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchDetalhe = useCallback(async (signal?: AbortSignal) => {
    if (idComissaoVendasKpi === null) return;
    try {
      setLoading(true);
      setError("");
      const data = await getKpiVinculosDetalhe(idComissaoVendasKpi, signal);
      setDetalhe(data);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError("Erro ao buscar os vínculos do KPI");
    } finally {
      setLoading(false);
    }
  }, [idComissaoVendasKpi]);

  useEffect(() => {
    const controller = new AbortController();
    fetchDetalhe(controller.signal);
    return () => controller.abort();
  }, [fetchDetalhe]);

  return { detalhe, loading, error };
}
