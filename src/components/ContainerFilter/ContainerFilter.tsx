import { useState } from "react";
import { DatePicker } from "../DatePicker/DatePickerComponent";
import dayjs from "dayjs";

interface ICampaignFiltersPanelProps {
  onSearch: (filters: { name: string; startDate: string; endDate: string }) => void;
  startDate:Date | undefined;
  endDate:Date | undefined;
  onChangeStartDate:(date:Date|undefined)=> void;
  onChangeEndDate:(date:Date|undefined)=> void;
  name:string;
  onChangeName:(value:string)=>void;
  activeTab:TabView,
  onChangeActiveTab:(value:TabView)=>void
}

export type TabView = "totais" | "detalhados";

export function CampaignFiltersPanel(
  { onSearch, 
    startDate,
    endDate,
    onChangeEndDate,
    onChangeStartDate, 
    name,
    activeTab,
    onChangeActiveTab,
    onChangeName
  }: ICampaignFiltersPanelProps) {
  const hasFilters = name !== "" || startDate !== undefined || endDate !== undefined;

  function handleClear() {
    onChangeName("");
    onChangeEndDate(undefined);
    onChangeStartDate(undefined);
  }

  function handleSearch() {
    onSearch({
      name,
      startDate: startDate ? dayjs(startDate).format("YYYY-MM-DD") : "",
      endDate: endDate ? dayjs(endDate).format("YYYY-MM-DD") : "",
    });
  }

  return (
    <div className="bg-[var(--panel-bg)] border border-[var(--panel-border)] rounded-xl p-6">
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => onChangeActiveTab("totais")}
          className={`font-semibold text-sm px-6 py-3 rounded-lg transition-colors ${
            activeTab === "totais"
              ? "bg-[var(--tab-active-bg)] text-[var(--tab-active-text)]"
              : "text-github-text-muted hover:text-github-text"
          }`}
        >
          Resultados Totais
        </button>
        <button
          type="button"
          onClick={() => onChangeActiveTab("detalhados")}
          className={`font-semibold text-sm px-6 py-3 rounded-lg transition-colors ${
            activeTab === "detalhados"
              ? "bg-[var(--tab-active-bg)] text-[var(--tab-active-text)]"
              : "text-github-text-muted hover:text-github-text"
          }`}
        >
          Resultados Detalhados
        </button>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <div>
          <label className="text-[11px] tracking-widest text-github-text-muted uppercase font-semibold block mb-2">
            Nome da campanha
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => onChangeName(e.target.value)}
            placeholder="Digite o nome da campanha"
            className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-3.5 py-3
                       text-[var(--input-text)] text-sm placeholder:text-[var(--input-placeholder)] outline-none
                       focus:border-[var(--input-border-focus)] transition-colors"
          />
        </div>

        <div>
          <label className="text-[11px] tracking-widest text-github-text-muted uppercase font-semibold block mb-2">
            Data inicial
          </label>
          <DatePicker
            value={startDate}
            onChange={(e)=>onChangeStartDate(e)}
            placeholder="Data Início"
          />
        </div>

        <div>
          <label className="text-[11px] tracking-widest text-github-text-muted uppercase font-semibold block mb-2">
            Data final
          </label>
          <DatePicker
            value={endDate}
            onChange={(e)=>onChangeEndDate(e)}
            placeholder="Data Final"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSearch}
            className="bg-[var(--accent-strong)] text-[var(--accent-strong-text)] font-bold text-sm px-7 py-3 rounded-lg
                       hover:opacity-90 transition-opacity"
          >
            Buscar
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="border border-[var(--btn-secondary-border)] text-[var(--btn-secondary-text)] font-semibold text-sm
                       px-6 py-3 rounded-lg hover:bg-[var(--btn-secondary-hover-bg)] transition-colors"
          >
            Limpar filtros
          </button>
        </div>
        <span className="text-github-text-muted text-sm">
          {hasFilters ? "Filtros aplicados" : "Nenhum filtro aplicado"}
        </span>
      </div>
    </div>
  );
}