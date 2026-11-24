import { useCallback, useEffect, useMemo, useState } from "react";
import { CampanhaComercial, CampanhaComercialForm, CampanhaComercialOpcoes } from "../interfaces/CampanhaComercial";
import {
  atualizarCampanhaComercial,
  buscarOpcoesCampanhaComercial,
  buscarResultadoCampanhaComercial,
  calcularCampanhaComercial,
  listarCampanhasComerciais,
} from "../services/campanhaComercial";
import { formParaApi, formsIguais, paraForm, validarForm } from "../utils/campanhaComercialForm";
import { exportCampanhaComercialResultadoToExcel } from "../utils/excelExport";
import { podeCalcular } from "../utils/resumoCampanhasComerciais";

const OPCOES_VAZIAS: CampanhaComercialOpcoes = {
  situacoes: [],
  tiposApuracao: [],
  tiposCalculo: [],
  tiposValor: [],
  tiposMeta: [],
};

export interface MensagemTela {
  tipo: "ok" | "erro";
  texto: string;
}

/** Andamento do cálculo em lote: a campanha `id` é a `atual` de `total`. */
export interface ProgressoCalculo {
  atual: number;
  total: number;
  id: number;
}

function abortou(e: unknown): boolean {
  return e instanceof Error && (e.name === "AbortError" || e.name === "CanceledError");
}

function mensagemDoErro(e: unknown, padrao: string): string {
  return e instanceof Error && e.message ? e.message : padrao;
}

/**
 * Campanhas comerciais da competência: lista, seleção para cálculo, edição de uma campanha por vez
 * (`editandoId` + `form`), cálculo em lote e exportação do resultado.
 *
 * @param dataCompetencia último dia do mês (AAAA-MM-DD); null = nada selecionado.
 */
