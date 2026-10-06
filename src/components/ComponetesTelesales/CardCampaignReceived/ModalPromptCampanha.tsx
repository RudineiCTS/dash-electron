import { useState } from "react";
import { FiCheck, FiCopy, FiX } from "react-icons/fi";
import { PromptGerado } from "../../../utils/gerarPromptCampanha";

interface ModalPromptCampanhaProps {
  titulo: string;
  resultado: PromptGerado;
  onClose: () => void;
}

export function ModalPromptCampanha({ titulo, resultado, onClose }: ModalPromptCampanhaProps) {
  const [texto, setTexto] = useState(resultado.prompt);
  const [copiado, setCopiado] = useState(false);
  const [erroCopia, setErroCopia] = useState("");

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      setErroCopia("");
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setErroCopia("Não foi possível copiar automaticamente. Selecione o texto e use Ctrl+C.");
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col gap-4 rounded-xl bg-other-card p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-extrabold text-other-text">Prompt para a skill</h2>
            <span className="text-xs text-other-muted">{titulo}</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[var(--btn-secondary-border)] text-other-muted transition-colors hover:bg-[var(--btn-secondary-hover-bg)] cursor-pointer"
          >
            <FiX size={16} />
          </button>
        </div>

        <ul className="flex flex-col gap-1 text-xs text-other-muted">
          {resultado.resumo.map((linha) => (
            <li key={linha}>• {linha}</li>
          ))}
        </ul>

        {resultado.avisos.length > 0 && (
          <div className="flex flex-col gap-1 rounded-lg border border-other-orange/40 bg-other-orange/10 px-3 py-2 text-xs text-other-text">
            <strong>Confira antes de colar:</strong>
            {resultado.avisos.map((aviso) => (
              <span key={aviso}>{aviso}</span>
            ))}
          </div>
        )}

        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          spellCheck={false}
          className="min-h-[40vh] w-full flex-1 resize-none rounded-lg border border-other-border bg-other-bg p-3 font-mono text-xs text-other-text outline-none focus:border-other-orange"
        />

        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-other-muted">
            {erroCopia ? <span className="text-red-500">{erroCopia}</span> : `${texto.length.toLocaleString("pt-BR")} caracteres`}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="h-10 rounded-lg border border-other-border px-4 text-sm font-semibold text-other-text transition-colors hover:bg-[var(--btn-secondary-hover-bg)] cursor-pointer"
            >
              Fechar
            </button>
            <button
              onClick={copiar}
              className="flex h-10 items-center gap-2 rounded-lg bg-other-orange px-4 text-sm font-semibold text-white transition-[filter] hover:brightness-105 active:brightness-95 cursor-pointer"
            >
              {copiado ? <FiCheck size={16} /> : <FiCopy size={16} />}
              {copiado ? "Copiado!" : "Copiar prompt"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
