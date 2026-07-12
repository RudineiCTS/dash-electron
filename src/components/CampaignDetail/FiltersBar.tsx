import { FiDownload } from "react-icons/fi";

export interface CampaignOption {
  id: number;
  label: string;
}

interface FiltersBarProps {
  search: string;
  onSearchChange: (value: string) => void;

  campaignOptions: CampaignOption[];
  campaignValue: number;
  onCampaignChange: (id: number) => void;

  tipoOptions: string[];
  tipo: string;
  onTipoChange: (value: string) => void;

  colocacaoOptions: string[];
  colocacao: string;
  onColocacaoChange: (value: string) => void;

  percentMin: number;
  percentMax: number;
  onPercentMinChange: (value: number) => void;
  onPercentMaxChange: (value: number) => void;

  onClearFilters: () => void;
  onExportCsv: () => void;
}

const fieldLabel = "text-[10px] font-medium tracking-widest text-white/40 uppercase";
const fieldControl =
  "bg-[#10171f] border border-white/[0.07] rounded-md px-3 py-2 text-sm text-white outline-none focus:border-[#3fb950]/50";

export function FiltersBar({
  search,
  onSearchChange,
  campaignOptions,
  campaignValue,
  onCampaignChange,
  tipoOptions,
  tipo,
  onTipoChange,
  colocacaoOptions,
  colocacao,
  onColocacaoChange,
  percentMin,
  percentMax,
  onPercentMinChange,
  onPercentMaxChange,
  onClearFilters,
  onExportCsv,
}: FiltersBarProps) {
  return (
    <div className="flex flex-wrap items-end gap-4 px-6 py-4 border-b border-white/[0.07]">
      <div className="flex flex-col gap-1">
        <label className={fieldLabel}>Buscar</label>
        <input
          className={`${fieldControl} w-56`}
          placeholder="Nome de pessoa, supervisor ou ge"
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
        <label className={fieldLabel}>Tipo de pessoa</label>
        <select
          className={`${fieldControl} w-32`}
          value={tipo}
          onChange={(e) => onTipoChange(e.target.value)}
        >
          <option value="todos">todos</option>
          {tipoOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className={fieldLabel}>Colocação</label>
        <select
          className={`${fieldControl} w-28`}
          value={colocacao}
          onChange={(e) => onColocacaoChange(e.target.value)}
        >
          <option value="Todos">Todos</option>
          {colocacaoOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className={fieldLabel}>% Realizado (min - max)</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            className={`${fieldControl} w-16`}
            min={0}
            max={100}
            value={percentMin}
            onChange={(e) => onPercentMinChange(Number(e.target.value))}
          />
          <span className="text-white/40 text-xs">até</span>
          <input
            type="number"
            className={`${fieldControl} w-16`}
            min={0}
            max={100}
            value={percentMax}
            onChange={(e) => onPercentMaxChange(Number(e.target.value))}
          />
        </div>
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
