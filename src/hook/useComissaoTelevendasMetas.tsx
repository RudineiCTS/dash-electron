import { useCallback, useEffect, useState } from "react";
import { ComissaoTelevendasMeta } from "../interfaces/ComissaoTelevendasMeta";
import { getComissaoTelevendasMetas } from "../services/comissaoTelevendasMetas";

export function useComissaoTelevendasMetas(idCompetencia: number | null) {
  const [comissaoTelevendasMetas, setComissaoTelevendasMetas] = useState<ComissaoTelevendasMeta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchComissaoTelevendasMetas = useCallback(async (signal?: AbortSignal) => {
    if (idCompetencia === null) return;
    try {
      setLoading(true);
      setError("");
      const data = await getComissaoTelevendasMetas(idCompetencia, signal);
      console.log("Dados recebidos:", data); // Adicione este log para depuração
      setComissaoTelevendasMetas(data);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError("Erro ao buscar metas de comissão de televendas");
    } finally {
      setLoading(false);
    }
  }, [idCompetencia]);

  useEffect(() => {
    const controller = new AbortController();
    fetchComissaoTelevendasMetas(controller.signal);
    return () => controller.abort();
  }, [fetchComissaoTelevendasMetas]);

  return {
    comissaoTelevendasMetas,
    setComissaoTelevendasMetas,
    loading,
    error,
    setError,
  };
}
