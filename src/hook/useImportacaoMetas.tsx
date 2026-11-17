import { useCallback, useEffect, useMemo, useState } from "react";
import { CommissionScenario } from "../interfaces/CommissionScenario";
import { ImportacaoMetasRequest, ImportacaoMetasResultado } from "../interfaces/ImportacaoMetas";
import { LinhaPreview, ID_VENDEDOR_TOTALIZADOR } from "../components/ContentGeneral/SharedGeneral/PreviewTableImportacao";
import { gerarScriptProcesso, importarMetas } from "../services/importacaoMetas";
import { valoresSupervisaoSugeridos } from "../utils/gerarScriptNovaMeta";
import { formatarCampoBr, paraNumeroBr } from "../utils/numeroBr";

/** Mesmos padrões do processo manual (a API usa estes valores quando o campo vai vazio). */
export const PADRAO_SUPERVISORA = "112321"; // MICHELLI ROSA COSTA
export const PADRAO_AUXILIAR = "124609"; // THAIS APARECIDA MATHIAS
export const PADRAO_GERENTE = "28727"; // RODRIGO GOUVEIA ALDANA ARANDA

/** Situação 1 = ABERTO: só nela o processo aceita importar. */
export const SITUACAO_ABERTO = 1;

interface Opcoes {
  linhas: LinhaPreview[];
  cenarios: CommissionScenario[];
  /** Período (IDComissaoVendasPeriodoCompetencia) sugerido: o do cenário selecionado na aba "Copiar cenário". */
  periodoSugeridoId: number | null;
  /** O modal está aberto: só então a API é chamada. */
  ativo: boolean;
  onImportado?: () => void;
}

function inteiroOuNulo(texto: string): number | null {
  const t = texto.trim();
  return /^\d+$/.test(t) ? Number(t) : null;
}

export function useImportacaoMetas({ linhas, cenarios, periodoSugeridoId, ativo, onImportado }: Opcoes) {
  const sugeridos = useMemo(() => valoresSupervisaoSugeridos(linhas), [linhas]);

  const [periodoId, setPeriodoId] = useState<number | null>(
    () => periodoSugeridoId ?? cenarios.find((c) => c.idPeriodCompetenceStatus === SITUACAO_ABERTO)?.idPeriodCompetence ?? null
  );
  const [idSupervisor, setIdSupervisor] = useState(PADRAO_SUPERVISORA);
  const [idAuxiliar, setIdAuxiliar] = useState(PADRAO_AUXILIAR);
  const [idGerente, setIdGerente] = useState(PADRAO_GERENTE);
  const [lojaVirtual, setLojaVirtual] = useState(formatarCampoBr(sugeridos.metaLojaVirtual));
  const [setor, setSetor] = useState(formatarCampoBr(sugeridos.metaSetor));
  const [cobertura, setCobertura] = useState(formatarCampoBr(sugeridos.cobertura));

  const [script, setScript] = useState("");
  const [avisos, setAvisos] = useState<string[]>([]);
  const [carregandoScript, setCarregandoScript] = useState(false);
  const [erroScript, setErroScript] = useState("");

  const [executando, setExecutando] = useState<"simular" | "importar" | null>(null);
  const [resultado, setResultado] = useState<ImportacaoMetasResultado | null>(null);
  const [erroExecucao, setErroExecucao] = useState("");

  const periodo = cenarios.find((c) => c.idPeriodCompetence === periodoId) ?? null;
  const periodoAberto = periodo?.idPeriodCompetenceStatus === SITUACAO_ABERTO;

  const vendedores = useMemo(
    () =>
      linhas
        .filter((l) => l.idVendedor !== ID_VENDEDOR_TOTALIZADOR)
        .map((l) => ({
          idVendedor: l.idVendedor,
          metaLojaVirtual: l.metaLojaVirtual,
          metaSetor: l.metaSetor,
          metaCoberturaCarteira: l.cobertura,
        })),
    [linhas]
  );

  /** Pedido para a API, ou null enquanto faltar algo (período, IDs da equipe). */
  const montarPedido = useCallback(
    (simular: boolean): ImportacaoMetasRequest | null => {
      if (periodoId == null) return null;
      const sup = inteiroOuNulo(idSupervisor);
      const aux = inteiroOuNulo(idAuxiliar);
      const ger = inteiroOuNulo(idGerente);
      if (sup === null || aux === null || ger === null) return null;

      return {
        idPeriodoCompetencia: periodoId,
        idSupervisor: sup,
        idAssistenteSupervisor: aux,
        idGerente: ger,
        vendedores,
        supervisao: {
          metaLojaVirtual: paraNumeroBr(lojaVirtual),
          metaSetor: paraNumeroBr(setor),
          metaCoberturaCarteira: paraNumeroBr(cobertura),
        },
        simular,
      };
    },
    [periodoId, idSupervisor, idAuxiliar, idGerente, vendedores, lojaVirtual, setor, cobertura]
  );

  // o script mostrado é sempre o que a API montaria para os valores atuais da tela (com um pequeno atraso ao digitar)
  useEffect(() => {
    if (!ativo) return;

    const pedido = montarPedido(false);
    setResultado(null);
    setErroExecucao("");

    if (!pedido) {
      setScript("");
      setAvisos([]);
      setErroScript(periodoId == null ? "Escolha o período de competência." : "Informe IDs numéricos para a equipe.");
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setCarregandoScript(true);
      setErroScript("");
      try {
        const resposta = await gerarScriptProcesso(pedido, controller.signal);
        setScript(resposta.script);
        setAvisos(resposta.avisos);
      } catch (e) {
        if (controller.signal.aborted) return;
        setScript("");
        setAvisos([]);
        setErroScript(e instanceof Error ? e.message : "Erro ao montar o script do processo.");
      } finally {
        if (!controller.signal.aborted) setCarregandoScript(false);
      }
    }, 350);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [ativo, montarPedido, periodoId]);

  const executar = useCallback(
    async (simular: boolean) => {
      const pedido = montarPedido(simular);
      if (!pedido) return;

      setExecutando(simular ? "simular" : "importar");
      setErroExecucao("");
      setResultado(null);
      try {
        const retorno = await importarMetas(pedido);
        setResultado(retorno);
        if (!simular && retorno.sucesso) onImportado?.();
      } catch (e) {
        setErroExecucao(e instanceof Error ? e.message : "Erro ao importar as metas.");
      } finally {
        setExecutando(null);
      }
    },
    [montarPedido, onImportado]
  );

  return {
    periodoId,
    setPeriodoId,
    periodo,
    periodoAberto,
    idSupervisor,
    setIdSupervisor,
    idAuxiliar,
    setIdAuxiliar,
    idGerente,
    setIdGerente,
    lojaVirtual,
    setLojaVirtual,
    setor,
    setSetor,
    cobertura,
    setCobertura,
    vendedoresTotal: vendedores.length,
    script,
    avisos,
    carregandoScript,
    erroScript,
    executando,
    resultado,
    erroExecucao,
    executar,
  };
}
