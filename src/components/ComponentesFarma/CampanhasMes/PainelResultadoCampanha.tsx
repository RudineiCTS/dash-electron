import dayjs from "dayjs";
import { FiDownload } from "react-icons/fi";
import { CampanhaComercial } from "../../../interfaces/CampanhaComercial";

interface PainelResultadoCampanhaProps {
  campanha: CampanhaComercial;
  onExportar: () => void;
  exportando: boolean;
}

/** Aparece ao abrir a linha: com resultado calculado oferece extrair para Excel; sem ele, explica o que falta. */
export function PainelResultadoCampanha({ campanha, onExportar, exportando }: PainelResultadoCampanhaProps) {
  if (!campanha.ultimoCalculoEm) {
    return (
      <p className="rounded-lg border border-dashed border-gray-200 px-4 py-3 text-sm text-gray-500">
        Esta campanha ainda não tem resultado calculado. Marque-a na grid e clique em Calcular para gerar o resultado e
        poder extrair para Excel.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-indigo-100 bg-indigo-50/60 px-4 py-3">
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-[#32307B]">Resultado do cálculo disponível</span>
        <span className="text-xs text-gray-500">
          Calculado em {dayjs(campanha.ultimoCalculoEm).format("DD/MM/YYYY [às] HH:mm")}
        </span>
      </div>
      <button
        type="button"
        onClick={onExportar}
        disabled={exportando}
        className="flex h-10 items-center gap-2 rounded-lg bg-[#32307B] px-4 text-sm font-semibold text-white transition-[filter]
                   hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
      >
        <FiDownload size={16} />
        {exportando ? "Gerando planilha..." : "Extrair para Excel"}
      </button>
    </div>
  );
}
