import { FiFilter, FiX } from "react-icons/fi";
import { DynamicReportFilter } from "../../../interfaces/DynamicReport";
import { getFieldLabel } from "./fields";

interface FiltersCardProps {
    filters: DynamicReportFilter[];
    onRemove: (field: string) => void;
    onChangeValues: (field: string, rawValue: string) => void;
}

export default function FiltersCard({ filters, onRemove, onChangeValues }: FiltersCardProps) {
    return (
        <div className="flex flex-col gap-3 bg-white border border-gray-200 rounded-2xl p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-gray-400">
                    <span className="text-[#32307B]"><FiFilter size={14} /></span>
                    Filtros
                    <span className="bg-[#32307B]/10 text-[#32307B] rounded-full px-2 py-0.5 text-[11px] font-bold normal-case">
                        {filters.length}
                    </span>
                </div>
                <span className="text-xs text-gray-400">qualquer campo</span>
            </div>

            {filters.length === 0 ? (
                <p className="text-sm text-gray-400 py-1">Solte campos aqui...</p>
            ) : (
                <div className="flex flex-col gap-2">
                    {filters.map((filter) => {
                        const selectedCount = filter.values.filter((v) => v.trim() !== "").length;
                        return (
                            <div
                                key={filter.field}
                                className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-gray-50"
                            >
                                <span className="text-sm font-medium text-gray-800 shrink-0">
                                    {getFieldLabel(filter.field)}
                                </span>
                                <input
                                    value={filter.values.join(", ")}
                                    onChange={(e) => onChangeValues(filter.field, e.target.value)}
                                    placeholder="Valores separados por vírgula"
                                    className="flex-1 min-w-0 h-8 px-2 border border-gray-200 rounded-md bg-white text-sm outline-none
                                               focus:border-[#dd8100] focus:ring-2 focus:ring-[#dd8100]/15"
                                />
                                <span className="text-[10px] font-bold text-[#dd8100] bg-[#dd8100]/10 px-1.5 py-0.5 rounded shrink-0">
                                    {selectedCount} selec.
                                </span>
                                <button
                                    type="button"
                                    onClick={() => onRemove(filter.field)}
                                    className="text-gray-400 hover:text-gray-700 cursor-pointer shrink-0"
                                >
                                    <FiX size={12} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
