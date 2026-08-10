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
    <div className="flex justify-end bg-transparent px-4 font-sans">
      <div ref={containerRef} className="relative w-64">
        <span className="mb-1.5 block text-right text-[11px] font-semibold uppercase tracking-wider text-[#8b949e]">
          {label}
        </span>

        <button
          type="button"
          onClick={toggleOpen}
          className="flex w-full items-center justify-between gap-2 rounded-lg border border-github-border bg-other-surface px-3.5 py-2.5 text-sm text-github-DEFAULT transition-colors hover:border-[#3fb950]/50"
        >
          <span className="flex items-center gap-2">
            <Calendar size={16} className="text-other-green" />
            <span className="font-medium">{formatDate(appliedDate)}</span>
          </span>
          {isOpen ? (
            <ChevronUp size={16} className="text-other-muted" />
          ) : (
            <ChevronDown size={16} className="text-other-muted" />
          )}
        </button>

        {isOpen && (
          <div className="absolute right-0 z-10 mt-2 w-72 rounded-xl border border-github-border bg-other-surface p-4 shadow-2xl shadow-black/40">
            <div className="mb-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setPickerYear((y) => y - 1)}
                className="rounded-md p-1.5 text-other-muted transition-colors hover:bg-other-badge hover:text-github-DEFAULT"
                aria-label="Ano anterior"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-base font-semibold text-github-DEFAULT">{pickerYear}</span>
              <button
                type="button"
                onClick={() => setPickerYear((y) => y + 1)}
                className="rounded-md p-1.5 text-other-muted transition-colors hover:bg-other-badge hover:text-github-DEFAULT"
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
                        ? "bg-github-btn-green text-github-text-textSecond ring-2 ring-amber-400/70"
                        : "text-github-text-textSecond hover:bg-other-badge")
                    }
                  >
                    {monthLabel}
                  </button>
                );
              })}
            </div>

            <div className="mb-4 flex items-center justify-between border-t border-github-border pt-3 text-sm">
              <span className="text-other-muted">Último dia do mês</span>
              <span className="font-semibold text-other-green">{formatDate(previewLastDay)}</span>
            </div>

            <button
              type="button"
              onClick={handleApply}
              className="w-full rounded-lg bg-other-green py-2.5 text-sm font-semibold text-[#0d1117] transition-colors hover:bg-[#56d364]"
            >
              Aplicar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}