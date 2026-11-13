import { FiAlertTriangle } from "react-icons/fi";

interface ModalAvisosConferenciaProps {
  avisos: string[];
  onClose: () => void;
}

/** Popup com o que a base enviada não trouxe. A conferência segue, considerando 0 no que faltou. */
export function ModalAvisosConferencia({ avisos, onClose }: ModalAvisosConferenciaProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col gap-4 rounded-xl bg-other-card p-6 shadow-2xl">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-other-orange/15 text-other-orange">
            <FiAlertTriangle size={20} />
          </span>
          <div className="flex flex-col">
            <h2 className="text-lg font-extrabold text-other-text">A planilha não trouxe tudo</h2>
            <span className="text-xs text-other-muted">
              A conferência foi feita assim mesmo: o que não foi informado conta como 0.
            </span>
          </div>
        </div>

        <ul className="flex flex-col gap-2 overflow-auto rounded-lg border border-other-border bg-other-bg p-4 text-sm text-other-text">
          {avisos.map((aviso) => (
            <li key={aviso} className="flex gap-2">
              <span aria-hidden>•</span>
              <span>{aviso}</span>
            </li>
          ))}
        </ul>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-lg bg-[#32307B] px-5 text-sm font-semibold text-white transition-[filter] hover:brightness-110 active:brightness-95 cursor-pointer"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
}
