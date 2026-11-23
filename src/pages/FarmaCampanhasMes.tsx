import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiRefreshCw, FiSearch } from "react-icons/fi";
import dayjs from "dayjs";
import { FormEdicaoCampanha } from "../components/ComponentesFarma/CampanhasMes/FormEdicaoCampanha";
import { NavegadorCompetencia } from "../components/ComponentesFarma/CampanhasMes/NavegadorCompetencia";
import { PainelCalcularCampanha } from "../components/ComponentesFarma/CampanhasMes/PainelCalcularCampanha";
import { PainelResultadoCampanha } from "../components/ComponentesFarma/CampanhasMes/PainelResultadoCampanha";
import { TabelaCampanhasMes } from "../components/ComponentesFarma/CampanhasMes/TabelaCampanhasMes";
import { TopCardTopic } from "../components/TopCardTopic";
import { useCampanhasComerciais } from "../hook/useCampanhasComerciais";
import { CampanhaComercial } from "../interfaces/CampanhaComercial";
import {
  contarPorSituacao,
  descreverEncerramento,
  formatarReaisInteiros,
  resumirCampanhas,
  rotuloSituacao,
} from "../utils/resumoCampanhasComerciais";

const plural = (n: number, singular: string, pluralTxt: string) => `${n} ${n === 1 ? singular : pluralTxt}`;

