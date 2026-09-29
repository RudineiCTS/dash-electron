import { useMemo, useState } from "react";
import { Search } from "lucide-react";

export interface KpiItem {
    id: number;
    label: string;
}

export const GRUPOS_KPI: KpiItem[] = [
    { id: 1, label: "Fabricante" },
    { id: 2, label: "Origem" },
    { id: 3, label: "Faixa Premiação" },
    { id: 4, label: "Cenários" },
    { id: 5, label: "Fabricante Calculo Premiação" },
    { id: 6, label: "Gerente Atual" },
    { id: 7, label: "Produtos" },
    { id: 8, label: "Regra validação Faixa" },
    { id: 9, label: "Operação" },
    { id: 10, label: "Linha de Produto" },
    { id: 11, label: "Regra Validação" },
    { id: 12, label: "Cliente" },
    { id: 13, label: "Bandeira" },
    { id: 14, label: "Setor" },
    { id: 15, label: "Condição" },
    { id: 16, label: "Grupo de produtos" },
];

interface KpiSideBarPanelProps {
    subtitulo: string;
    buscaHabilitada?: boolean;
    onSelecionarKpi?: (item: KpiItem) => void;
}

export function KpiSideBarPanel({ subtitulo, buscaHabilitada = true, onSelecionarKpi }: KpiSideBarPanelProps) {
    const [busca, setBusca] = useState("");
    const [kpiSelecionadoId, setKpiSelecionadoId] = useState<number>(
        GRUPOS_KPI.find((i) => i.label === "Cenários")?.id ?? GRUPOS_KPI[0].id
    );

    const itens = useMemo(() => {
        const termo = buscaHabilitada ? busca.trim().toLowerCase() : "";
        if (!termo) return GRUPOS_KPI;
        return GRUPOS_KPI.filter((item) => item.label.toLowerCase().includes(termo));
    }, [busca, buscaHabilitada]);

    function handleSelecionar(item: KpiItem) {
        setKpiSelecionadoId(item.id);
        onSelecionarKpi?.(item);
    }

    return (
        <div className="flex flex-col gap-5 px-5 py-6">
            <div className="flex flex-col gap-1">
                <h2 className="text-base font-bold text-other-text">Indicadores de Desempenho</h2>
                <span className="text-xs text-other-muted">{subtitulo}</span>
            </div>

            <label
                className={`flex items-center gap-2 rounded-lg border border-other-border bg-other-bg px-3 py-2 ${
                    !buscaHabilitada ? "cursor-not-allowed opacity-50" : ""
                }`}
            >
                <Search size={16} className="text-other-muted shrink-0" />
                <input
                    type="text"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    disabled={!buscaHabilitada}
                    placeholder={buscaHabilitada ? "Buscar KPIs..." : "Disponível na aba Parâmetros da meta"}
                    className="w-full bg-transparent text-sm text-other-text outline-none placeholder:text-other-muted disabled:cursor-not-allowed"
                />
            </label>

            <div className="flex flex-col gap-1">
                {itens.map((item) => {
                    const ativo = kpiSelecionadoId === item.id;
                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => handleSelecionar(item)}
                            className={`w-full rounded-lg px-4 py-2.5 text-left text-sm font-semibold cursor-pointer transition-colors ${
                                ativo
                                    ? "bg-other-orange text-white"
                                    : "bg-transparent text-other-text hover:bg-other-hoverbg"
                            }`}
                        >
                            {item.label}
                        </button>
                    );
                })}
                {itens.length === 0 && (
                    <p className="px-1 text-sm text-other-muted">Nenhum KPI encontrado.</p>
                )}
            </div>
        </div>
    );
}
