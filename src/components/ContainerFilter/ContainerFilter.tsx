import { useState } from "react";
import { DatePicker } from "../DatePicker/DatePickerComponent";
import dayjs from "dayjs";

interface ICampaignFiltersPanelProps {
  onSearch: (filters: { name: string; startDate: string; endDate: string }) => void;
}

type TabView = "totais" | "detalhados";

export function CampaignFiltersPanel({ onSearch }: ICampaignFiltersPanelProps) {
  const [activeTab, setActiveTab] = useState<TabView>("totais");
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const hasFilters = name !== "" || startDate !== "" || endDate !== "";

  function handleClear() {
    setName("");
    setStartDate("");
    setEndDate("");
  }

  function handleSearch() {
    onSearch({ name, startDate, endDate });
  }

  return (
    <div className="bg-[#0d1117] border border-[#3fb950]/40 rounded-xl p-6 ">
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab("totais")}
          className={`font-semibold text-sm px-6 py-3 rounded-lg transition-colors ${
            activeTab === "totais"
              ? "bg-[#3fb950]/15 text-[#3fb950]"
              : "text-[#8b949e] hover:text-white"
          }`}
        >
          Resultados Totais
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("detalhados")}
          className={`font-semibold text-sm px-6 py-3 rounded-lg transition-colors ${
            activeTab === "detalhados"
              ? "bg-[#3fb950]/15 text-[#3fb950]"
              : "text-[#8b949e] hover:text-white"
          }`}
        >
          Resultados Detalhados
        </button>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <div>
          <label className="text-[11px] tracking-widest text-[#8b949e] uppercase font-semibold block mb-2">
            Nome da campanha
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Digite o nome da campanha"
            className="w-full bg-[#161b22] border border-white/[0.07] rounded-lg px-3.5 py-3
                       text-white text-sm placeholder:text-[#6e7681] outline-none
                       focus:border-white/[0.2] transition-colors"
          />
        </div>

        <div>
          <label className="text-[11px] tracking-widest text-[#8b949e] uppercase font-semibold block mb-2">
            Data inicial
          </label>
          <DatePicker
            onChange={(e) => setStartDate(e as any)}
            value={dayjs('31/07/2026', "DD/MM/YYYY").toDate()}
            placeholder="Data Inicio"
          />
        </div>

        <div>
          <label className="text-[11px] tracking-widest text-[#8b949e] uppercase font-semibold block mb-2">
            Data final
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full bg-[#161b22] border border-white/[0.07] rounded-lg px-3.5 py-3
                       text-white text-sm outline-none focus:border-white/[0.2]
                       transition-colors [color-scheme:dark]"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSearch}
            className="bg-[#3fb950] text-[#0d1117] font-bold text-sm px-7 py-3 rounded-lg
                       hover:bg-[#3fb950]/90 transition-colors"
          >
            Buscar
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="border border-white/[0.15] text-[#c9d1d9] font-semibold text-sm
                       px-6 py-3 rounded-lg hover:bg-white/[0.05] transition-colors"
          >
            Limpar filtros
          </button>
        </div>
        <span className="text-[#8b949e] text-sm">
          {hasFilters ? "Filtros aplicados" : "Nenhum filtro aplicado"}
        </span>
      </div>
    </div>
  );
}