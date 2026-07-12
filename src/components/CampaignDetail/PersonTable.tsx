import { useState } from "react";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import { CampaignPersonRow } from "../../interfaces/CampaignPersonRow";
import { formatCurrency } from "../../utils/formateCurrency";
import { formatPercent } from "../../utils/formatPercent";
import { flattenCampaignPersonRows } from "../../utils/flattenCampaignPersonRows";

export interface PersonTableFilters {
  search: string;
  tipo: string;
  colocacao: string;
  percentMin: number;
  percentMax: number;
}

interface PersonTableProps {
  rows: CampaignPersonRow[];
  filters: PersonTableFilters;
}

const headers = [
  "Pessoa",
  "Tipo",
  "Objetivo",
  "Valor Apurado",
  "% Realizado",
  "Colocação",
  "Premiação",
  "Data Cálculo",
  "Log",
];

function matchesFilters(row: CampaignPersonRow, filters: PersonTableFilters): boolean {
  const search = filters.search.trim().toLowerCase();
  if (
    search &&
    !row.pessoa.toLowerCase().includes(search) &&
    !row.matricula.toLowerCase().includes(search)
  ) {
    return false;
  }
  if (filters.tipo !== "todos" && row.tipo !== filters.tipo) return false;
  if (filters.colocacao !== "Todos" && row.colocacao !== filters.colocacao) return false;

  const percent = row.percentualRealizado ?? 0;
  if (percent < filters.percentMin || percent > filters.percentMax) return false;

  return true;
}

function hasActiveFilters(filters: PersonTableFilters): boolean {
  return (
    filters.search.trim() !== "" ||
    filters.tipo !== "todos" ||
    filters.colocacao !== "Todos" ||
    filters.percentMin > 0 ||
    filters.percentMax < 100
  );
}

function collectExpandableIds(rows: CampaignPersonRow[]): string[] {
  return rows.flatMap((row) => [
    ...(row.children?.length ? [row.id] : []),
    ...(row.children ? collectExpandableIds(row.children) : []),
  ]);
}

export function PersonTable({ rows, filters }: PersonTableProps) {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(collectExpandableIds(rows)));

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const allRows = flattenCampaignPersonRows(rows);
  const filtersActive = hasActiveFilters(filters);
  const filteredFlat = allRows.filter((row) => matchesFilters(row, filters));

  function renderTree(nodes: CampaignPersonRow[], level: number): JSX.Element[] {
    const out: JSX.Element[] = [];
    let lastGroup: string | undefined;

    for (const row of nodes) {
      if (row.group && row.group !== lastGroup) {
        out.push(
          <tr key={`group-${row.id}`} className="bg-white/[0.02]">
            <td
              colSpan={headers.length}
              className="px-4 py-1 text-[10px] tracking-widest text-white/40 uppercase"
              style={{ paddingLeft: 16 + level * 20 }}
            >
              {row.group}
            </td>
          </tr>
        );
      }
      lastGroup = row.group ?? lastGroup;

      const hasChildren = !!row.children?.length;
      const isExpanded = expanded.has(row.id);

      out.push(
        <tr key={row.id} className="border-t border-white/[0.05] hover:bg-white/[0.02]">
          {renderRowCells(row, level, hasChildren, isExpanded)}
        </tr>
      );

      if (hasChildren && isExpanded) {
        out.push(...renderTree(row.children ?? [], level + 1));
      }
    }

    return out;
  }

  function renderRowCells(row: CampaignPersonRow, level: number, hasChildren: boolean, isExpanded: boolean) {
    return (
      <>
        <td className="px-4 py-2 whitespace-nowrap" style={{ paddingLeft: 16 + level * 20 }}>
          <div className="flex items-center gap-2">
            {hasChildren ? (
              <button
                onClick={() => toggle(row.id)}
                className="text-white/40 hover:text-white cursor-pointer"
              >
                {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
              </button>
            ) : (
              <span className="w-4 inline-block shrink-0" />
            )}
            <span className="text-white font-medium">{row.pessoa}</span>
            <span className="text-white/30 text-xs">{row.matricula}</span>
          </div>
        </td>
        <td className="px-4 py-2 text-white/70 whitespace-nowrap">{row.tipo}</td>
        <td className="px-4 py-2 text-white/70 whitespace-nowrap">{formatCurrency(row.objetivo)}</td>
        <td className="px-4 py-2 text-white/70 whitespace-nowrap">{formatCurrency(row.valorApurado)}</td>
        <td className="px-4 py-2 text-white/70 whitespace-nowrap">{formatPercent(row.percentualRealizado)}</td>
        <td className="px-4 py-2 text-white/70 whitespace-nowrap">{row.colocacao ?? "—"}</td>
        <td className="px-4 py-2 text-[#3fb950] whitespace-nowrap">
          {row.premiacao !== null ? formatCurrency(row.premiacao) : "—"}
        </td>
        <td className="px-4 py-2 text-white/50 text-xs whitespace-nowrap">{row.dataCalculo}</td>
        <td className="px-4 py-2 text-white/50 text-xs max-w-[220px] truncate" title={row.log}>
          {row.log}
        </td>
      </>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="px-6 py-2 text-xs text-white/40 shrink-0">
        {filtersActive
          ? `${filteredFlat.length} registro(s) encontrado(s) de ${allRows.length} no total`
          : `${allRows.length} registro(s) no total`}
      </div>
      <div className="flex-1 overflow-auto px-6 pb-6">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 bg-[#0d1117]">
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  className="px-4 py-2 text-left text-[10px] font-medium tracking-widest text-white/40 uppercase whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtersActive
              ? filteredFlat.map((row) => (
                  <tr key={row.id} className="border-t border-white/[0.05] hover:bg-white/[0.02]">
                    {renderRowCells(row, 0, false, false)}
                  </tr>
                ))
              : renderTree(rows, 0)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
