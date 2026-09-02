import { FiFileText, FiX } from "react-icons/fi";

interface ScriptChoiceModalProps {
    onChoose: (type: "simple" | "complete") => void;
    onClose: () => void;
}

export function ScriptChoiceModal({ onChoose, onClose }: ScriptChoiceModalProps) {
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
            <div className="flex w-full max-w-md flex-col gap-5 rounded-xl bg-other-card p-6 shadow-2xl">
                <div className="flex items-start justify-between">
                    <h2 className="text-lg font-extrabold text-other-text">Qual script você quer gerar?</h2>
                    <button
                        onClick={onClose}
                        aria-label="Fechar"
                        className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--btn-secondary-border)] text-other-muted transition-colors hover:bg-[var(--btn-secondary-hover-bg)] cursor-pointer"
                    >
                        <FiX size={16} />
                    </button>
                </div>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => onChoose("simple")}
                        className="flex items-start gap-3 rounded-lg border border-other-border p-4 text-left transition-colors hover:bg-[var(--btn-secondary-hover-bg)] cursor-pointer"
                    >
                        <FiFileText size={20} className="mt-0.5 shrink-0 text-other-muted" />
                        <div className="flex flex-col gap-1">
                            <span className="text-sm font-semibold text-other-text">Simples</span>
                            <span className="text-xs text-other-muted">
                                Total e Positivação, direto da consolidação de vendas. Mais rápido, sem descontar devoluções.
                            </span>
                        </div>
                    </button>

                    <button
                        onClick={() => onChoose("complete")}
                        className="flex items-start gap-3 rounded-lg border border-other-border p-4 text-left transition-colors hover:bg-[var(--btn-secondary-hover-bg)] cursor-pointer"
                    >
                        <FiFileText size={20} className="mt-0.5 shrink-0 text-other-muted" />
                        <div className="flex flex-col gap-1">
                            <span className="text-sm font-semibold text-other-text">Completo com devolução</span>
                            <span className="text-xs text-other-muted">
                                Total, Quantidade de produtos e Positivação, líquidos de devolução (venda - devolução).
                            </span>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
