import { Fragment } from "react";
import { FiCheck } from "react-icons/fi";

interface EtapasScriptProps {
  scriptSalvo: boolean;
  executado: boolean;
  retornoGuardado: boolean;
  inserido: boolean;
}

export function EtapasScript({ scriptSalvo, executado, retornoGuardado, inserido }: EtapasScriptProps) {
  const etapas = [
    { rotulo: "Executado", feito: executado },
    { rotulo: "Script salvo", feito: scriptSalvo },
    { rotulo: "Retorno guardado", feito: retornoGuardado },
    { rotulo: "Inserido", feito: inserido },
  ];

  return (
    <ol className="flex flex-wrap items-center gap-3 text-sm">
      {etapas.map((etapa, i) => (
        <Fragment key={etapa.rotulo}>
          <li className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                etapa.feito ? "bg-green-500 text-white" : "bg-other-border text-other-muted"
              }`}
            >
              {etapa.feito ? <FiCheck size={14} strokeWidth={3} /> : i + 1}
            </span>
            <span className={etapa.feito ? "font-medium text-other-text" : "text-other-muted"}>{etapa.rotulo}</span>
          </li>
          {i < etapas.length - 1 && <span className="h-px w-6 bg-other-border" aria-hidden />}
        </Fragment>
      ))}
    </ol>
  );
}
