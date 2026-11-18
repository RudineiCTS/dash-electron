import { useCallback, useEffect, useState } from "react";
import { CalculoComissaoResultado, CalculoComissaoTipoPessoa } from "../interfaces/CalculoComissao";
import { executarCalculoComissao, listarTiposPessoaComissao } from "../services/calculoComissao";

/** Tipos de pessoa do Televendas: os mesmos do exemplo da procedure (uspUsuCalculaComissaoVendas 107, 1, 0, '', '2,8,...'). */
export const TIPOS_PADRAO_TELEVENDAS = [2, 8, 9, 10, 11, 12, 13, 14, 15, 19, 20, 21, 23, 28, 34];

/** Situações do período em que a procedure aceita calcular: LIBERADO e SIMULACAO. */
export const SITUACOES_QUE_CALCULAM = [2, 6];

export type ModoExecucao = "consultar" | "testar" | "calcular";

interface Opcoes {
  periodoId: number | null;
  /** Chamado depois que o cálculo foi gravado de verdade (não na consulta nem no teste). */
  onCalculado?: () => void;
}

export function useCalculoComissao({ periodoId, onCalculado }: Opcoes) {
  const [tipos, setTipos] = useState<CalculoComissaoTipoPessoa[]>([]);
  const [erroTipos, setErroTipos] = useState("");
  const [tipoComissao, setTipoComissao] = useState(0);
  const [idPessoas, setIdPessoas] = useState("");
  const [tipoPessoas, setTipoPessoas] = useState<number[]>(TIPOS_PADRAO_TELEVENDAS);

  const [executando, setExecutando] = useState<ModoExecucao | null>(null);
  const [resultado, setResultado] = useState<CalculoComissaoResultado | null>(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    listarTiposPessoaComissao(controller.signal)
      .then(setTipos)
      .catch((e) => {
        if (!controller.signal.aborted) setErroTipos(e instanceof Error ? e.message : "Erro ao buscar os tipos de pessoa.");
      });
    return () => controller.abort();
  }, []);

  // trocar de período invalida o resultado mostrado
  useEffect(() => {
    setResultado(null);
    setErro("");
  }, [periodoId]);

  const alternarTipo = useCallback((id: number) => {
    setTipoPessoas((atual) => (atual.includes(id) ? atual.filter((t) => t !== id) : [...atual, id].sort((a, b) => a - b)));
  }, []);

  const executar = useCallback(
    async (modo: ModoExecucao) => {
      if (periodoId == null) return;

      setExecutando(modo);
      setErro("");
      setResultado(null);
      try {
        const retorno = await executarCalculoComissao({
          idPeriodoCompetencia: periodoId,
          calcular: modo !== "consultar",
          tipoComissao,
          idPessoas: idPessoas.trim(),
          tipoPessoas,
          simular: modo === "testar",
        });
        setResultado(retorno);
        if (modo === "calcular" && retorno.sucesso) onCalculado?.();
      } catch (e) {
        setErro(e instanceof Error ? e.message : "Erro ao executar o cálculo.");
      } finally {
        setExecutando(null);
      }
    },
    [periodoId, tipoComissao, idPessoas, tipoPessoas, onCalculado]
  );

  return {
    tipos,
    erroTipos,
    tipoComissao,
    setTipoComissao,
    idPessoas,
    setIdPessoas,
    tipoPessoas,
    setTipoPessoas,
    alternarTipo,
    executando,
    resultado,
    erro,
    executar,
  };
}
