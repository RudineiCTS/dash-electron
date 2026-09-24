import { ReactNode } from "react";

export interface TableRow {
    key: string | number;
    cells: ReactNode[];
}

export interface TableComponentProps {
    listHeaders: { id: number; name: string }[];
    rows: TableRow[];
    loading?: boolean;
    erro?: string | null;
    mensagemVazio?: string;
}

export function TableComponent({
    listHeaders,
    rows,
    loading = false,
    erro = null,
    mensagemVazio = "Nenhum registro encontrado.",
}: TableComponentProps) {
    const colSpan = listHeaders.length + 1;

    return (
        <>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-indigo-950 text-xs font-bold uppercase tracking-wide text-white">
              <th className="w-10  py-3 pl-4" />
              {listHeaders.map((header) => (
                <th key={header.id} className="px-3 py-3 text-left">
                  {header.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={colSpan} className="px-4 py-6 text-center text-sm text-gray-400">
                  Carregando...
                </td>
              </tr>
            ) : erro ? (
              <tr>
                <td colSpan={colSpan} className="px-4 py-6 text-center text-sm text-red-500">
                  {erro}
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="px-4 py-6 text-center text-sm text-gray-400">
                  {mensagemVazio}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.key} className="border-b border-gray-100 last:border-none hover:bg-gray-50">
                  <td className="w-10 py-2.5 pl-4" />
                  {row.cells.map((cell, index) => (
                    <td key={index} className="px-3 py-2.5 text-gray-700">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
        </>
    )
}
