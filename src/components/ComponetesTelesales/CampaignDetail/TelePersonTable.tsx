import { formatCurrency } from "../../../utils/formateCurrency";
import { formatPercent } from "../../../utils/formatPercent";
import { CampaignResult } from "../../../interfaces/CampaignResultTelesales";

export interface PersonTableFilters {
  search: string;
  tipo: string;
  colocacao: string;
  percentMin: number;
  percentMax: number;
}

interface PersonTableProps {
  rows: CampaignResult[];
  filters: PersonTableFilters;
}

const headers = [
  "Pessoa",  
  "Objetivo",
  "Valor Apurado",
  "% Realizado",
  "Colocação",
  "Premiação"
];

function matchesFilters(row: CampaignResult, filters: PersonTableFilters): boolean {
  const search = filters.search.trim().toLowerCase();
  if (
    search &&
    !row.operatorName.toLowerCase().includes(search) &&
    !row.idPersonSales.toString().includes(search)
  ) {
    return false;
  }
  // if (filters.tipo !== "todos" && row.tipo !== filters.tipo) return false;
  if (filters.colocacao !== "Todos" && row.ranking.toString() !== filters.colocacao) return false;

  const percent = row.percentageAchieved ?? 0;
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

// function collectExpandableIds(rows: CampaignResult[]): string[] {
//   return rows.flatMap((row) => [
//     ...(row.children?.length ? [row.id] : []),
//     ...(row.children ? collectExpandableIds(row.children) : []),
//   ]);
// }

export function TelePersonTable({ rows, filters }: PersonTableProps) {

  const allRows = rows;
  console.log(allRows);
  const filtersActive = hasActiveFilters(filters);
  const filteredFlat = rows.filter((row) => matchesFilters(row, filters));
  console.log(filteredFlat)

  function renderRowCells(row: CampaignResult, level: number) {
    return (
      <>
        <td className="px-4 py-2 whitespace-nowrap" style={{ paddingLeft: 16 + level * 20 }}>
          <div className="flex items-center gap-2">

              <span className="w-4 inline-block shrink-0" />
          
            <span className="text-other-muted font-medium">{row.operatorName}</span>
            <span className="text-other-muted text-xs">{row.idPersonSales}</span>
          </div>
        </td>
        {/* <td className="px-4 py-2 text-white/70 whitespace-nowrap">{row.tipo}</td> */}
        <td className="px-4 py-2 text-other-muted whitespace-nowrap">{formatCurrency(row.individualTarget)}</td>
        <td className="px-4 py-2 text-other-muted whitespace-nowrap">{row.campaignTypeDescription === 'QUANTIDADE VENDIDA' ? row.assessedValue 
                                                                      : row.campaignTypeDescription === 'POSITIVAÇÃO' ? row.assessedValue : formatCurrency(row.assessedValue)}</td>
        <td className="px-4 py-2 text-other-muted whitespace-nowrap">{formatPercent(row.percentageAchieved)}</td>
        <td className="px-4 py-2 text-other-muted whitespace-nowrap">{row.ranking ?? "—"}</td>
        <td className="px-4 py-2 text-other-accent whitespace-nowrap">
          {row.award !== null ? formatCurrency(row.award) : "—"}
        </td>
      </>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="px-6 py-2 text-xs text-other-muted shrink-0">
        {filtersActive
          ? `${filteredFlat.length} registro(s) encontrado(s) de ${allRows.length} no total`
          : `${allRows.length} registro(s) no total`}
      </div>
      <div className="flex-1 overflow-auto px-6 pb-6">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 bg-github-bg">
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
            {filteredFlat.map((row) => (
                  <tr key={row.idPersonSales} className="border-t border-github-border hover:to-other-border">
                    {renderRowCells(row, 0)}
                  </tr>
                ))
              }
          </tbody>
        </table>
      </div>
    </div>
  );
}
