import { useCallback, useEffect, useState } from "react";
import { ImportacaoMetasTotais } from "../interfaces/ImportacaoMetas";
import { obterTotaisMetas } from "../services/importacaoMetas";

/** Totais de meta (loja virtual, setor e cobertura) do período, na linha do totalizador. */
export function useTotaisMetas(periodoId: number | null) {
  const [totais, setTotais] = useState<ImportacaoMetasTotais | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    if (periodoId == null || periodoId <= 0) {
      setTotais(null);
      setErro("");
      return;
    }

    const controller = new AbortController();
    setCarregando(true);
    setErro("");

    obterTotaisMetas(periodoId, controller.signal)
      .then((dados) => setTotais(dados))
      .catch((e) => {
        if (controller.signal.aborted) return;
        setTotais(null);
        setErro(e instanceof Error ? e.message : "Erro ao buscar os totais de metas.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setCarregando(false);
      });

    return () => controller.abort();
  }, [periodoId, versao]);

  const recarregar = useCallback(() => setVersao((v) => v + 1), []);

  return { totais, carregando, erro, recarregar };
}
