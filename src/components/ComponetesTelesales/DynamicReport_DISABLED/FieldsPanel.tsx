import { useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { AVAILABLE_FIELDS, FIELD_KIND_BADGE } from "./fields";

interface FieldsPanelProps {
    groupBy: string[];
    columns: string[];
    metrics: string[];
    filters: string[];
    onAddGroupBy: (key: string) => void;
    onAddColumn: (key: string) => void;
    onAddMetric: (key: string) => void;
    onAddFilter: (key: string) => void;
}

const miniButtonClasses =
    "px-2 py-1 rounded-md text-[11px] font-semibold border transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer";

export default function FieldsPanel({
    groupBy,
    columns,
    metrics,
    filters,
    onAddGroupBy,
    onAddColumn,
    onAddMetric,
    onAddFilter,
}: FieldsPanelProps) {
    const [search, setSearch] = useState("");

    const filteredFields = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return AVAILABLE_FIELDS;
        return AVAILABLE_FIELDS.filter((f) => f.label.toLowerCase().includes(term));
    }, [search]);

    return (
        <div className="flex flex-col gap-3 bg-white border border-gray-200 rounded-2xl p-4">
            <span className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
                Campos disponíveis
            </span>

            <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar campo..."
                    className="w-full h-9 pl-8 pr-3 border border-gray-200 rounded-lg text-sm outline-none
                               focus:border-[#dd8100] focus:ring-2 focus:ring-[#dd8100]/15"
                />
            </div>

            <p className="text-xs text-gray-400 -mt-1">Clique em + para adicionar a uma área.</p>

            <div className="flex flex-col gap-2 max-h-[420px] overflow-y-auto pr-1">
                {filteredFields.map((field) => (
                    <div
                        key={field.key}
                        title={field.disabled ? "Em breve" : undefined}
                        className={`flex items-center justify-between gap-2 border border-gray-100 rounded-lg px-3 py-2 ${
                            field.disabled ? "opacity-50" : ""
                        }`}
                    >
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="shrink-0 w-6 h-6 flex items-center justify-center rounded-md bg-[#32307B]/10 text-[#32307B] text-[11px] font-bold">
                                {FIELD_KIND_BADGE[field.kind]}
                            </span>
                            <div className="min-w-0">
                                <div className="text-sm font-medium text-gray-800 truncate">{field.label}</div>
                                <div className="text-[11px] text-gray-400 truncate">{field.key}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                            {field.kind === "metric" ? (
                                <button
                                    type="button"
                                    disabled={field.disabled || metrics.includes(field.key)}
                                    onClick={() => onAddMetric(field.key)}
                                    className={`${miniButtonClasses} border-[#dd8100] text-[#dd8100] hover:bg-[#dd8100]/10`}
                                >
                                    + Métrica
                                </button>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        disabled={field.disabled || groupBy.includes(field.key)}
                                        onClick={() => onAddGroupBy(field.key)}
                                        className={`${miniButtonClasses} border-[#32307B] text-[#32307B] hover:bg-[#32307B]/10`}
                                    >
                                        + Linha
                                    </button>
                                    <button
                                        type="button"
                                        disabled={field.disabled || columns.includes(field.key)}
                                        onClick={() => onAddColumn(field.key)}
                                        className={`${miniButtonClasses} border-gray-300 text-gray-600 hover:bg-gray-100`}
                                    >
                                        + Coluna
                                    </button>
                                    <button
                                        type="button"
                                        disabled={field.disabled || filters.includes(field.key)}
                                        onClick={() => onAddFilter(field.key)}
                                        className={`${miniButtonClasses} border-gray-300 text-gray-600 hover:bg-gray-100`}
                                    >
                                        + Filtro
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))}

                {filteredFields.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-4">Nenhum campo encontrado.</p>
                )}
            </div>
        </div>
    );
}
