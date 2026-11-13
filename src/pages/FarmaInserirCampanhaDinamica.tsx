import { ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import dayjs from "dayjs";
import { useInserirCampanhaDinamica } from "../hook/useInserirCampanhaDinamica";
import { INSERCAO_DISPONIVEL } from "../services/campanhaFarmaResultado";
import { ListaScriptsSalvos } from "../components/ComponentesFarma/InserirCampanhaDinamica/ListaScriptsSalvos";
import { EtapasScript } from "../components/ComponentesFarma/InserirCampanhaDinamica/EtapasScript";
import { PainelResultadoScript } from "../components/ComponentesFarma/InserirCampanhaDinamica/PainelResultadoScript";
import { ModalConfirmarInsercao } from "../components/ComponentesFarma/InserirCampanhaDinamica/ModalConfirmarInsercao";
import Button from "../components/shared/Button/ButtonComponent";

const estiloInput =
  "h-12 w-full rounded-lg border border-other-border bg-other-card px-4 text-sm text-other-text outline-none focus:border-[#32307B] disabled:opacity-60";

function Campo({ rotulo, children, className = "" }: { rotulo: string; children: ReactNode; className?: string }) {
  return (
    <label className={`flex flex-col gap-1.5 text-xs font-semibold text-other-muted ${className}`}>
      {rotulo}
      {children}
    </label>
  );
}

export function FarmaInserirCampanhaDinamica() {
  const h = useInserirCampanhaDinamica();
  const navigate = useNavigate();
  const [confirmando, setConfirmando] = useState(false);

  const ocupado = h.salvando || h.executando || h.inserindo || h.abrindo;
  const executadoAntes = !!h.retorno;
  const competenciaRotulo = dayjs(h.dataCompetencia).format("MM/YYYY");

  function handleInserirClick() {
    // gerar o INSERT valida o ID da campanha e deixa o script que vai ser gravado à vista
    if (h.gerarInsert()) setConfirmando(true);
  }

  async function handleConfirmarInsercao() {
    setConfirmando(false);
    await h.inserir();
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

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-other-text">Inserir campanha dinâmica</h1>
          <p className="text-sm text-other-muted">
            Cole o script de apuração, execute, confira o retorno e gere o INSERT.
          </p>
        </div>

        <label className="flex flex-col gap-1.5 text-xs font-semibold text-other-muted">
          Data de competência
          <input
            type="date"
            value={h.dataCompetencia}
            onChange={(e) => e.target.value && h.setDataCompetencia(e.target.value)}
            className="h-12 rounded-lg border border-other-border bg-other-card px-4 text-sm text-other-text outline-none focus:border-[#32307B]"
          />
        </label>
      </header>

      <div className="grid items-start gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <ListaScriptsSalvos
          scripts={h.scripts}
          carregando={h.carregandoLista}
          selecionadoId={h.registro?.id ?? null}
          rotuloCompetencia={competenciaRotulo}
          onNovo={h.novo}
          onSelecionar={h.selecionar}
        />

        <div className="flex min-w-0 flex-col gap-6">
          <section className="flex flex-col gap-4 rounded-xl border border-other-border bg-other-card p-5">
            <EtapasScript {...h.etapas} />

            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_160px_minmax(0,1fr)]">
              <Campo rotulo="Nome do script">
                <input
                  value={h.formulario.nome}
                  onChange={(e) => h.alterarCampo("nome", e.target.value)}
                  disabled={h.travado}
                  className={estiloInput}
                />
              </Campo>
              <Campo rotulo="ID da campanha">
                <input
                  value={h.formulario.idCampanha}
                  onChange={(e) => h.alterarCampo("idCampanha", e.target.value)}
                  disabled={h.travado}
                  inputMode="numeric"
                  className={estiloInput}
                />
              </Campo>
              <Campo rotulo="Descrição da campanha">
                <input
                  value={h.formulario.descricao}
                  onChange={(e) => h.alterarCampo("descricao", e.target.value)}
                  disabled={h.travado}
                  className={estiloInput}
                />
              </Campo>
            </div>

            <Campo rotulo="Script de apuração (fica salvo exatamente como colado)">
              <textarea
                value={h.formulario.script}
                onChange={(e) => h.alterarCampo("script", e.target.value)}
                disabled={h.travado}
                spellCheck={false}
                rows={11}
                className="w-full resize-y rounded-lg border border-other-border bg-other-card p-4 font-mono text-xs font-normal text-other-text outline-none focus:border-[#32307B] disabled:opacity-60"
              />
            </Campo>

            {h.travado && (
              <p className="text-xs text-other-muted">
                Este script já foi inserido na resultado, então não pode mais ser alterado nem executado de novo.
              </p>
            )}
            {h.retornoDesatualizado && !h.travado && (
              <p className="text-xs text-other-muted">
                O script foi alterado depois da última execução: execute de novo para atualizar o retorno. Se você
                salvar agora, só o texto é salvo e o retorno anterior é descartado.
              </p>
            )}
            {h.erro && <p className="text-sm font-medium text-red-500">{h.erro}</p>}
            {h.aviso && !h.erro && <p className="text-sm font-medium text-green-600">{h.aviso}</p>}

            <div className="flex flex-wrap gap-3">
              <Button
                label={h.salvando ? "Salvando..." : "Salvar script"}
                variant="secundario"
                onClick={h.salvar}
                disabled={ocupado || h.travado}
              />
              <Button
                label={h.executando ? "Executando..." : executadoAntes ? "Executar de novo" : "Executar script"}
                onClick={h.executar}
                disabled={ocupado || h.travado}
              />
            </div>
          </section>

          <PainelResultadoScript
            retorno={h.retorno}
            aba={h.aba}
            onAbaChange={h.setAba}
            scriptInsert={h.scriptInsert}
            nomeArquivo={`insert_resultado_campanha_${h.formulario.idCampanha || "sem-id"}_${h.dataCompetencia}.sql`}
            inserido={h.travado}
            retornoDesatualizado={h.retornoDesatualizado}
            insercaoDisponivel={INSERCAO_DISPONIVEL}
            inserindo={h.inserindo}
            onGerarInsert={h.gerarInsert}
            onInserir={handleInserirClick}
          />
        </div>
      </div>

      {confirmando && h.retorno && (
        <ModalConfirmarInsercao
          nomeScript={h.formulario.nome}
          idCampanha={h.formulario.idCampanha}
          linhas={h.retorno.linhas.length}
          dataCompetencia={dayjs(h.registro?.dataCompetencia ?? h.dataCompetencia).format("DD/MM/YYYY")}
          onConfirmar={handleConfirmarInsercao}
          onCancelar={() => setConfirmando(false)}
        />
      )}
    </div>
  );
}
