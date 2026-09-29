import { useCallback, useEffect, useState } from "react";
import { ResumoMetaTotalizador } from "../interfaces/ResumoMetaTotalizador";
import { getResumoMetaTotalizador } from "../services/resumoMetaTotalizador";

export function useResumoMetaTotalizador(dataFim: string | null) {
  const [resumo, setResumo] = useState<ResumoMetaTotalizador[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchResumo = useCallback(async (signal?: AbortSignal) => {
    if (dataFim === null) return;
    try {
      setLoading(true);
      setError("");
      const data = await getResumoMetaTotalizador(dataFim, signal);
      setResumo(data);
      console.log(data)
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError("Erro ao buscar o resumo de metas do totalizador");
    } finally {
      setLoading(false);
    }
  }, [dataFim]);

  useEffect(() => {
    const controller = new AbortController();
    fetchResumo(controller.signal);
    return () => controller.abort();
  }, [fetchResumo]);

  return { resumo, loading, error };
}
