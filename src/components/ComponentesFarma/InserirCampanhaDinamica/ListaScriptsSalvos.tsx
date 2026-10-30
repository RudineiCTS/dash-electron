import dayjs from "dayjs";
import { FiPlus } from "react-icons/fi";
import { ScriptCampanhaResumo, StatusScriptCampanha } from "../../../interfaces/CampanhaFarmaResultado";

const STATUS_ROTULO: Record<StatusScriptCampanha, string> = {
  rascunho: "Rascunho",
  retorno_guardado: "Retorno guardado",
  inserido: "Inserido",
};

const STATUS_ESTILO: Record<StatusScriptCampanha, string> = {
  rascunho: "bg-other-border text-other-muted",
  retorno_guardado: "bg-blue-100 text-blue-700",
  inserido: "bg-green-100 text-green-700",
};

interface ListaScriptsSalvosProps {
  scripts: ScriptCampanhaResumo[];
  carregando: boolean;
  selecionadoId: string | null;
  /** MM/AAAA da competência filtrada, para a mensagem de lista vazia. */
  rotuloCompetencia: string;
  onNovo: () => void;
  onSelecionar: (script: ScriptCampanhaResumo) => void;
}

function detalhe(script: ScriptCampanhaResumo): string {
  const campanha = script.idCampanha != null ? `Campanha ${script.idCampanha}` : "Sem ID de campanha";
  if (script.executadoEm) {
    return `${campanha} · retorno ${dayjs(script.executadoEm).format("DD/MM/YYYY, HH:mm:ss")}`;
  }
  return campanha;
}

export function ListaScriptsSalvos({
  scripts,
  carregando,
  selecionadoId,
  rotuloCompetencia,
  onNovo,
  onSelecionar,
}: ListaScriptsSalvosProps) {
  return (
    <section className="flex flex-col overflow-hidden rounded-xl border border-other-border bg-other-card">
      <div className="flex items-center justify-between border-b border-other-border px-5 py-4">
        <h2 className="text-base font-bold text-other-text">Scripts salvos</h2>
        <button
          type="button"
          onClick={onNovo}
          className="flex h-10 items-center gap-1.5 rounded-lg bg-[#32307B] px-4 text-sm font-semibold text-white transition-[filter] hover:brightness-110 active:brightness-95 cursor-pointer"
        >
          <FiPlus size={16} />
          Novo
        </button>
      </div>

      {carregando && scripts.length === 0 ? (
        <p className="px-5 py-6 text-sm text-other-muted">Carregando...</p>
      ) : scripts.length === 0 ? (
        <p className="px-5 py-6 text-sm text-other-muted">
          Nenhum script salvo na competência {rotuloCompetencia}.
        </p>
      ) : (
        <ul className="flex flex-col">
          {scripts.map((script) => {
            const ativo = script.id === selecionadoId;
            return (
              <li key={script.id}>
                <button
                  type="button"
                  onClick={() => onSelecionar(script)}
                  className={`flex w-full flex-col gap-1 border-b border-other-border px-5 py-4 text-left transition-colors cursor-pointer hover:bg-other-hoverbg ${
                    ativo ? "border-l-4 border-l-[#32307B] bg-other-hoverbg pl-4" : ""
                  }`}
                >
                  <span className="flex items-start justify-between gap-3">
                    <span className="text-sm font-bold text-other-text">{script.nome}</span>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_ESTILO[script.status]}`}
                    >
                      {STATUS_ROTULO[script.status]}
                    </span>
                  </span>
                  <span className="text-xs text-other-muted">{detalhe(script)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
