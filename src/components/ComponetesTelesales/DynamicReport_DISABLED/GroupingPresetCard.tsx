interface GroupingPreset {
    label: string;
    field: string | null;
}

const PRESETS: GroupingPreset[] = [
    { label: "Totalizado", field: null },
    { label: "Por fabricante", field: "NomeFabricante" },
    { label: "Por vendedor", field: "IDVendedor" },
    { label: "Por campanha", field: "NomeCampanha" },
    { label: "Por supervisor", field: "IDSupervisor" },
];

interface GroupingPresetCardProps {
    groupBy: string[];
    onToggleField: (field: string) => void;
    onClearGroupBy: () => void;
}

export default function GroupingPresetCard({ groupBy, onToggleField, onClearGroupBy }: GroupingPresetCardProps) {
    return (
        <div className="flex flex-col gap-3 bg-white border border-gray-200 rounded-2xl p-4">
            <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
                    Nível de agrupamento
                </span>
                <span className="text-xs text-gray-400">atalho — ajuste fino nas áreas abaixo</span>
            </div>

            <div className="flex flex-wrap gap-2">
                {PRESETS.map((preset) => {
                    const active = preset.field === null ? groupBy.length === 0 : groupBy.includes(preset.field);
                    return (
                        <button
                            key={preset.label}
                            type="button"
                            onClick={() => (preset.field === null ? onClearGroupBy() : onToggleField(preset.field))}
                            className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
                                active
                                    ? "bg-[#32307B] border-[#32307B] text-white"
                                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                            }`}
                        >
                            {preset.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
