import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface NavegadorCompetenciaProps {
  /** Mês de competência, AAAA-MM. */
  competencia: string;
  onChange: (competencia: string) => void;
  /** Trava as setas (ex.: enquanto um cálculo está rodando). */
  desabilitado?: boolean;
}

const estiloSeta =
  "flex h-full w-12 items-center justify-center text-other-muted transition-colors hover:text-[#32307B] cursor-pointer " +
  "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-other-muted";

/** Mês de competência com setas para anterior/próximo ("Novembro 2026"). */
export function NavegadorCompetencia({ competencia, onChange, desabilitado = false }: NavegadorCompetenciaProps) {
  const mes = dayjs(`${competencia}-01`);
  const rotulo = mes.locale("pt-br").format("MMMM YYYY");

  return (
    <div className="flex h-14 items-stretch overflow-hidden rounded-xl border border-other-border bg-other-card">
      <button
        type="button"
        aria-label="Mês anterior"
        disabled={desabilitado}
        onClick={() => onChange(mes.subtract(1, "month").format("YYYY-MM"))}
        className={estiloSeta}
      >
        <FiChevronLeft size={18} />
      </button>
      <div className="flex min-w-44 flex-col items-center justify-center">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-other-muted">Competência</span>
        <span className="text-base font-bold capitalize text-other-text">{rotulo}</span>
      </div>
      <button
        type="button"
        aria-label="Próximo mês"
        disabled={desabilitado}
        onClick={() => onChange(mes.add(1, "month").format("YYYY-MM"))}
        className={estiloSeta}
      >
        <FiChevronRight size={18} />
      </button>
    </div>
  );
}
