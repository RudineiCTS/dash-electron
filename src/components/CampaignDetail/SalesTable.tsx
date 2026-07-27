import { CampaignSalesRow } from "../../interfaces/CampaignSalesRow";
import { formatCurrency } from "../../utils/formateCurrency";

export interface SalesTableFilters {
  search: string;
  vendedor: string;
}

interface SalesTableProps {
  rows: CampaignSalesRow[];
  filters: SalesTableFilters;
}

const headers = [
  "CNPJ",
  "Razão Social",
  "Produto",
  "CodBarras",
  "Quantidade",
  "Total",
  "Nome Vendedor",
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
                  key={header}
                  className="px-4 py-2 text-left text-[10px] font-medium tracking-widest text-other-muted uppercase whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr  className="border-t border-other-border hover:bg-other-surface">
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
