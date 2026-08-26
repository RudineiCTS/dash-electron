import { FiDownload } from "react-icons/fi";
import { CampaignOption } from "./FiltersBar";
import { CampaignResult } from "../../../interfaces/CampaignResultTelesales";

interface SalesFiltersBarProps {
  search: string;
  onSearchChange: (value: string) => void;

  campaignOptions: CampaignOption[] | CampaignResult[];
  campaignValue: number;
  onCampaignChange: (id: number) => void;

  vendedorOptions: string[];
  vendedor: string;
  onVendedorChange: (value: string) => void;

  onClearFilters: () => void;
  onExportCsv: () => void;
  onExportExcel: () => void;
  typeCampaign?: "TELEVENDAS" | "FARMA";
}

const fieldLabel = "text-[10px] font-medium tracking-widest text-other-muted uppercase";
const fieldControl =
  "bg-other-card border border-other-border rounded-md px-3 py-2 text-sm text-github-text outline-none focus:border-other-green";

// Type guard: quando é TELEVENDAS, o array é de CampaignResult
function isCampaignResultArray(
  options: CampaignOption[] | CampaignResult[],
  type: "TELEVENDAS" | "FARMA"
): options is CampaignOption[] {
  return type === "TELEVENDAS";
}
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
  onExportExcel,
  typeCampaign = "TELEVENDAS",
}: SalesFiltersBarProps) {
  return (
    <div className="flex flex-wrap items-end gap-4 px-6 py-4 border-b border-other-border">
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
          {isCampaignResultArray(campaignOptions, typeCampaign)
            ? campaignOptions.map((option) => (
                // TODO: ajustar para os campos reais de CampaignResult
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))
            : campaignOptions.map((option) => (
                // TODO: ajustar para os campos reais de CampaignOption
                <option key={option.idCampaign} value={option.idCampaign}>
                  {option.campaignTypeDescription}
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
        className="border border-other-border text-other-muted hover:text-github-text-linkAlt text-sm px-4 py-2 rounded-md transition-colors cursor-pointer"
      >
        Limpar filtros
      </button>

      <div className="flex gap-2 ml-auto">
        <button
          onClick={onExportCsv}
          className="flex items-center gap-2 border border-other-border text-other-muted hover:text-github-text-linkAlt text-sm px-4 py-2 rounded-md transition-colors cursor-pointer"
        >
          <FiDownload /> CSV
        </button>
        <button
          onClick={onExportExcel}
          title="Exportar para Excel"
          className="flex items-center gap-2 bg-other-green-dark text-other-green text-sm px-4 py-2 rounded-md transition-colors cursor-pointer hover:brightness-110"
        >
          <FiDownload /> Excel
        </button>
      </div>
    </div>
  );
}