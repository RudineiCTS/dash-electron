import { useCallback, useEffect, useMemo, useState } from "react";
import { ImportacaoExclusivasRequest, ImportacaoMetasResultado } from "../interfaces/ImportacaoMetas";
import { gerarScriptExclusivas, importarExclusivas } from "../services/importacaoMetas";
import { formatarCampoBr, paraNumeroBr } from "../utils/numeroBr";

/** Tipos de pessoa que o script das exclusivas sabe importar (mesma lista do script). */
export const TIPOS_EXCLUSIVAS: { id: number; nome: string }[] = [
  { id: 2, nome: "Televendas SAC" },
  { id: 10, nome: "Televendas GC" },
  { id: 11, nome: "Televendas Johnson & Johnson" },
  { id: 12, nome: "Televendas Nestlé" },
  { id: 13, nome: "Televendas P&G" },
  { id: 14, nome: "Digitadoras" },
  { id: 19, nome: "Televendas Haleon" },
  { id: 20, nome: "Televendas Prospecção" },
  { id: 21, nome: "Televendas Flora" },
  { id: 22, nome: "Televendas Reckitt" },
  { id: 23, nome: "Televendas Ontex" },
  { id: 28, nome: "Televendas Boticário" },
  { id: 34, nome: "Televendas Institucional" },
];

function inteiro(texto: string): number | null {
  const t = texto.trim();
  return /^\d+$/.test(t) ? Number(t) : null;
}

interface Opcoes {
  periodoId: number | null;
  cenarioId: number | null;
  /** Chamado depois que as metas foram gravadas de verdade (não no teste). */
  onImportado?: () => void;
}

/*
 * Valores padrão = os do script manual (seção DECLARE):
 *   @INbitValoresGarantidos = 1, @INbitPremioLojaVirtual = 0, @INbitGatilhoVenda = 1,
 *   @INnumMinimoGarantido = 1700.00, @INnumGanhoMaximo = 0.00, @INnumGatilhoVenda = 100.00,
 *   @INnumMetaVenda = 3200000.00, @INintMetaPositivacao = 0, @INintMinimoPositivacao = 0, @INIntTipoPessoa = 34
 */
