import { ReactNode } from "react";
import { FiX } from "react-icons/fi";
import { getFieldLabel } from "./fields";

interface AreaChipsCardProps {
    icon: ReactNode;
    title: string;
    countLabel: string;
    emptyText?: string;
    fields: string[];
    tagLabel: string;
    tagClassName: string;
    onRemove: (key: string) => void;
}

export default function AreaChipsCard({
    icon,
    title,
    countLabel,
    emptyText = "Solte campos aqui...",
    fields,
    tagLabel,
    tagClassName,
    onRemove,
}: AreaChipsCardProps) {
    return (
        <div className="flex flex-col gap-3 bg-white border border-gray-200 rounded-2xl p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-gray-400">
                    <span className="text-[#32307B]">{icon}</span>
                    {title}
                    <span className="bg-[#32307B]/10 text-[#32307B] rounded-full px-2 py-0.5 text-[11px] font-bold normal-case">
                        {fields.length}
                    </span>
                </div>
                <span className="text-xs text-gray-400">{countLabel}</span>
            </div>

            {fields.length === 0 ? (
                <p className="text-sm text-gray-400 py-1">{emptyText}</p>
            ) : (
                <div className="flex flex-wrap gap-2">
                    {fields.map((key) => (
                        <div
                            key={key}
                            className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50"
                        >
                            <span className="text-sm font-medium text-gray-800">{getFieldLabel(key)}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${tagClassName}`}>
                                {tagLabel}
                            </span>
                            <button
                                type="button"
                                onClick={() => onRemove(key)}
                                className="text-gray-400 hover:text-gray-700 cursor-pointer"
                            >
                                <FiX size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
