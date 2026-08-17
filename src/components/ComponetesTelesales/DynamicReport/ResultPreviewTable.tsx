import { DynamicReportRow } from "../../../interfaces/DynamicReport";
import { formatMetricValue, getFieldLabel } from "./fields";

interface ResultPreviewTableProps {
    groupBy: string[];
    metrics: string[];
    rows: DynamicReportRow[];
    totals: Record<string, number>;
    loading: boolean;
    error: string;
}

export default function ResultPreviewTable({ groupBy, metrics, rows, totals, loading, error }: ResultPreviewTableProps) {
    const groupedByText = groupBy.length > 0 ? `Agrupado por ${groupBy.map(getFieldLabel).join(", ")}` : "Sem agrupamento";

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
                <div className="bg-other-secondaryBlue px-3 py-1 rounded-lg text-white">
                    <h1>3</h1>
                </div>
                <h1 className="text-other-secondaryBlue font-poppins font-medium text-xl text-nowrap">
                    Prévia do resultado
                </h1>
                <div className="flex bg-other-border flex-1 h-[2px]"></div>
                <span className="text-xs text-gray-400 whitespace-nowrap">{groupedByText}</span>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                {error && <p className="text-sm text-red-500 px-4 py-3">{error}</p>}

                {!error && loading && (
                    <p className="text-sm text-gray-400 px-4 py-6 text-center">Gerando relatório...</p>
                )}

                {!error && !loading && rows.length === 0 && (
                    <p className="text-sm text-gray-400 px-4 py-6 text-center">
                        Configure o relatório e clique em "Gerar relatório" para ver a prévia.
                    </p>
                )}

                {!error && !loading && rows.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-[#32307B] text-white">
                                    {groupBy.length === 0 && <th className="px-4 py-3"></th>}
                                    {groupBy.map((key) => (
                                        <th key={key} className="text-left px-4 py-3 font-semibold uppercase text-xs tracking-wide">
                                            {getFieldLabel(key)}
                                        </th>
                                    ))}
                                    {metrics.map((key) => (
                                        <th key={key} className="text-right px-4 py-3 font-semibold uppercase text-xs tracking-wide">
                                            {getFieldLabel(key)}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row, index) => (
                                    <tr key={index} className="border-t border-gray-100">
                                        {groupBy.length === 0 && <td className="px-4 py-3"></td>}
                                        {groupBy.map((key) => (
                                            <td key={key} className="px-4 py-3 font-medium text-gray-800">
                                                {row.dimensions[key] ?? "-"}
                                            </td>
                                        ))}
                                        {metrics.map((key) => (
                                            <td key={key} className="px-4 py-3 text-right text-gray-700">
                                                {formatMetricValue(key, row.metrics[key] ?? 0)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="border-t-2 border-gray-200 bg-gray-50">
                                    <td
                                        colSpan={Math.max(groupBy.length, 1)}
                                        className="px-4 py-3 font-bold text-gray-800 uppercase text-xs tracking-wide"
                                    >
                                        Total
                                    </td>
                                    {metrics.map((key) => (
                                        <td key={key} className="px-4 py-3 text-right font-bold text-gray-800">
                                            {formatMetricValue(key, totals[key] ?? 0)}
                                        </td>
                                    ))}
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}

                {!error && !loading && rows.length > 0 && (
                    <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100 text-xs text-gray-400">
                        <span>Prévia com {rows.length} grupo(s)</span>
                        <span>Fonte: ApiCampaignDash · canais Televendas + Bees</span>
                    </div>
                )}
            </div>
        </div>
    );
}
