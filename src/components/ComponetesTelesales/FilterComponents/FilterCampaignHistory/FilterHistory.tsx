import { useState } from "react";
import { FiSearch, FiChevronDown } from "react-icons/fi";

export interface CampaignFilters {
  competencia: string;
  nomeCampanha: string;
  tipoCampanha: string;
}

interface FilterBarProps {
  competencias: { value: string; label: string }[];
  tiposCampanha: { value: string; label: string }[];
  onApply: (filters: CampaignFilters) => void;
  onClear?: () => void;
}

const inputBase =
  "w-full rounded-lg border border-[#E4E4EE] bg-white px-3 py-2.5 text-[13.5px] text-[#33334a] outline-none transition-colors focus:border-azul focus:ring-2 focus:ring-azul/10";

export default function FilterBar({
  competencias,
  tiposCampanha,
  onApply,
  onClear,
}: FilterBarProps) {
  const [competencia, setCompetencia] = useState("");
  const [nomeCampanha, setNomeCampanha] = useState("");
  const [tipoCampanha, setTipoCampanha] = useState("");

  function handleApply() {
    onApply({ competencia, nomeCampanha, tipoCampanha });
  }

  function handleClear() {
    setCompetencia("");
    setNomeCampanha("");
    setTipoCampanha("");
    onClear?.();
  }

  return (
    <div className="rounded-2xl border-t-2 border-azul bg-white p-5 shadow-[0_1px_3px_rgba(20,20,50,0.06),0_12px_28px_-16px_rgba(20,20,50,0.15)]">
      <div className="flex flex-wrap items-end gap-5">
        {/* Data competência */}
        <div className="flex min-w-[180px] flex-col gap-1.5">
          <label className="text-[11px] font-bold tracking-wide text-[#8a8a9c]">
            DATA COMPETÊNCIA
          </label>
          <div className="relative">
            <select
              value={competencia}
              onChange={(e) => setCompetencia(e.target.value)}
              className={`${inputBase} appearance-none pr-9`}
            >
              <option value="" disabled hidden />
              {competencias.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-azul" />
          </div>
        </div>

        {/* Nome da campanha */}
        <div className="flex min-w-[280px] flex-1 flex-col gap-1.5">
          <label className="text-[11px] font-bold tracking-wide text-[#8a8a9c]">
            NOME DA CAMPANHA
          </label>
          <div className="relative">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#a8a8bb]" />
            <input
              type="text"
              value={nomeCampanha}
              onChange={(e) => setNomeCampanha(e.target.value)}
              placeholder="Ex.: Farmax, Coty, Positivação..."
              className={`${inputBase} pl-9`}
            />
          </div>
        </div>

        {/* Tipo de campanha */}
        <div className="flex min-w-[180px] flex-col gap-1.5">
          <label className="text-[11px] font-bold tracking-wide text-[#8a8a9c]">
            TIPO DE CAMPANHA
          </label>
          <div className="relative">
            <select
              value={tipoCampanha}
              onChange={(e) => setTipoCampanha(e.target.value)}
              className={`${inputBase} appearance-none pr-9`}
            >
              <option value="">Todas</option>
              {tiposCampanha.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-azul" />
          </div>
        </div>

        {/* Ações */}
        <div className="ml-auto flex items-center gap-3">
          <button
            type="button"
            onClick={handleClear}
            className="rounded-lg border border-[#E4E4EE] bg-white px-5 py-2.5 text-[13.5px] font-semibold text-[#5c5c74] transition-colors hover:bg-[#FAFAFC]"
          >
            Limpar
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="rounded-lg bg-other-orange px-5 py-2.5 text-[13.5px] font-bold text-white shadow-[0_8px_18px_-8px_rgba(221,129,0,0.55)] transition-transform hover:brightness-105 active:scale-[0.98]"
          >
            Aplicar filtros
          </button>
        </div>
      </div>
    </div>
  );
}