import { FiAlertTriangle, FiX } from "react-icons/fi";

interface ModalConfirmarCalculoComissaoProps {
  periodoId: number | null;
  situacaoDescricao: string | null;
  tipoComissao: number;
  idPessoas: string;
  tiposSelecionados: number;
  confirmando: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-bold uppercase tracking-wide text-gray-400">{rotulo}</span>
      <span className="text-sm font-semibold text-gray-800">{valor}</span>
    </div>
  );
}

/** Confirmação antes de calcular as comissões (recalcula e grava o resultado do período). */
export function ModalConfirmarCalculoComissao({
  periodoId,
  situacaoDescricao,
  tipoComissao,
  idPessoas,
  tiposSelecionados,
  confirmando,
  onConfirmar,
  onCancelar,
}: ModalConfirmarCalculoComissaoProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
      <div className="flex max-h-[90vh] w-full max-w-xl flex-col gap-5 overflow-auto rounded-xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-500">
              <FiAlertTriangle size={20} />
            </span>
            <div className="flex flex-col">
              <h2 className="text-lg font-extrabold text-indigo-950">Calcular as comissões?</h2>
              <span className="text-xs text-gray-500">Confira antes de executar a procedure.</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancelar}
            disabled={confirmando}
            aria-label="Fechar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 cursor-pointer disabled:opacity-50"
          >
            <FiX size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <Linha rotulo="Período" valor={`#${periodoId ?? "?"} · ${situacaoDescricao ?? "-"}`} />
          <Linha rotulo="Tipo de comissão" valor={tipoComissao === 0 ? "0 · Televendas" : "1 · Farma"} />
          <Linha rotulo="Pessoas" valor={idPessoas ? idPessoas : "Todas do período"} />
          <Linha rotulo="Tipos de pessoa" valor={tiposSelecionados === 0 ? "Todos" : `${tiposSelecionados} selecionados`} />
        </div>

        <ol className="flex list-decimal flex-col gap-1 pl-5 text-sm text-gray-700">
          <li>Muda o período para CALCULANDO enquanto roda e volta para LIBERADO no final.</li>
          <li>Recalcula as comissões das pessoas escolhidas e substitui o resultado delas no período.</li>
        </ol>

        <p className="text-xs text-gray-500">
          O cálculo percorre todas as metas e pode levar alguns minutos; não feche a tela até terminar. Se quiser ver
          como fica sem alterar nada, use &quot;Testar cálculo (não grava)&quot;.
        </p>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancelar}
            disabled={confirmando}
            className="h-10 rounded-lg border border-gray-200 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            disabled={confirmando}
            className="h-10 rounded-lg bg-orange-500 px-5 text-sm font-bold text-white hover:bg-orange-600 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          >
            {confirmando ? "Calculando..." : "Confirmar e calcular"}
          </button>
        </div>
      </div>
    </div>
  );
}
