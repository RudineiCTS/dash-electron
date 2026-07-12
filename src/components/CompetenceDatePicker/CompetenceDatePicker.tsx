import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function lastDayOfMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0);
}

function formatDate(date: Date) {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}
interface CompetenceDatePickerProps {
  label?: string;
  initialDate?: Date;
  onApply?: (date: Date) => void;
}

export default function CompetenceDatePicker({
  label = "Data Competência",
  initialDate = new Date(2026, 6, 30),
  onApply,
}: CompetenceDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [appliedDate, setAppliedDate] = useState(initialDate);
  const [pickerYear, setPickerYear] = useState(initialDate.getFullYear());
  const [pickerMonth, setPickerMonth] = useState(initialDate.getMonth());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggleOpen() {
    if (!isOpen) {
      setPickerYear(appliedDate.getFullYear());
      setPickerMonth(appliedDate.getMonth());
    }
    setIsOpen((prev) => !prev);
  }

  function handleApply() {
    const newDate = lastDayOfMonth(pickerYear, pickerMonth);
    setAppliedDate(newDate);
    setIsOpen(false);
    onApply?.(newDate);
  }

  const previewLastDay = lastDayOfMonth(pickerYear, pickerMonth);

  return (
    <div className="flex justify-end bg-[#0d1117] px-4 font-sans">
      <div ref={containerRef} className="relative w-64">
        <span className="mb-1.5 block text-right text-[11px] font-semibold uppercase tracking-wider text-[#8b949e]">
          {label}
        </span>

        <button
          type="button"
          onClick={toggleOpen}
          className="flex w-full items-center justify-between gap-2 rounded-lg border border-[#30363d] bg-[#161b22] px-3.5 py-2.5 text-sm text-[#e6edf3] transition-colors hover:border-[#3fb950]/50"
        >
          <span className="flex items-center gap-2">
            <Calendar size={16} className="text-[#3fb950]" />
            <span className="font-medium">{formatDate(appliedDate)}</span>
          </span>
          {isOpen ? (
            <ChevronUp size={16} className="text-[#8b949e]" />
          ) : (
            <ChevronDown size={16} className="text-[#8b949e]" />
          )}
        </button>

        {isOpen && (
          <div className="absolute right-0 z-10 mt-2 w-72 rounded-xl border border-[#30363d] bg-[#161b22] p-4 shadow-2xl shadow-black/40">
            <div className="mb-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setPickerYear((y) => y - 1)}
                className="rounded-md p-1.5 text-[#8b949e] transition-colors hover:bg-[#21262d] hover:text-[#e6edf3]"
                aria-label="Ano anterior"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-base font-semibold text-[#e6edf3]">{pickerYear}</span>
              <button
                type="button"
                onClick={() => setPickerYear((y) => y + 1)}
                className="rounded-md p-1.5 text-[#8b949e] transition-colors hover:bg-[#21262d] hover:text-[#e6edf3]"
                aria-label="Próximo ano"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="mb-4 grid grid-cols-3 gap-2">
              {MONTHS.map((monthLabel, index) => {
                const isSelected = index === pickerMonth;
                return (
                  <button
                    key={monthLabel}
                    type="button"
                    onClick={() => setPickerMonth(index)}
                    className={
                      "rounded-md py-2 text-sm font-medium transition-colors " +
                      (isSelected
                        ? "bg-[#238636]/25 text-[#3fb950] ring-2 ring-amber-400/70"
                        : "text-[#c9d1d9] hover:bg-[#21262d]")
                    }
                  >
                    {monthLabel}
                  </button>
                );
              })}
            </div>

            <div className="mb-4 flex items-center justify-between border-t border-[#30363d] pt-3 text-sm">
              <span className="text-[#8b949e]">Último dia do mês</span>
              <span className="font-semibold text-[#3fb950]">{formatDate(previewLastDay)}</span>
            </div>

            <button
              type="button"
              onClick={handleApply}
              className="w-full rounded-lg bg-[#3fb950] py-2.5 text-sm font-semibold text-[#0d1117] transition-colors hover:bg-[#56d364]"
            >
              Aplicar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}