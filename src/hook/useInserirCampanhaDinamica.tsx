import { useCallback, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { RetornoScript, ScriptCampanha, ScriptCampanhaResumo } from "../interfaces/CampanhaFarmaResultado";
import {
  buscarScript,
  executarScript,
  inserirResultado,
  listarScripts,
  salvarScript,
} from "../services/campanhaFarmaResultado";
import { gerarInsertResultadoCampanha } from "../utils/gerarInsertResultadoCampanha";

export type AbaResultado = "retorno" | "insert" | "conferencia";

export interface FormularioScript {
  nome: string;
  idCampanha: string;
  descricao: string;
  script: string;
}

const FORMULARIO_VAZIO: FormularioScript = { nome: "", idCampanha: "", descricao: "", script: "" };

function paraFormulario(script: ScriptCampanha): FormularioScript {
  return {
    nome: script.nome,
    idCampanha: script.idCampanha == null ? "" : String(script.idCampanha),
    descricao: script.descricao,
    script: script.script,
  };
}

function mensagemDoErro(e: unknown, padrao: string): string {
  return e instanceof Error && e.message ? e.message : padrao;
}

export function useInserirCampanhaDinamica() {
  // padrão: último dia do mês anterior (campanhas fechadas)
  const [dataCompetencia, setDataCompetencia] = useState(() =>
    dayjs().subtract(1, "month").endOf("month").format("YYYY-MM-DD")
  );
  const [scripts, setScripts] = useState<ScriptCampanhaResumo[]>([]);
  const [carregandoLista, setCarregandoLista] = useState(false);

  /** Script salvo aberto na tela (null = script novo ainda não salvo). */
  const [registro, setRegistro] = useState<ScriptCampanha | null>(null);
  const [formulario, setFormulario] = useState<FormularioScript>(FORMULARIO_VAZIO);

  /** Retorno exibido na tela: o da última execução (ainda não salvo) ou o guardado do script aberto. */
  const [retorno, setRetorno] = useState<RetornoScript | null>(null);
  /** Texto do script que gerou `retorno`; se o texto do formulário mudar, o retorno fica desatualizado. */
  const [textoExecutado, setTextoExecutado] = useState<string | null>(null);

  const [aba, setAba] = useState<AbaResultado>("retorno");
  const [scriptInsert, setScriptInsert] = useState("");
  const [abrindo, setAbrindo] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [executando, setExecutando] = useState(false);
  const [inserindo, setInserindo] = useState(false);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");

  const competencia = dataCompetencia.slice(0, 7);

  const limparRetorno = useCallback(() => {
    setRetorno(null);
    setTextoExecutado(null);
    setScriptInsert("");
    setAba("retorno");
  }, []);

  const recarregarLista = useCallback(async () => {
    setCarregandoLista(true);
    try {
      setScripts(await listarScripts(competencia));
    } catch (e) {
      setErro(mensagemDoErro(e, "Erro ao carregar os scripts salvos."));
    } finally {
      setCarregandoLista(false);
    }
  }, [competencia]);

  useEffect(() => {
    recarregarLista();
  }, [recarregarLista]);

  // trocou de mês: um script salvo de outra competência sai da tela (o rascunho novo continua)
  useEffect(() => {
    if (registro && registro.dataCompetencia.slice(0, 7) !== competencia) {
      setRegistro(null);
      setFormulario(FORMULARIO_VAZIO);
      limparRetorno();
    }
  }, [competencia, registro, limparRetorno]);

  const novo = useCallback(() => {
    setRegistro(null);
    setFormulario(FORMULARIO_VAZIO);
    limparRetorno();
    setErro("");
    setAviso("");
  }, [limparRetorno]);

  const selecionar = useCallback(
    async (resumo: ScriptCampanhaResumo) => {
      setErro("");
      setAviso("");
      setAbrindo(true);
      try {
        // a lista não traz o texto do script nem o retorno: busca o script completo
        const script = await buscarScript(resumo.id);
        setRegistro(script);
        setFormulario(paraFormulario(script));
        limparRetorno();
        if (script.retorno) {
          setRetorno(script.retorno);
          setTextoExecutado(script.script);
        }
      } catch (e) {
        setErro(mensagemDoErro(e, "Erro ao abrir o script."));
      } finally {
        setAbrindo(false);
      }
    },
    [limparRetorno]
  );

  const alterarCampo = useCallback(<K extends keyof FormularioScript>(campo: K, valor: FormularioScript[K]) => {
    setFormulario((atual) => ({ ...atual, [campo]: valor }));
  }, []);

  const travado = registro?.status === "inserido";
  /** O script foi editado depois da última execução: o retorno na tela não corresponde mais ao texto. */
  const retornoDesatualizado = !!retorno && textoExecutado !== formulario.script;
  // compara o instante (o servidor pode devolver o mesmo horário em outro formato de texto)
  const retornoGuardado =
    !!registro?.retorno && !!retorno && Math.abs(dayjs(registro.retorno.executadoEm).diff(retorno.executadoEm)) < 1000;

  function validarParaSalvar(): string | null {
    if (!formulario.nome.trim()) return "Informe o nome do script.";
    if (!formulario.script.trim()) return "Cole o script de apuração.";
    if (formulario.idCampanha.trim() && !/^\d+$/.test(formulario.idCampanha.trim())) {
      return "O ID da campanha deve ser numérico.";
    }
    return null;
  }

  /** Só salva quando o usuário clica em "Salvar script". Leva junto o retorno, se ele corresponde ao texto atual. */
  const salvar = useCallback(async () => {
    const invalido = validarParaSalvar();
    if (invalido) return setErro(invalido);

    setErro("");
    setAviso("");
    setSalvando(true);
    try {
      const retornoDoTexto = retorno && textoExecutado === formulario.script ? retorno : null;
      const salvo = await salvarScript({
        id: registro?.id ?? null,
        nome: formulario.nome.trim(),
        idCampanha: formulario.idCampanha.trim() ? Number(formulario.idCampanha.trim()) : null,
        descricao: formulario.descricao.trim(),
        script: formulario.script,
        dataCompetencia: registro?.dataCompetencia ?? dataCompetencia,
        retorno: retornoDoTexto,
      });
      setRegistro(salvo);
      // texto novo sem retorno novo: o retorno antigo deixou de valer
      if (!retornoDoTexto && textoExecutado !== formulario.script) limparRetorno();
      setAviso(retornoDoTexto ? "Script e retorno salvos." : "Script salvo.");
      await recarregarLista();
    } catch (e) {
      setErro(mensagemDoErro(e, "Erro ao salvar o script."));
    } finally {
      setSalvando(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registro, formulario, retorno, textoExecutado, dataCompetencia, recarregarLista, limparRetorno]);

  /** Executa e mostra o retorno, sem salvar nada. */
  const executar = useCallback(async () => {
    if (!formulario.script.trim()) return setErro("Cole o script de apuração.");

    setErro("");
    setAviso("");
    // some o retorno anterior já ao começar: se a execução falhar, a tela não pode continuar
    // mostrando o resultado de outro script como se fosse deste
    limparRetorno();
    setExecutando(true);
    try {
      const novoRetorno = await executarScript(formulario.script);
      setRetorno(novoRetorno);
      setTextoExecutado(formulario.script);
      setScriptInsert("");
      setAba("retorno");
    } catch (e) {
      setErro(mensagemDoErro(e, "Erro ao executar o script."));
    } finally {
      setExecutando(false);
    }
  }, [formulario.script, limparRetorno]);

  const gerarInsert = useCallback((): string | null => {
    if (!retorno || retorno.linhas.length === 0) {
      setErro("Execute o script para ter um retorno antes de gerar o INSERT.");
      return null;
    }
    if (retornoDesatualizado) {
      setErro("O script foi alterado depois da última execução. Execute de novo para gerar o INSERT.");
      return null;
    }
    const idCampanha = formulario.idCampanha.trim();
    if (!/^\d+$/.test(idCampanha)) {
      setErro("Informe o ID da campanha (numérico) para gerar o INSERT.");
      return null;
    }

    setErro("");
    const sql = gerarInsertResultadoCampanha({
      idCampanha: Number(idCampanha),
      descricao: formulario.descricao.trim() || formulario.nome.trim(),
      dataCompetencia: registro?.dataCompetencia ?? dataCompetencia,
      executadoEm: retorno.executadoEm,
      linhas: retorno.linhas,
    });
    setScriptInsert(sql);
    setAba("insert");
    return sql;
  }, [retorno, retornoDesatualizado, registro, formulario, dataCompetencia]);

  const inserir = useCallback(async () => {
    if (!registro) return;
    setErro("");
    setAviso("");
    setInserindo(true);
    try {
      const inserido = await inserirResultado(registro.id);
      setRegistro(inserido);
      setAviso("Resultado inserido.");
      await recarregarLista();
    } catch (e) {
      setErro(mensagemDoErro(e, "Erro ao inserir na resultado."));
    } finally {
      setInserindo(false);
    }
  }, [registro, recarregarLista]);

  const etapas = useMemo(
    () => ({
      scriptSalvo: !!registro,
      executado: !!retorno,
      retornoGuardado,
      inserido: registro?.status === "inserido",
    }),
    [registro, retorno, retornoGuardado]
  );

  return {
    dataCompetencia,
    setDataCompetencia,
    scripts,
    carregandoLista,
    abrindo,
    registro,
    formulario,
    alterarCampo,
    retorno,
    retornoDesatualizado,
    aba,
    setAba,
    scriptInsert,
    salvando,
    executando,
    inserindo,
    erro,
    aviso,
    travado,
    etapas,
    novo,
    selecionar,
    salvar,
    executar,
    gerarInsert,
    inserir,
  };
}
