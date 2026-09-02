import { useMemo, useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { CampaignSalesRow } from "../../../interfaces/CampaignSalesRow";
import { formatCurrency } from "../../../utils/formateCurrency";
import { compareValues, SortDirection } from "../../../utils/sortRows";

export interface SalesTableFilters {
  search: string;
  vendedor: string;
}

interface SalesTableProps {
  rows: CampaignSalesRow[];
  filters: SalesTableFilters;
}

const headers: { label: string; key: keyof CampaignSalesRow }[] = [
  { label: "CNPJ", key: "cpfcnpj" },
  { label: "Razão Social", key: "legalName" },
  { label: "Produto", key: "productName" },
  { label: "CodBarras", key: "productEan" },
  { label: "Quantidade", key: "quantitySold" },
  { label: "Total", key: "valueSold" },
  { label: "Nome Vendedor", key: "sellerName" },
];

function matchesFilters(row: CampaignSalesRow, filters: SalesTableFilters): boolean {
  const search = filters.search.trim().toLowerCase();
  if (
    search &&
    !row.cpfcnpj.toLowerCase().includes(search) &&
    !row.legalName.toLowerCase().includes(search) &&
    !row.productName.toLowerCase().includes(search)
  ) {
    return false;
  }
  if (filters.vendedor !== "todos" && row.sellerName !== filters.vendedor) return false;

  return true;
}

export function SalesTable({ rows, filters }: SalesTableProps) {
  const filteredRows = rows.filter((row) => matchesFilters(row, filters));
  const filtersActive = filters.search.trim() !== "" || filters.vendedor !== "todos";

  const [sortKey, setSortKey] = useState<keyof CampaignSalesRow | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  function handleSort(key: keyof CampaignSalesRow) {
    if (sortKey === key) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  }

  const sortedRows = useMemo(() => {
    if (!sortKey) return filteredRows;
    return [...filteredRows].sort((a, b) => compareValues(a[sortKey], b[sortKey], sortDirection));
  }, [filteredRows, sortKey, sortDirection]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="px-6 py-2 text-xs text-other-muted shrink-0">
        {filtersActive
          ? `${filteredRows.length} registro(s) encontrado(s) de ${rows.length} no total`
          : `${rows.length} registro(s) no total`}
      </div>
      <div className="flex-1 overflow-auto px-6 pb-6">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 bg-other-bg">
            <tr>
              {headers.map((header) => (
                <th
                  key={header.key}
                  onClick={() => handleSort(header.key)}
                  className="px-4 py-2 text-left text-[10px] font-medium tracking-widest text-other-muted uppercase whitespace-nowrap cursor-pointer select-none hover:text-other-text"
                >
                  <span className="inline-flex items-center gap-1">
                    {header.label}
                    {sortKey === header.key && (
                      sortDirection === "asc" ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row, index) => (
              <tr key={index} className="border-t border-other-border hover:bg-other-surface">
                <td className="px-4 py-2 text-other-muted whitespace-nowrap">{row.cpfcnpj}</td>
                <td className="px-4 py-2 text-other-muted font-medium whitespace-nowrap">
                  {row.legalName}
                </td>
                <td className="px-4 py-2  text-other-muted  whitespace-nowrap">{row.productName}</td>
                <td className="px-4 py-2 text-other-muted text-xs whitespace-nowrap">
                  {row.productEan}
                </td>
                <td className="px-4 py-2  text-other-muted  whitespace-nowrap">{row.quantitySold}</td>
                <td className="px-4 py-2 text-other-green whitespace-nowrap">
                  {formatCurrency(row.valueSold)}
                </td>
                <td className="px-4 py-2 text-other-muted whitespace-nowrap">{row.sellerName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
