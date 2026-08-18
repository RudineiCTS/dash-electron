import { DynamicReportField, DynamicReportFieldKind } from "../../../interfaces/DynamicReport";

export const AVAILABLE_FIELDS: DynamicReportField[] = [
    { key: "IDCampanha", label: "ID Campanha", kind: "id" },
    { key: "NomeCampanha", label: "Nome da Campanha", kind: "text" },
    { key: "IDFabricante", label: "ID Fabricante", kind: "id" },
    { key: "NomeFabricante", label: "Fabricante", kind: "text" },
    { key: "Linha", label: "Linha de Produto", kind: "text" },
    { key: "Origem", label: "Origem", kind: "text", disabled: true },
    { key: "IDVendedor", label: "Vendedor", kind: "text" },
    { key: "IDSupervisor", label: "Supervisor", kind: "text" },
    { key: "IDGerente", label: "Gerente", kind: "text" },
    { key: "DataCompetencia", label: "Mês / Competência", kind: "date" },
    { key: "ValorVendido", label: "Valor Vendido", kind: "metric" },
    { key: "Positivacao", label: "Positivação", kind: "metric" },
];

export const FIELD_KIND_BADGE: Record<DynamicReportFieldKind, string> = {
    id: "#",
    text: "Ab",
    date: "Dt",
    metric: "Σ",
};

export function getFieldLabel(key: string): string {
    return AVAILABLE_FIELDS.find((f) => f.key === key)?.label ?? key;
}

export function getFieldByKey(key: string): DynamicReportField | undefined {
    return AVAILABLE_FIELDS.find((f) => f.key === key);
}

export function formatMetricValue(key: string, value: number): string {
    if (key === "ValorVendido") {
        return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    }
    return value.toLocaleString("pt-BR");
}
