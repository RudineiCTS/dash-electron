import { FiHash } from "react-icons/fi";

export type TipoCampanha = "vendas" | "positivacao";

export interface CampanhaApurada {
  id: number | string;
  descricao: string;
  tipo: TipoCampanha;
  valorApurado: number;
  /** formato do valor apurado e da meta */
  formato?: "moeda" | "numero";
  /** null/undefined = "sem meta" */
  meta?: number | null;
}

interface CampanhasApuradasTableProps {  
  campanhas: CampanhaApurada[];
}

const tipoStyles: Record<TipoCampanha, string> = {
  vendas: "bg-[#EEF0FA] text-[#4C48B0]",
  positivacao: "bg-[#FFF3E2] text-[#DD8100]",
};

const tipoLabel: Record<TipoCampanha, string> = {
  vendas: "VENDAS",
  positivacao: "POSITIVAÇÃO",
};

function formatValor(valor: number, formato: "moeda" | "numero" = "moeda") {
  if (formato === "moeda") {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    });
  }
  return valor.toLocaleString("pt-BR");
}

function AtingimentoBadge({
  valorApurado,
  meta,
}: {
  valorApurado: number;
  meta?: number | null;
}) {
  if (!meta) {
    return (
      <div className="flex flex-col items-end gap-1.5">
        <span className="rounded-md bg-[#F2F2F6] px-2 py-1 text-[11px] font-bold text-[#a8a8bb]">
          N/A
        </span>
        <div className="h-[3px] w-20 rounded-full bg-[#EDEDF4]" />
      </div>
    );
  }

  const pct = (valorApurado / meta) * 100;
  const atingiu = pct >= 100;
  const corTexto = atingiu ? "text-[#1BA672] bg-[#E7F7EF]" : "text-[#D64545] bg-[#FCEAEA]";
  const corBarra = atingiu ? "bg-[#1BA672]" : "bg-[#D64545]";
  const largura = Math.min(pct, 100);

  return (
    <div className="flex flex-col items-end gap-1.5">
      <span className={`rounded-md px-2 py-1 text-[11px] font-bold ${corTexto}`}>
        {pct.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
      </span>
      <div className="h-[3px] w-20 rounded-full bg-[#EDEDF4] overflow-hidden">
        <div className={`h-full rounded-full ${corBarra}`} style={{ width: `${largura}%` }} />
      </div>
    </div>
  );
}

export default function CampanhasApuradasTable({  
  campanhas,
}: CampanhasApuradasTableProps) {
  return (
    <div className="rounded-2xl bg-white shadow-[0_1px_3px_rgba(20,20,50,0.06),0_16px_36px_-20px_rgba(20,20,50,0.2)] overflow-hidden">      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className=" bg-other-secondaryBlue">
              <th className="px-6 py-3 text-left text-[11px] font-bold tracking-wide text-white">
                ID
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-bold tracking-wide text-white">
                DESCRIÇÃO DA CAMPANHA
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-bold tracking-wide text-white">
                TIPO
              </th>
              <th className="px-4 py-3 text-right text-[11px] font-bold tracking-wide text-white">
                VALOR APURADO
              </th>
              <th className="px-4 py-3 text-right text-[11px] font-bold tracking-wide text-white">
                META
              </th>
              <th className="px-6 py-3 text-right text-[11px] font-bold tracking-wide text-white">
                % ATINGIDO
              </th>
            </tr>
          </thead>
          <tbody>
            {campanhas.map((c) => (
              <tr
                key={c.id}
                className="border-b border-[#F0F0F5] last:border-0 hover:bg-[#FAFAFC] transition-colors"
              >
                <td className="px-6 py-3.5 text-[13px] text-[#a8a8bb]">{c.id}</td>
                <td className="px-4 py-3.5 text-[13.5px] font-semibold text-[#2b2b3d]">
                  {c.descricao}
                </td>
                <td className="px-4 py-3.5">
                  <span
                    className={`rounded-md px-2.5 py-1 text-[10.5px] font-bold ${tipoStyles[c.tipo]}`}
                  >
                    {tipoLabel[c.tipo]}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right text-[13.5px] font-bold text-[#2b2b3d]">
                  {formatValor(c.valorApurado, c.formato)}
                </td>
                <td className="px-4 py-3.5 text-right text-[13px]">
                  {c.meta ? (
                    <span className="text-[#6b6b80]">
                      {formatValor(c.meta, c.formato)}
                    </span>
                  ) : (
                    <span className="italic text-[#b3b3c4]">sem meta</span>
                  )}
                </td>
                <td className="px-6 py-3.5">
                  <AtingimentoBadge valorApurado={c.valorApurado} meta={c.meta} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}