export function useCampanhasComerciais(dataCompetencia: string | null) {
  const [campanhas, setCampanhas] = useState<CampanhaComercial[]>([]);
  const [opcoes, setOpcoes] = useState<CampanhaComercialOpcoes>(OPCOES_VAZIAS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [form, setForm] = useState<CampanhaComercialForm | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState("");

  const [selecionadasIds, setSelecionadasIds] = useState<number[]>([]);
  const [progresso, setProgresso] = useState<ProgressoCalculo | null>(null);
  const [exportandoId, setExportandoId] = useState<number | null>(null);
  const [mensagem, setMensagem] = useState<MensagemTela | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    buscarOpcoesCampanhaComercial(controller.signal)
      .then(setOpcoes)
      .catch((e) => {
        if (!abortou(e)) setError("Erro ao carregar os cadastros usados na edição das campanhas.");
      });
    return () => controller.abort();
  }, [attempt]);

  useEffect(() => {
    // trocar de mês fecha a edição (a tela avisa antes, se houver alteração não salva) e limpa a seleção
    setEditandoId(null);
    setForm(null);
    setErroForm("");
    setMensagem(null);
    setSelecionadasIds([]);
    setCampanhas([]);
    if (!dataCompetencia) return;

    const controller = new AbortController();
    setLoading(true);
    setError("");
    listarCampanhasComerciais(dataCompetencia, controller.signal)
      .then(setCampanhas)
      .catch((e) => {
        if (!abortou(e)) setError("Erro ao buscar as campanhas da competência.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [dataCompetencia, attempt]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);

  // ── seleção para cálculo ──

  /** Campanhas marcadas que ainda existem na lista e podem ser calculadas, na ordem da lista. */
  const selecionadas = useMemo(
    () => campanhas.filter((c) => selecionadasIds.includes(c.idCampanhaComercial) && podeCalcular(c)),
    [campanhas, selecionadasIds]
  );

  const alternarSelecao = useCallback((id: number) => {
    setSelecionadasIds((atual) => (atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id]));
  }, []);

  const adicionarSelecao = useCallback((id: number) => {
    setSelecionadasIds((atual) => (atual.includes(id) ? atual : [...atual, id]));
  }, []);

  const removerSelecao = useCallback((id: number) => {
    setSelecionadasIds((atual) => atual.filter((x) => x !== id));
  }, []);

  /** Marca todas as `ids` (união com o que já estava marcado). */
  const selecionarVarias = useCallback((ids: number[]) => {
    setSelecionadasIds((atual) => [...new Set([...atual, ...ids])]);
  }, []);

  /** Desmarca as `ids`. */
  const desselecionarVarias = useCallback((ids: number[]) => {
    setSelecionadasIds((atual) => atual.filter((x) => !ids.includes(x)));
  }, []);

  const limparSelecao = useCallback(() => setSelecionadasIds([]), []);

  // ── edição ──

  const campanhaEditando = useMemo(
    () => campanhas.find((c) => c.idCampanhaComercial === editandoId) ?? null,
    [campanhas, editandoId]
  );

  /** A linha aberta tem alteração ainda não salva. */
  const alterada = useMemo(
    () => !!form && !!campanhaEditando && !formsIguais(form, paraForm(campanhaEditando)),
    [form, campanhaEditando]
  );

  const abrir = useCallback((c: CampanhaComercial) => {
    setEditandoId(c.idCampanhaComercial);
    setForm(paraForm(c));
    setErroForm("");
    setMensagem(null);
  }, []);

  const fechar = useCallback(() => {
    setEditandoId(null);
    setForm(null);
    setErroForm("");
  }, []);

  const alterar = useCallback(<K extends keyof CampanhaComercialForm>(campo: K, valor: CampanhaComercialForm[K]) => {
    setForm((atual) => (atual ? { ...atual, [campo]: valor } : atual));
    setErroForm("");
  }, []);

  const salvar = useCallback(async () => {
    if (editandoId == null || !form) return;

    const problema = validarForm(form);
    if (problema) {
      setErroForm(problema);
      return;
    }

    setSalvando(true);
    try {
      const salva = await atualizarCampanhaComercial(editandoId, formParaApi(form));
      setCampanhas((prev) => prev.map((c) => (c.idCampanhaComercial === editandoId ? salva : c)));
      setMensagem({ tipo: "ok", texto: `Campanha ${editandoId} salva.` });
      fechar();
    } catch (e) {
      setErroForm(mensagemDoErro(e, "Erro ao salvar a campanha."));
    } finally {
      setSalvando(false);
    }
  }, [editandoId, form, fechar]);

  // ── cálculo ──

  /**
   * Calcula as campanhas selecionadas, uma de cada vez (a procedure usa tabelas de trabalho compartilhadas, então
   * nunca em paralelo). Segue para a próxima mesmo se uma falhar; no fim resume o que deu certo e o que falhou.
   */
  const calcularSelecionadas = useCallback(async () => {
    const alvo = selecionadas.map((c) => c.idCampanhaComercial);
    if (alvo.length === 0) return;

    setMensagem(null);
    const falhas: string[] = [];
    let calculadas = 0;

    for (let i = 0; i < alvo.length; i++) {
      const id = alvo[i];
      setProgresso({ atual: i + 1, total: alvo.length, id });
      try {
        const calculada = await calcularCampanhaComercial(id);
        // o cálculo muda a situação e a data do último cálculo; atualiza só essa linha
        setCampanhas((prev) => prev.map((c) => (c.idCampanhaComercial === id ? calculada : c)));
        setSelecionadasIds((atual) => atual.filter((x) => x !== id));
        calculadas++;
      } catch (e) {
        const texto = mensagemDoErro(e, "Erro ao calcular a campanha.");
        falhas.push(texto.includes(String(id)) ? texto : `Campanha ${id}: ${texto}`);
      }
    }

    setProgresso(null);
    if (falhas.length === 0) {
      setMensagem({
        tipo: "ok",
        texto: calculadas === 1 ? `Campanha ${alvo[0]} calculada.` : `${calculadas} campanhas calculadas.`,
      });
    } else {
      const resumo = calculadas > 0 ? `${calculadas} de ${alvo.length} calculadas. ` : "";
      setMensagem({ tipo: "erro", texto: resumo + falhas.join(" · ") });
    }
  }, [selecionadas]);

  // ── exportação ──

  const exportarResultado = useCallback(
    async (c: CampanhaComercial) => {
      const id = c.idCampanhaComercial;
      setExportandoId(id);
      setMensagem(null);
      try {
        const linhas = await buscarResultadoCampanhaComercial(id);
        if (linhas.length === 0) {
          setMensagem({ tipo: "erro", texto: `A campanha ${id} não tem linhas de resultado para exportar.` });
          return;
        }
        exportCampanhaComercialResultadoToExcel(linhas, `resultado_campanha_${id}_${dataCompetencia ?? "sem-competencia"}.xlsx`);
        setMensagem({ tipo: "ok", texto: `Resultado da campanha ${id} exportado (${linhas.length} linhas).` });
      } catch (e) {
        setMensagem({ tipo: "erro", texto: mensagemDoErro(e, "Erro ao exportar o resultado da campanha.") });
      } finally {
        setExportandoId(null);
      }
    },
    [dataCompetencia]
  );

  return {
    campanhas,
    opcoes,
    loading,
    error,
    retry,
    // seleção
    selecionadas,
    alternarSelecao,
    adicionarSelecao,
    removerSelecao,
    selecionarVarias,
    desselecionarVarias,
    limparSelecao,
    // edição
    editandoId,
    form,
    alterada,
    salvando,
    erroForm,
    abrir,
    fechar,
    alterar,
    salvar,
    // cálculo / exportação
    progresso,
    calculando: progresso !== null,
    calcularSelecionadas,
    exportandoId,
    exportarResultado,
    mensagem,
  };
}
