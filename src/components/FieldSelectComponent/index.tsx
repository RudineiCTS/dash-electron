import { useState } from "react";
import { Copy } from "lucide-react";

const COMPETENCIAS: string[] = [
  "Setembro / 2026",
  "Agosto / 2026",
  "Julho / 2026",
  "Junho / 2026",
];

const TIPOS_PESSOA: string[] = [
  "SAC",
  "GC",
  "Johnson & Johnson",
  "Nestlé",
  "P&G",
  "Haleon",
  "Prospecção",
  "Flora",
  "Reckitt",
  "Ontex",
  "Boticário",
  "Digitadoras",
];

export interface FieldSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}

export function FieldSelect({ label, value, onChange, options }: FieldSelectProps) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold tracking-[0.04em] text-general-labelText">
        {label}
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="font-inter appearance-none border-none bg-transparent py-0.5 pr-[22px] pl-0 text-[15px] font-semibold
                     text-general-selectText outline-none cursor-pointer min-w-[140px]"
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none"
        >
          <path
            d="M1 1L5 5L9 1"
            className="stroke-general-chevron"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </label>
  );
}

interface MetaSelectionHeaderProps {
  competencia: string;
  tipoPessoa: string;
  onCompetenciaChange: (competencia: string) => void;
  onTipoPessoaChange: (tipoPessoa: string) => void;
}

export default function MetaSelectionHeader({
  competencia,
  tipoPessoa,
  onCompetenciaChange,
  onTipoPessoaChange,
}: MetaSelectionHeaderProps) {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopiar = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div
      className="font-inter flex flex-wrap items-center gap-8 rounded-[10px] border border-general-cardBorder
                 border-t-[3px] border-t-general-accent bg-white px-6 py-[18px]"
    >
      <FieldSelect
        label="PERÍODO DE COMPETÊNCIA"
        value={competencia}
        onChange={onCompetenciaChange}
        options={COMPETENCIAS}
      />

      <div className="w-px self-stretch bg-general-divider" />

      <FieldSelect
        label="TIPO DE PESSOA"
        value={tipoPessoa}
        onChange={onTipoPessoaChange}
        options={TIPOS_PESSOA}
      />

      <button
        onClick={handleCopiar}
        className={`flex items-center gap-2 rounded-lg border border-general-buttonBorder px-3.5 py-[9px] text-[13px]
                    font-semibold text-general-buttonText transition-colors duration-150 cursor-pointer ${
                      copied ? "bg-general-buttonActiveBg" : "bg-white"
                    }`}
      >
        <Copy size={14} strokeWidth={2} />
        {copied ? "Copiado da competência anterior" : "Copiar da competência anterior"}
      </button>

      <div className="ml-auto text-[13px] text-general-footerText">
        Lote atual: {competencia} · {tipoPessoa}
      </div>
    </div>
  );
}
