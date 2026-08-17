import { useState } from "react";
import { FiBarChart2, FiColumns, FiList } from "react-icons/fi";
import { DynamicReportFilter, DynamicReportRequest } from "../../../interfaces/DynamicReport";
import { useDynamicReport } from "../../../hook/useDynamicReport";
import ScopeCard, { DynamicReportScopeForm } from "./ScopeCard";
import FieldsPanel from "./FieldsPanel";
import GroupingPresetCard from "./GroupingPresetCard";
import AreaChipsCard from "./AreaChipsCard";
import FiltersCard from "./FiltersCard";
import ResultPreviewTable from "./ResultPreviewTable";
import { getFieldLabel } from "./fields";

const EMPTY_SCOPE: DynamicReportScopeForm = {
    idCampanha: "",
    idFabricante: "",
    linha: "",
    mesCompetencia: "",
};

function toNumberList(raw: string): number[] {
    return raw
        .split(",")
        .map((v) => Number(v.trim()))
        .filter((n) => !Number.isNaN(n));
}

function toStringList(raw: string): string[] {
    return raw
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
}

export default function DynamicReportTab() {
    const [scope, setScope] = useState<DynamicReportScopeForm>(EMPTY_SCOPE);
    const [groupBy, setGroupBy] = useState<string[]>([]);
    const [columns, setColumns] = useState<string[]>([]);
    const [metrics, setMetrics] = useState<string[]>([]);
    const [filters, setFilters] = useState<DynamicReportFilter[]>([]);

    const { report, setReport, loading, error, generateReport } = useDynamicReport();

    function addUnique(list: string[], key: string): string[] {
        return list.includes(key) ? list : [...list, key];
    }

    function toggleGroupByField(field: string) {
        setGroupBy((prev) => (prev.includes(field) ? prev.filter((k) => k !== field) : [...prev, field]));
    }

    function addFilter(key: string) {
        setFilters((prev) => (prev.some((f) => f.field === key) ? prev : [...prev, { field: key, values: [] }]));
    }

    function changeFilterValues(field: string, raw: string) {
        setFilters((prev) => prev.map((f) => (f.field === field ? { ...f, values: toStringList(raw) } : f)));
    }

    function handleClearScope() {
        setScope(EMPTY_SCOPE);
    }

    function handleLoadScope() {

        setReport(undefined);
    }

    const activeFilters = filters.filter((f) => f.values.length > 0);

    const hasCompetence = scope.mesCompetencia.trim() !== "";
    const hasCampaignOrManufacturer = scope.idCampanha.trim() !== "" || scope.idFabricante.trim() !== "";
    const scopeValid = hasCompetence && hasCampaignOrManufacturer;

    function handleGerarRelatorio() {
        const request: DynamicReportRequest = {
            scope: {
                idCampaigns: toNumberList(scope.idCampanha),
                idManufacturers: toNumberList(scope.idFabricante),
                productLines: toStringList(scope.linha),
                competenceMonths: toStringList(scope.mesCompetencia),
            },
            groupBy,
            columns,
            metrics,
            filters: activeFilters,
        };

        console.log(request);
        generateReport(request);
    }

    return (
        <div className="flex flex-col gap-6">
            <ScopeCard
                scope={scope}
                onChange={setScope}
                onClearScope={handleClearScope}
                onLoadScope={handleLoadScope}
            />

            <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-start">
                <FieldsPanel
                    groupBy={groupBy}
                    columns={columns}
                    metrics={metrics}
                    filters={filters.map((f) => f.field)}
                    onAddGroupBy={(key) => setGroupBy((prev) => addUnique(prev, key))}
                    onAddColumn={(key) => setColumns((prev) => addUnique(prev, key))}
                    onAddMetric={(key) => setMetrics((prev) => addUnique(prev, key))}
                    onAddFilter={addFilter}
                />

                <div className="flex flex-col gap-6">
                    <GroupingPresetCard
                        groupBy={groupBy}
                        onToggleField={toggleGroupByField}
                        onClearGroupBy={() => setGroupBy([])}
                    />

                    <AreaChipsCard
                        icon={<FiList size={14} />}
                        title="Agrupar por (linhas)"
                        countLabel="dimensões"
                        fields={groupBy}
                        tagLabel="DIM"
                        tagClassName="bg-[#32307B]/10 text-[#32307B]"
                        onRemove={(key) => setGroupBy((prev) => prev.filter((k) => k !== key))}
                    />

                    <AreaChipsCard
                        icon={<FiColumns size={14} />}
                        title="Colunas"
                        countLabel="dimensões"
                        fields={columns}
                        tagLabel="DIM"
                        tagClassName="bg-[#32307B]/10 text-[#32307B]"
                        onRemove={(key) => setColumns((prev) => prev.filter((k) => k !== key))}
                    />

                    <AreaChipsCard
                        icon={<FiBarChart2 size={14} />}
                        title="Métricas"
                        countLabel="valores agregados"
                        fields={metrics}
                        tagLabel="MÉT"
                        tagClassName="bg-[#dd8100]/10 text-[#dd8100]"
                        onRemove={(key) => setMetrics((prev) => prev.filter((k) => k !== key))}
                    />

                    <FiltersCard filters={filters} onRemove={(field) => setFilters((prev) => prev.filter((f) => f.field !== field))} onChangeValues={changeFilterValues} />

                    <div className="flex flex-col gap-2">
                        <button
                            type="button"
                            disabled={!scopeValid || metrics.length === 0 || loading}
                            onClick={handleGerarRelatorio}
                            className="h-11 rounded-lg bg-gradient-to-b from-[#ea9a2d] to-[#dd8100] text-sm font-semibold text-white
                                       hover:brightness-105 active:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {loading ? "Gerando..." : "Gerar relatório"}
                        </button>

                        {!scopeValid && (
                            <p className="text-xs text-[#dd8100]">
                                Selecione o Mês Competência e informe ID Campanha ou ID Fabricante no escopo da consulta.
                            </p>
                        )}

                        {scopeValid && metrics.length === 0 && (
                            <p className="text-xs text-[#dd8100]">Adicione ao menos uma métrica para gerar o relatório.</p>
                        )}

                        <p className="text-xs text-gray-400">
                            {groupBy.length} dimensão(ões) · {metrics.length} métrica(s) · {activeFilters.length} filtro(s)
                        </p>

                        {activeFilters.length > 0 && (
                            <p className="text-xs text-gray-400 italic">
                                Valores filtrados — {activeFilters.map((f) => `${getFieldLabel(f.field)}: ${f.values.join(", ")}`).join(" · ")}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <ResultPreviewTable
                groupBy={groupBy}
                metrics={metrics}
                rows={report?.rows ?? []}
                totals={report?.totals ?? {}}
                loading={loading}
                error={error}
            />
        </div>
    );
}
