import { useState } from "react";
import { TableComponent, TableRow } from "./SharedGeneral/TableComponent";
import { useComissaoVendasKpi } from "../../hook/useComissaoVendasKpi";

const listHeaders = [
    { id: 0, name: "Código" },
    { id: 1, name: "Descrição KPI" },
    { id: 2, name: "Natureza" },
    { id: 3, name: "Prioridade" },
    { id: 4, name: "Tipo Pessoa" },
    { id: 5, name: "Fórmula de Cálculo" },
    { id: 6, name: "Tipo Meta" },
    { id: 7, name: "Faixa Premiação" },
    { id: 8, name: "Nome KPI" },
];

interface ParametrosMetaKpiProps {
    dataFim: string | null;
    busca?: string;
    reloadToken?: number;
    onSelecionarKpi?: (idComissaoVendasKpi: number) => void;
}

export function ParametrosMetaKpi({ dataFim, busca = "", reloadToken, onSelecionarKpi }: ParametrosMetaKpiProps) {
    const { kpis, loading, error } = useComissaoVendasKpi(dataFim, reloadToken);
    const [kpiSelecionadoId, setKpiSelecionadoId] = useState<number | null>(null);

    const termo = busca.trim().toLowerCase();
    const kpisFiltrados = termo
        ? kpis.filter(
              (kpi) =>
                  kpi.codigoKpi?.toLowerCase().includes(termo) ||
                  kpi.descricaoKpi?.toLowerCase().includes(termo) ||
                  kpi.nomeKpi?.toLowerCase().includes(termo)
          )
        : kpis;

    const linhas: TableRow[] = kpisFiltrados.map((kpi) => ({
        key: kpi.idComissaoVendasKpi,
        cells: [
            kpi.codigoKpi ?? "-",
            kpi.descricaoKpi ?? "-",
            kpi.natureza ?? "-",
            kpi.prioridade ?? "-",
            kpi.tipoPessoa ?? "-",
            kpi.descricaoFormulaCalculo ?? "-",
            kpi.descricaoMetaTipo ?? "-",
            kpi.descricaoTipoFaixaPremiacao ?? "-",
            kpi.nomeKpi ?? "-",
        ],
    }));

    function handleClickLinha(key: string | number) {
        const id = Number(key);
        setKpiSelecionadoId(id);
        onSelecionarKpi?.(id);
    }

    return (
        <TableComponent
            listHeaders={listHeaders}
            rows={linhas}
            loading={loading}
            erro={error || null}
            linhaExpandidaKey={kpiSelecionadoId}
            onClickLinha={handleClickLinha}
            mensagemVazio={
                dataFim == null
                    ? "Selecione uma competência para ver os KPIs."
                    : termo
                    ? "Nenhum KPI encontrado para essa busca."
                    : "Nenhum KPI encontrado para essa competência."
            }
        />
    );
}
