import { FiDownload } from "react-icons/fi";
import { CampaignOption } from "./FiltersBar";

interface SalesFiltersBarProps {
  search: string;
  onSearchChange: (value: string) => void;

  campaignOptions: CampaignOption[];
  campaignValue: number;
  onCampaignChange: (id: number) => void;

  vendedorOptions: string[];
  vendedor: string;
  onVendedorChange: (value: string) => void;

  onClearFilters: () => void;
  onExportCsv: () => void;
}

const fieldLabel = "text-[10px] font-medium tracking-widest text-white/40 uppercase";
const fieldControl =
  "bg-[#10171f] border border-white/[0.07] rounded-md px-3 py-2 text-sm text-white outline-none focus:border-[#3fb950]/50";

export function SalesFiltersBar({
  search,
  onSearchChange,
  campaignOptions,
  campaignValue,
  onCampaignChange,
  vendedorOptions,
  vendedor,
  onVendedorChange,
  onClearFilters,
  onExportCsv,
}: SalesFiltersBarProps) {
  return (
    <div className="flex flex-wrap items-end gap-4 px-6 py-4 border-b border-white/[0.07]">
      <div className="flex flex-col gap-1">
        <label className={fieldLabel}>Buscar</label>
        <input
          className={`${fieldControl} w-56`}
          placeholder="CNPJ, razão social ou produto"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className={fieldLabel}>Campanha</label>
        <select
          className={`${fieldControl} w-56`}
          value={campaignValue}
          onChange={(e) => onCampaignChange(Number(e.target.value))}
        >
          {campaignOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className={fieldLabel}>Vendedor</label>
        <select
          className={`${fieldControl} w-48`}
          value={vendedor}
          onChange={(e) => onVendedorChange(e.target.value)}
        >
          <option value="todos">todos</option>
          {vendedorOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={onClearFilters}
        className="border border-white/[0.07] text-white/70 hover:text-white text-sm px-4 py-2 rounded-md transition-colors cursor-pointer"
      >
        Limpar filtros
      </button>

      <div className="flex gap-2 ml-auto">
        <button
          onClick={onExportCsv}
          className="flex items-center gap-2 border border-white/[0.07] text-white/70 hover:text-white text-sm px-4 py-2 rounded-md transition-colors cursor-pointer"
        >
          <FiDownload /> CSV
        </button>
        <button
          disabled
          title="Exportação em Excel ainda não implementada"
          className="flex items-center gap-2 bg-[#3fb950]/20 text-[#3fb950]/50 text-sm px-4 py-2 rounded-md cursor-not-allowed"
        >
          <FiDownload /> Excel
        </button>
      </div>
    </div>
  );
}