export function FarmaCampanhasMes() {
  const navigate = useNavigate();
  const [competencia, setCompetencia] = useState(() => dayjs().format("YYYY-MM"));
  const [filtroSituacao, setFiltroSituacao] = useState("");
  const [busca, setBusca] = useState("");

  // DataCompetencia em tblCampanhaComercial é sempre o último dia do mês
  const dataCompetencia = useMemo(() => dayjs(`${competencia}-01`).endOf("month").format("YYYY-MM-DD"), [competencia]);
  const h = useCampanhasComerciais(dataCompetencia);

  const resumo = useMemo(() => resumirCampanhas(h.campanhas), [h.campanhas]);
  const situacoes = useMemo(() => contarPorSituacao(h.campanhas), [h.campanhas]);

  const termo = busca.trim().toLowerCase();
  const campanhasFiltradas = useMemo(
    () =>
      h.campanhas.filter(
        (c) =>
          (!filtroSituacao || c.descricaoSituacao === filtroSituacao) &&
          (!termo ||
            String(c.idCampanhaComercial).includes(termo) ||
            c.descricaoCampanha.toLowerCase().includes(termo))
      ),
    [h.campanhas, filtroSituacao, termo]
  );

  /** Pergunta antes de perder uma edição não salva; true = pode seguir. */
  function podeDescartarEdicao(): boolean {
    return !h.alterada || window.confirm("Há alterações não salvas nesta campanha. Descartá-las?");
  }

  function handleCompetenciaChange(nova: string) {
    if (h.calculando || !podeDescartarEdicao()) return;
    setCompetencia(nova);
    setFiltroSituacao("");
  }

  function handleClickLinha(c: CampanhaComercial) {
    if (!podeDescartarEdicao()) return;
    if (h.editandoId === c.idCampanhaComercial) h.fechar();
    else h.abrir(c);
  }

  function handleCalcular() {
    if (h.selecionadas.length === 0) return;
    const lista = h.selecionadas.map((c) => `• ${c.idCampanhaComercial} · ${c.descricaoCampanha}`).join("\n");
    const confirmado = window.confirm(
      `Calcular ${plural(h.selecionadas.length, "campanha", "campanhas")}?\n\n${lista}\n\n` +
        "O cálculo roda direto no banco, uma campanha por vez, e substitui o resultado anterior de cada uma."
    );
    if (confirmado) h.calcularSelecionadas();
  }

  function handleAlternarTodas(ids: number[], marcar: boolean) {
    if (marcar) h.selecionarVarias(ids);
    else h.desselecionarVarias(ids);
  }

  return (
    <div className="flex flex-col gap-6 p-10">
      <button
        type="button"
        onClick={() => navigate("/farma")}
        aria-label="Voltar para o início do Campanha Farma"
        className="-mb-2 flex w-fit items-center gap-2 text-sm text-other-muted transition-colors hover:text-other-text cursor-pointer"
      >
        <FiArrowLeft size={18} /> Voltar
      </button>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-other-text">Campanhas do mês</h1>
          <p className="text-sm text-other-muted">
            Campanhas comerciais da competência. Clique em uma linha para editar.
          </p>
        </div>
        <NavegadorCompetencia
          competencia={competencia}
          onChange={handleCompetenciaChange}
          desabilitado={h.calculando}
        />
      </header>

      {h.error && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
          {h.error}
          <button type="button" onClick={h.retry} className="font-semibold underline cursor-pointer">
            Tentar novamente
          </button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <TopCardTopic
          title="Campanhas"
          value={resumo.total}
          format="numero"
          subtitles={`${plural(resumo.ativas, "ativa", "ativas")} · ${plural(resumo.canceladas, "cancelada", "canceladas")}`}
        />
        <TopCardTopic
          title="Objetivo total"
          value={resumo.objetivoAtivas}
          displayValue={formatarReaisInteiros(resumo.objetivoAtivas)}
          subtitles="Soma das campanhas ativas"
        />
        <TopCardTopic title="Em cálculo" value={resumo.emCalculo} format="numero" subtitles="Aguardando apuração" />
        <TopCardTopic
          title="Encerramento"
          value={0}
          displayValue={dayjs(dataCompetencia).format("DD/MM")}
          subtitles={descreverEncerramento(dataCompetencia)}
        />
      </div>

      <PainelCalcularCampanha
        campanhas={h.campanhas}
        selecionadas={h.selecionadas}
        onAdicionar={h.adicionarSelecao}
        onRemover={h.removerSelecao}
        onLimpar={h.limparSelecao}
        onCalcular={handleCalcular}
        progresso={h.progresso}
        desabilitado={h.loading || h.campanhas.length === 0}
      />

      {h.mensagem && (
        <p className={`-mt-2 text-sm font-medium ${h.mensagem.tipo === "ok" ? "text-green-600" : "text-red-500"}`}>
          {h.mensagem.texto}
        </p>
      )}

      <section className="flex flex-col overflow-hidden rounded-xl border border-other-border bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div className="flex flex-wrap items-center gap-2">
            {[{ situacao: "", quantidade: resumo.total, rotulo: "Todas" }, ...situacoes.map((s) => ({ ...s, rotulo: rotuloSituacao(s.situacao) }))].map(
              (chip) => {
                const ativo = filtroSituacao === chip.situacao;
                return (
                  <button
                    key={chip.rotulo}
                    type="button"
                    onClick={() => setFiltroSituacao(chip.situacao)}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors cursor-pointer ${
                      ativo ? "bg-[#32307B] text-white" : "bg-indigo-50 text-[#32307B] hover:bg-indigo-100"
                    }`}
                  >
                    {chip.rotulo}
                    <span className={`text-xs ${ativo ? "text-white/70" : "text-[#32307B]/60"}`}>{chip.quantidade}</span>
                  </button>
                );
              }
            )}
          </div>

          <div className="flex items-center gap-2">
            <label className="flex h-11 w-72 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 focus-within:border-[#32307B]">
              <FiSearch size={15} className="text-gray-400" />
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por ID ou descrição"
                className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
              />
            </label>
            <button
              type="button"
              onClick={h.retry}
              disabled={h.loading}
              title="Recarregar"
              className="flex h-11 w-11 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50
                         disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
            >
              <FiRefreshCw size={15} />
            </button>
          </div>
        </div>

        <TabelaCampanhasMes
          campanhas={campanhasFiltradas}
          loading={h.loading}
          mensagemVazio={
            termo || filtroSituacao ? "Nenhuma campanha encontrada para esse filtro." : "Nenhuma campanha nessa competência."
          }
          editandoId={h.editandoId}
          onClickLinha={handleClickLinha}
          selecionadasIds={h.selecionadas.map((c) => c.idCampanhaComercial)}
          onAlternarSelecao={h.alternarSelecao}
          onAlternarTodas={handleAlternarTodas}
          selecaoTravada={h.calculando}
          renderEdicao={(c) =>
            h.form && (
              <div className="flex flex-col gap-4">
                <PainelResultadoCampanha
                  campanha={c}
                  onExportar={() => h.exportarResultado(c)}
                  exportando={h.exportandoId === c.idCampanhaComercial}
                />
                <FormEdicaoCampanha
                  campanha={c}
                  form={h.form}
                  opcoes={h.opcoes}
                  onAlterar={h.alterar}
                  onSalvar={h.salvar}
                  onCancelar={() => podeDescartarEdicao() && h.fechar()}
                  salvando={h.salvando}
                  alterada={h.alterada}
                  erro={h.erroForm}
                />
              </div>
            )
          }
        />
      </section>
    </div>
  );
}
