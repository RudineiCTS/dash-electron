import { FiFilter } from "react-icons/fi";

export interface DynamicReportScopeForm {
    idCampanha: string;
    idFabricante: string;
    linha: string;
    mesCompetencia: string;
}

interface ScopeCardProps {
    scope: DynamicReportScopeForm;
    onChange: (scope: DynamicReportScopeForm) => void;
    onClearScope: () => void;
    onLoadScope: () => void;
}

const inputClasses =
    "h-10 px-3 border border-gray-200 rounded-lg bg-white text-sm text-gray-800 outline-none " +
    "transition-colors focus:border-[#dd8100] focus:ring-2 focus:ring-[#dd8100]/15 w-full";

export default function ScopeCard({ scope, onChange, onClearScope, onLoadScope }: ScopeCardProps) {
    const recortesAtivos = Object.values(scope).filter((v) => v.trim() !== "").length;

    const summary =
        recortesAtivos === 0
            ? "Nenhum recorte — a consulta varre toda a base do período"
            : `${recortesAtivos} recorte(s) aplicado(s) ao escopo da consulta`;

    return (
        <div className="flex flex-col gap-4 bg-white border border-gray-200 rounded-2xl p-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-gray-400">
                    <FiFilter className="text-[#32307B]" size={14} />
                    Escopo da consulta
                    <span className="bg-[#dd8100]/10 text-[#dd8100] rounded-full px-2 py-0.5 text-[11px] font-bold normal-case">
                        4 recortes disponíveis
                    </span>
                </div>
                <span className="text-xs text-gray-400">Base grande — recorte antes de montar o relatório</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
                        ID Campanha
                    </label>
                    <input
                        className={inputClasses}
                        placeholder="Todas as campanhas"
                        value={scope.idCampanha}
                        onChange={(e) => onChange({ ...scope, idCampanha: e.target.value })}
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
                        ID Fabricante
                    </label>
                    <input
                        className={inputClasses}
                        placeholder="Todos os fabricantes"
                        value={scope.idFabricante}
                        onChange={(e) => onChange({ ...scope, idFabricante: e.target.value })}
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
                        Linha de Produto
                    </label>
                    <input
                        className={inputClasses}
                        placeholder="Todas as linhas"
                        value={scope.linha}
                        onChange={(e) => onChange({ ...scope, linha: e.target.value })}
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
                        Mês Competência
                    </label>
                    <input
                        className={inputClasses}
                        placeholder="Todas as competências"
                        value={scope.mesCompetencia}
                        onChange={(e) => onChange({ ...scope, mesCompetencia: e.target.value })}
                    />
                </div>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-gray-100">
                <span className="text-sm text-gray-500">{summary}</span>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onClearScope}
                        className="h-10 px-4 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                    >
                        Limpar escopo
                    </button>
                    <button
                        type="button"
                        onClick={onLoadScope}
                        className="h-10 px-4 rounded-lg bg-gradient-to-b from-[#ea9a2d] to-[#dd8100] text-sm font-semibold text-white hover:brightness-105 active:brightness-95 cursor-pointer"
                    >
                        Carregar dados
                    </button>
                </div>
            </div>
        </div>
    );
}
