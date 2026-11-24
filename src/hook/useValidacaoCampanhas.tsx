import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PedidosCarregados, ResultadoValidacao } from "../interfaces/ValidacaoCampanha";
import { listarPedidosValidacao, listarResultadosValidacao } from "../services/validacaoCampanha";
import { agruparCampanhas, temDetalhePedidos } from "../utils/validacaoCampanhas";

function abortou(e: unknown): boolean {
  return e instanceof Error && (e.name === "AbortError" || e.name === "CanceledError");
}

/** Chave de uma linha dentro da campanha: a posição na lista da campanha (estável mesmo com filtros e busca). */
export const chaveLinha = (indice: number) => String(indice);

/**
 * Validação das campanhas da competência: carrega o resultado calculado de todas, deixa escolher uma campanha e
 * busca os pedidos de uma pessoa só quando a linha dela é aberta.
 *
 * @param dataCompetencia último dia do mês (AAAA-MM-DD).
 */
export function useValidacaoCampanhas(dataCompetencia: string) {
  const [resultados, setResultados] = useState<ResultadoValidacao[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  const [idCampanhaEscolhida, setIdCampanhaEscolhida] = useState<number | null>(null);
  const [abertaKey, setAbertaKey] = useState<string | null>(null);
  const [pedidosPorPessoa, setPedidosPorPessoa] = useState<Record<string, PedidosCarregados>>({});
  // cada busca de pedidos tem um id; resposta de uma busca antiga (outra competência/campanha) é descartada
  const geracao = useRef(0);

  useEffect(() => {
    geracao.current += 1;
    setResultados([]);
    setAbertaKey(null);
    setPedidosPorPessoa({});
    setError("");

    const controller = new AbortController();
    setLoading(true);
    listarResultadosValidacao(dataCompetencia, controller.signal)
      .then(setResultados)
      .catch((e) => {
        if (!abortou(e)) setError("Erro ao buscar os resultados das campanhas da competência.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [dataCompetencia, attempt]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);

  const campanhas = useMemo(() => agruparCampanhas(resultados), [resultados]);

  /** Campanha mostrada: a escolhida, se ainda existe na competência; senão a primeira. */
  const idCampanha = useMemo(
    () => (campanhas.some((c) => c.idCampanha === idCampanhaEscolhida) ? idCampanhaEscolhida : (campanhas[0]?.idCampanha ?? null)),
    [campanhas, idCampanhaEscolhida]
  );

  const campanha = useMemo(() => campanhas.find((c) => c.idCampanha === idCampanha) ?? null, [campanhas, idCampanha]);

  /** Linhas da campanha mostrada, na ordem da API. */
  const linhas = useMemo(() => resultados.filter((r) => r.idCampanha === idCampanha), [resultados, idCampanha]);

  const escolherCampanha = useCallback((id: number) => {
    setIdCampanhaEscolhida(id);
    setAbertaKey(null);
  }, []);

  const carregarPedidos = useCallback((r: ResultadoValidacao) => {
    if (r.idPessoa == null) return;
    const chave = `${r.idCampanha}|${r.idPessoa}`;
    const minhaGeracao = geracao.current;

    setPedidosPorPessoa((prev) => {
      // já carregado (ou carregando): não busca de novo; só repete se deu erro
      if (prev[chave] && !prev[chave].erro) return prev;
      return { ...prev, [chave]: { loading: true, erro: "", pedidos: [] } };
    });

    listarPedidosValidacao(r.idCampanha, r.idPessoa)
      .then((pedidos) => {
        if (geracao.current === minhaGeracao) setPedidosPorPessoa((prev) => ({ ...prev, [chave]: { loading: false, erro: "", pedidos } }));
      })
      .catch(() => {
        if (geracao.current === minhaGeracao) {
          setPedidosPorPessoa((prev) => ({
            ...prev,
            [chave]: { loading: false, erro: "Erro ao buscar os pedidos desta pessoa.", pedidos: [] },
          }));
        }
      });
  }, []);

  /** Abre (ou fecha) a linha; ao abrir uma pessoa com pedidos, busca os pedidos dela. */
  const alternarLinha = useCallback(
    (indice: number) => {
      const chave = chaveLinha(indice);
      if (abertaKey === chave) {
        setAbertaKey(null);
        return;
      }
      setAbertaKey(chave);
      const linha = linhas[indice];
      if (linha && temDetalhePedidos(linha)) {
        const carregado = pedidosPorPessoa[`${linha.idCampanha}|${linha.idPessoa}`];
        if (!carregado || carregado.erro) carregarPedidos(linha);
      }
    },
    [abertaKey, linhas, pedidosPorPessoa, carregarPedidos]
  );

  const tentarPedidosDeNovo = useCallback(
    (r: ResultadoValidacao) => carregarPedidos(r),
    [carregarPedidos]
  );

  return {
    resultados,
    loading,
    error,
    retry,
    campanhas,
    campanha,
    idCampanha,
    escolherCampanha,
    linhas,
    abertaKey,
    alternarLinha,
    pedidosPorPessoa,
    tentarPedidosDeNovo,
  };
}
