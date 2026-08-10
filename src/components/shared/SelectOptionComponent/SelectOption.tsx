import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface ISelectOption {
  value: string;
  label: string;
}

interface ISelectProps {
  options: ISelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  width?: number; // largura fixa, default 200
}

export function DarkSelect({ options, value, onChange, placeholder, width = 200 }: ISelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative" style={{ width }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        title={selected?.label}
        style={{ width }}
        className="flex items-center gap-2 bg-other-surface border border-white/[0.07]
                   rounded-lg px-3 py-2.5 text-other-text text-sm hover:border-white/[0.15] transition-colors"
      >
        <span className="flex-1 min-w-0 truncate text-left">
          {selected ? selected.label : placeholder ?? "Selecione"}
        </span>
        <ChevronDown
          size={16}
          className={`text-[#8b949e] flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          style={{ width }}
          className="absolute z-10 mt-1 bg-other-surface border text-other-text border-white/[0.07] rounded-lg overflow-hidden"
        >
          {options.map((opt) => (
            <div
              key={opt.value}
              title={opt.label}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`px-3 py-2.5 text-sm cursor-pointer truncate hover:bg-other-hoverbg transition-colors
                          ${opt.value === value ? "text-github-text-linkAlt" : "text-other-text"}`}
            >
              {/* bg-white/[0.05] */}
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}