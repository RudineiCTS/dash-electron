import { FiAlertTriangle, FiX } from "react-icons/fi";

interface ModalConfirmarCopiaCenarioProps {
  origemId: number;
  origemDescricao: string;
  origemVendedores: number;
  novoIdCenario: number;
  novoIdPeriodo: number;
  descricao: string;
  /** dd/mm/aaaa */
  dataInicio: string;
  /** dd/mm/aaaa */
  dataFim: string;
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

/** Confirmação antes de gravar no banco: mostra exatamente o que será criado e de onde será copiado. */
export function ModalConfirmarCopiaCenario({
  origemId,
  origemDescricao,
  origemVendedores,
  novoIdCenario,
  novoIdPeriodo,
  descricao,
  dataInicio,
  dataFim,
  confirmando,
  onConfirmar,
  onCancelar,
}: ModalConfirmarCopiaCenarioProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
      <div className="flex max-h-[90vh] w-full max-w-xl flex-col gap-5 overflow-auto rounded-xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-500">
              <FiAlertTriangle size={20} />
            </span>
            <div className="flex flex-col">
              <h2 className="text-lg font-extrabold text-indigo-950">Criar e copiar cenário?</h2>
              <span className="text-xs text-gray-500">Confira os dados antes de gravar no banco.</span>
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
          <div className="col-span-2">
            <Linha
              rotulo="Copiar do cenário"
              valor={`#${origemId} · ${origemDescricao} (${origemVendedores} vendedores)`}
            />
          </div>
          <Linha rotulo="Novo cenário" valor={`#${novoIdCenario}`} />
          <Linha rotulo="Novo período de competência" valor={`#${novoIdPeriodo}`} />
          <div className="col-span-2">
            <Linha rotulo="Descrição do novo cenário" valor={descricao} />
          </div>
          <div className="col-span-2">
            <Linha rotulo="Vigência" valor={`${dataInicio} → ${dataFim}`} />
          </div>
        </div>

        <ol className="flex list-decimal flex-col gap-1 pl-5 text-sm text-gray-700">
          <li>Cria o cenário #{novoIdCenario} com a descrição acima.</li>
          <li>
            Cria o período de competência #{novoIdPeriodo} na vigência informada, com a situação inicial padrão
            (1).
          </li>
          <li>Copia do cenário #{origemId} para o #{novoIdCenario} (procedure uspUsuComissaoVendasCenarioCopiar).</li>
        </ol>

        <p className="text-xs text-gray-500">
          Os três passos rodam juntos: se algum falhar, nada é gravado. Depois de criado, o cenário só se desfaz
          por fora desta tela.
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
            {confirmando ? "Criando..." : "Confirmar e criar"}
          </button>
        </div>
      </div>
    </div>
  );
}
