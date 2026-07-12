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
    !row.cnpj.toLowerCase().includes(search) &&
    !row.razaoSocial.toLowerCase().includes(search) &&
    !row.produto.toLowerCase().includes(search)
  ) {
    return false;
  }
  if (filters.vendedor !== "todos" && row.nomeVendedor !== filters.vendedor) return false;

  return true;
}

export function SalesTable({ rows, filters }: SalesTableProps) {
  const filteredRows = rows.filter((row) => matchesFilters(row, filters));
  const filtersActive = filters.search.trim() !== "" || filters.vendedor !== "todos";

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="px-6 py-2 text-xs text-white/40 shrink-0">
        {filtersActive
          ? `${filteredRows.length} registro(s) encontrado(s) de ${rows.length} no total`
          : `${rows.length} registro(s) no total`}
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
            {filteredRows.map((row) => (
              <tr key={row.id} className="border-t border-white/[0.05] hover:bg-white/[0.02]">
                <td className="px-4 py-2 text-white/70 whitespace-nowrap">{row.cnpj}</td>
                <td className="px-4 py-2 text-white font-medium whitespace-nowrap">
                  {row.razaoSocial}
                </td>
                <td className="px-4 py-2 text-white/70 whitespace-nowrap">{row.produto}</td>
                <td className="px-4 py-2 text-white/50 text-xs whitespace-nowrap">
                  {row.codBarras}
                </td>
                <td className="px-4 py-2 text-white/70 whitespace-nowrap">{row.quantidade}</td>
                <td className="px-4 py-2 text-[#3fb950] whitespace-nowrap">
                  {formatCurrency(row.total)}
                </td>
                <td className="px-4 py-2 text-white/70 whitespace-nowrap">{row.nomeVendedor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
