import { FiAlertTriangle, FiX } from "react-icons/fi";

interface ModalConfirmarImportacaoExclusivasProps {
  periodoId: number | null;
  cenarioId: number | null;
  tipoPessoa: number;
  tipoNome: string;
  /** O texto do script foi editado na tela (não é mais o gerado pelo formulário). */
  scriptEditado: boolean;
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

/** Confirmação antes de executar a importação de metas exclusivas (grava no banco). */
export function ModalConfirmarImportacaoExclusivas({
  periodoId,
  cenarioId,
  tipoPessoa,
  tipoNome,
  scriptEditado,
  confirmando,
  onConfirmar,
  onCancelar,
}: ModalConfirmarImportacaoExclusivasProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
      <div className="flex max-h-[90vh] w-full max-w-xl flex-col gap-5 overflow-auto rounded-xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-500">
              <FiAlertTriangle size={20} />
            </span>
            <div className="flex flex-col">
              <h2 className="text-lg font-extrabold text-indigo-950">Importar metas exclusivas?</h2>
              <span className="text-xs text-gray-500">Confira antes de gravar no banco.</span>
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

        <div className="grid grid-cols-3 gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <Linha rotulo="Período" valor={`#${periodoId ?? "?"}`} />
          <Linha rotulo="Cenário" valor={`#${cenarioId ?? "?"}`} />
          <Linha rotulo="Tipo de pessoa" valor={`${tipoPessoa}${tipoNome ? ` · ${tipoNome}` : ""}`} />
        </div>

        <ol className="flex list-decimal flex-col gap-1 pl-5 text-sm text-gray-700">
          <li>
            Exclui as metas do tipo {tipoPessoa} no período #{periodoId} e o limite desse tipo no cenário #{cenarioId}.
          </li>
          <li>Grava as metas, os valores (gatilho e, se marcado, KPIs de loja virtual) e o limite de premiação.</li>
        </ol>

        {scriptEditado && (
          <p className="rounded-lg border border-orange-300 bg-orange-50 px-3 py-2 text-sm text-orange-900">
            O texto do script foi <strong>editado</strong>: vai rodar exatamente o que está na tela, não o gerado pelo
            formulário.
          </p>
        )}

        <p className="text-xs text-gray-500">
          Tudo roda numa transação: se algo falhar, nada é alterado. Depois de gravado, só se desfaz por fora desta tela.
          Use &quot;Testar sem gravar&quot; antes se quiser ver o resultado sem alterar nada.
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
            {confirmando ? "Importando..." : "Confirmar e importar"}
          </button>
        </div>
      </div>
    </div>
  );
}
