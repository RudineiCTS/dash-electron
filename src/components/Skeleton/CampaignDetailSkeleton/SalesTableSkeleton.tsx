import { Skeleton } from "../Skeleton";

const COLUNAS = [
  "w-24", // CNPJ
  "w-48", // Razão Social
  "w-40", // Produto
  "w-20", // CodBarras
  "w-16", // Quantidade
  "w-24", // Total
  "w-32", // Nome Vendedor
];

interface SalesTableSkeletonProps {
  linhas?: number;
}

export function SalesTableSkeleton({ linhas = 8 }: SalesTableSkeletonProps) {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="px-6 py-2 shrink-0">
        <Skeleton variant="text" className="w-40" />
      </div>
      <div className="flex-1 overflow-auto px-6 pb-6">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {COLUNAS.map((largura, i) => (
                <th key={i} className="px-4 py-2 text-left">
                  <Skeleton variant="text" className={`${largura} h-3`} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: linhas }, (_, linha) => (
              <tr key={linha} className="border-t border-other-border">
                {COLUNAS.map((largura, coluna) => (
                  <td key={coluna} className="px-4 py-3">
                    <Skeleton variant="text" className={largura} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