export function useImportacaoExclusivas({ periodoId, cenarioId, onImportado }: Opcoes) {
  const [tipoPessoa, setTipoPessoa] = useState(34);
  const [idSupervisor, setIdSupervisor] = useState("112321");
  const [idGerente, setIdGerente] = useState("28727");
  const [valoresGarantidos, setValoresGarantidos] = useState(true);
  const [premioLojaVirtual, setPremioLojaVirtual] = useState(false);
  const [gatilhoVenda, setGatilhoVenda] = useState(true);
  const [minimoGarantido, setMinimoGarantido] = useState(formatarCampoBr(1700));
  const [ganhoMaximo, setGanhoMaximo] = useState(formatarCampoBr(0));
  const [valorGatilho, setValorGatilho] = useState(formatarCampoBr(100));
  const [metaVenda, setMetaVenda] = useState(formatarCampoBr(3200000));
  const [metaPositivacao, setMetaPositivacao] = useState("0");
  const [minimoPositivacao, setMinimoPositivacao] = useState("0");

  const [script, setScript] = useState("");
  /** O usuário mexeu no texto: mudar as variáveis não sobrescreve mais o script até pedir para restaurar. */
  const [editado, setEditado] = useState(false);
  const [carregandoScript, setCarregandoScript] = useState(false);
  const [erroScript, setErroScript] = useState("");
  const [restaurar, setRestaurar] = useState(0);

  const [executando, setExecutando] = useState<"simular" | "importar" | null>(null);
  const [resultado, setResultado] = useState<ImportacaoMetasResultado | null>(null);
  const [erroExecucao, setErroExecucao] = useState("");

  const variaveis = useMemo((): ImportacaoExclusivasRequest | null => {
    if (periodoId == null || periodoId <= 0) return null;
    const sup = inteiro(idSupervisor);
    const ger = inteiro(idGerente);
    const posit = inteiro(metaPositivacao);
    const minPosit = inteiro(minimoPositivacao);
    if (sup === null || ger === null || posit === null || minPosit === null) return null;

    return {
      idPeriodoCompetencia: periodoId,
      idCenario: cenarioId ?? periodoId,
      idTipoPessoa: tipoPessoa,
      idSupervisor: sup,
      idGerente: ger,
      valoresGarantidos,
      premioLojaVirtual,
      gatilhoVenda,
      minimoGarantido: paraNumeroBr(minimoGarantido),
      ganhoMaximo: paraNumeroBr(ganhoMaximo),
      valorGatilhoVenda: paraNumeroBr(valorGatilho),
      metaVenda: paraNumeroBr(metaVenda),
      metaPositivacao: posit,
      minimoPositivacao: minPosit,
    };
  }, [
    periodoId, cenarioId, tipoPessoa, idSupervisor, idGerente, valoresGarantidos, premioLojaVirtual, gatilhoVenda,
    minimoGarantido, ganhoMaximo, valorGatilho, metaVenda, metaPositivacao, minimoPositivacao,
  ]);

  // o script acompanha as variáveis (com um pequeno atraso ao digitar), enquanto o usuário não o editar
  useEffect(() => {
    if (editado) return;

    if (!variaveis) {
      setScript("");
      setErroScript(periodoId == null ? "Escolha o período de competência." : "Informe valores numéricos nos campos de ID e positivação.");
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setCarregandoScript(true);
      setErroScript("");
      try {
        const resposta = await gerarScriptExclusivas(variaveis, controller.signal);
        setScript(resposta.script);
      } catch (e) {
        if (controller.signal.aborted) return;
        setScript("");
        setErroScript(e instanceof Error ? e.message : "Erro ao montar o script.");
      } finally {
        if (!controller.signal.aborted) setCarregandoScript(false);
      }
    }, 350);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [variaveis, editado, restaurar, periodoId]);

  // trocar período/cenário/variáveis invalida o resultado anterior
  useEffect(() => {
    setResultado(null);
    setErroExecucao("");
  }, [variaveis, script]);

  const alterarScript = useCallback((texto: string) => {
    setScript(texto);
    setEditado(true);
  }, []);

  const restaurarScript = useCallback(() => {
    setEditado(false);
    setRestaurar((n) => n + 1);
  }, []);

  const executar = useCallback(
    async (simular: boolean) => {
      if (periodoId == null || !script.trim()) return;

      setExecutando(simular ? "simular" : "importar");
      setErroExecucao("");
      setResultado(null);
      try {
        const retorno = await importarExclusivas({ idPeriodoCompetencia: periodoId, script, simular });
        setResultado(retorno);
        if (!simular && retorno.sucesso) onImportado?.();
      } catch (e) {
        setErroExecucao(e instanceof Error ? e.message : "Erro ao importar as metas.");
      } finally {
        setExecutando(null);
      }
    },
    [periodoId, script, onImportado]
  );

  return {
    tipoPessoa, setTipoPessoa,
    idSupervisor, setIdSupervisor,
    idGerente, setIdGerente,
    valoresGarantidos, setValoresGarantidos,
    premioLojaVirtual, setPremioLojaVirtual,
    gatilhoVenda, setGatilhoVenda,
    minimoGarantido, setMinimoGarantido,
    ganhoMaximo, setGanhoMaximo,
    valorGatilho, setValorGatilho,
    metaVenda, setMetaVenda,
    metaPositivacao, setMetaPositivacao,
    minimoPositivacao, setMinimoPositivacao,
    script,
    alterarScript,
    editado,
    restaurarScript,
    carregandoScript,
    erroScript,
    executando,
    resultado,
    erroExecucao,
    executar,
  };
}
