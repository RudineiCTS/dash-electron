import { NavLink } from "react-router-dom";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { IconType } from "react-icons";

export interface NavCardProps {
  to: string;
  icon: LucideIcon | IconType;
  titulo: string;
  categoria: string;
  descricao: string;
  rodape: string;
  textoAcao?: string;
}

export function NavCard({
  to,
  icon: Icon,
  titulo,
  categoria,
  descricao,
  rodape,
  textoAcao = "Abrir",
}: NavCardProps) {
  return (
    <NavLink
      to={to}
      className="group block rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          <Icon size={20} strokeWidth={2} />
        </span>

        <div>
          <h3 className="text-base font-bold text-indigo-950">{titulo}</h3>
          <span className="text-xs font-bold uppercase tracking-wide text-gray-400">
            {categoria}
          </span>
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-gray-500">{descricao}</p>

      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
        <span className="text-sm text-gray-400">{rodape}</span>
        <span className="flex items-center gap-1 text-sm font-bold text-blue-600 group-hover:gap-1.5">
          {textoAcao}
          <ArrowRight size={14} strokeWidth={2.5} />
        </span>
      </div>
    </NavLink>
  );
}