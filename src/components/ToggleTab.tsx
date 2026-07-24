import { useState } from "react";

type Tab = "pontos" | "valor";

interface ToggleTabProps {
  onChange?: (tab: Tab) => void;
}
export function ToggleTab({ onChange }: ToggleTabProps) {
  const [active, setActive] = useState<Tab>("valor");

  return (
    <div className="flex bg-other-surface  border border-white/[0.07] rounded-[9px] p-[3px] gap-[2px]">
      <button
        onClick={() => {
          setActive("pontos");
          onChange?.("pontos");
        }}
        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-150 cursor-pointer ${
          active === "pontos"
            ? "bg-github-text-linkAlt text-other-text"
            : "bg-transparent text-other-text hover:text-github-btn-green-hover"
        }`}
      >
        Pontos
      </button>

      <button
        onClick={() => {
          setActive("valor");
          onChange?.("valor");
        }}
        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-150 cursor-pointer ${
          active === "valor"
            ? "bg-github-text-linkAlt text-other-text"
            : "bg-transparent text-other-text hover:text-github-btn-green-hover"
        }`}
      >
        Valor
      </button>
    </div>
  );
}