import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];
const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

interface IDayCell {
  day: number;
  date: Date;
  muted: boolean;
}

interface IDatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function buildCells(viewYear: number, viewMonth: number): IDayCell[] {
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const cells: IDayCell[] = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    cells.push({ day, muted: true, date: new Date(viewYear, viewMonth - 1, day) });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, muted: false, date: new Date(viewYear, viewMonth, d) });
  }
  let nextDay = 1;
  while (cells.length % 7 !== 0) {
    cells.push({ day: nextDay, muted: true, date: new Date(viewYear, viewMonth + 1, nextDay) });
    nextDay++;
  }

  return cells;
}

export function DatePicker({ value, onChange, placeholder }: IDatePickerProps) {
  const [open, setOpen] = useState(false);
  const today = new Date();
  const [viewYear, setViewYear] = useState(value?.getFullYear() ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(value?.getMonth() ?? today.getMonth());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function goToPrevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  }

  function goToNextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  }

  function handleSelectDay(date: Date) {
    onChange(date);
    setViewYear(date.getFullYear());
    setViewMonth(date.getMonth());
    setOpen(false);
  }

  function handleToday() {
    handleSelectDay(new Date());
  }

  function handleClear() {
    onChange(undefined);
  }

  const cells = buildCells(viewYear, viewMonth);
  const label = value ? value.toLocaleDateString("pt-BR") : placeholder ?? "dd/mm/aaaa";

  return (
    <div ref={ref} className="relative w-[240px]">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between bg-[var(--input-bg)] border border-[var(--input-border)]
                   rounded-lg px-3.5 py-3 text-sm hover:border-[var(--input-border-focus)] transition-colors"
      >
        <span className={value ? "text-[var(--input-text)]" : "text-[var(--input-placeholder)]"}>{label}</span>
        <Calendar size={16} className="text-[var(--accent)]" />
      </button>

      {open && (
        <div className="absolute z-10 mt-1 w-[320px] bg-[var(--panel-bg)] border border-[var(--input-border)] rounded-xl p-5">
          {/* Navegação de mês */}
          <div className="flex items-center justify-between mb-4">
            <button type="button" onClick={goToPrevMonth} className="text-github-text-muted hover:text-github-text transition-colors p-1">
              <ChevronLeft size={18} />
            </button>
            <span className="text-github-text font-bold text-sm">
              {MONTH_NAMES[viewMonth]} de {viewYear}
            </span>
            <button type="button" onClick={goToNextMonth} className="text-github-text-muted hover:text-github-text transition-colors p-1">
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Cabeçalho dias da semana */}
          <div className="grid grid-cols-7 gap-1 mb-1.5">
            {WEEKDAYS.map((w, i) => (
              <div key={i} className="text-center text-[11px] text-github-text-muted font-semibold py-1">
                {w}
              </div>
            ))}
          </div>

          {/* Grid de dias */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((cell, i) => {
              const isSelected = value ? isSameDay(cell.date, value) : false;
              const isToday = isSameDay(cell.date, today);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectDay(cell.date)}
                  className={`py-2 rounded-md text-[13px] transition-colors
                    ${isSelected
                      ? "bg-[#2f81f7] text-white"
                      : cell.muted
                      ? "text-[var(--input-placeholder)] hover:bg-[var(--btn-secondary-hover-bg)]"
                      : "text-[var(--input-text)] hover:bg-[var(--btn-secondary-hover-bg)]"
                    }
                    ${isToday && !isSelected ? "font-bold ring-1 ring-inset ring-[var(--accent)]" : ""}
                  `}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          {/* Ações */}
          <div className="flex justify-between mt-4 pt-3 border-t border-[var(--input-border)]">
            <button type="button" onClick={handleClear} className="text-[var(--accent)] text-[13px] font-medium hover:underline">
              Limpar
            </button>
            <button type="button" onClick={handleToday} className="text-[var(--accent)] text-[13px] font-medium hover:underline">
              Hoje
            </button>
          </div>
        </div>
      )}
    </div>
  );
}