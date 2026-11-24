import { FiPlay, FiX } from "react-icons/fi";
import { CampanhaComercial } from "../../../interfaces/CampanhaComercial";
import { ProgressoCalculo } from "../../../hook/useCampanhasComerciais";
import { podeCalcular } from "../../../utils/resumoCampanhasComerciais";
import Button from "../../shared/Button/ButtonComponent";

interface PainelCalcularCampanhaProps {
  /** Todas as campanhas da competência (a lista para adicionar só mostra as que podem ser calculadas). */
  campanhas: CampanhaComercial[];
  /** Campanhas marcadas na grid ou adicionadas aqui. */
  selecionadas: CampanhaComercial[];
  onAdicionar: (id: number) => void;
  onRemover: (id: number) => void;
  onLimpar: () => void;
  onCalcular: () => void;
  progresso: ProgressoCalculo | null;
  desabilitado: boolean;
}

/**
 * Campo de seleção das campanhas a calcular: as selecionadas na grid aparecem aqui como etiquetas
 * (dá para remover ou adicionar mais pelo seletor) e o botão Calcular roda todas, uma por vez.
 */
export function PainelCalcularCampanha({
  campanhas,
  selecionadas,
  onAdicionar,
  onRemover,
  onLimpar,
  onCalcular,
  progresso,
  desabilitado,
}: PainelCalcularCampanhaProps) {
  const calculando = progresso !== null;
  const idsSelecionados = new Set(selecionadas.map((c) => c.idCampanhaComercial));
  const disponiveis = campanhas.filter((c) => podeCalcular(c) && !idsSelecionados.has(c.idCampanhaComercial));
  const bloqueado = desabilitado || calculando;

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-other-border bg-other-card p-5">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex min-w-72 flex-1 flex-col gap-1.5">
          <span className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-widest text-other-muted">
            Campanhas do mês para calcular
            {selecionadas.length > 0 && !calculando && (
              <button
                type="button"
                onClick={onLimpar}
                className="text-[11px] font-semibold normal-case tracking-normal text-[#32307B] hover:underline cursor-pointer"
              >
                Limpar seleção
              </button>
            )}
          </span>

          <div className="flex min-h-12 flex-wrap items-center gap-2 rounded-lg border border-other-border bg-other-card px-3 py-2 focus-within:border-[#32307B]">
            {selecionadas.map((c) => (
              <span
                key={c.idCampanhaComercial}
                className="flex items-center gap-1.5 rounded-full bg-indigo-50 py-1 pl-3 pr-1.5 text-sm font-semibold text-[#32307B]"
              >
                {c.idCampanhaComercial} · {c.descricaoCampanha}
                <button
                  type="button"
                  aria-label={`Remover a campanha ${c.idCampanhaComercial} da seleção`}
                  disabled={bloqueado}
                  onClick={() => onRemover(c.idCampanhaComercial)}
                  className="flex h-5 w-5 items-center justify-center rounded-full hover:bg-indigo-100 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                >
                  <FiX size={12} />
                </button>
              </span>
            ))}

            <select
              value=""
              disabled={bloqueado || disponiveis.length === 0}
              aria-label="Adicionar campanha à seleção"
              onChange={(e) => e.target.value && onAdicionar(Number(e.target.value))}
              className="h-8 min-w-56 flex-1 bg-transparent text-sm text-other-text outline-none disabled:opacity-60 cursor-pointer"
            >
              <option value="">
                {campanhas.length === 0
                  ? "Nenhuma campanha na competência"
                  : disponiveis.length === 0 && selecionadas.length === 0
                    ? "Nenhuma campanha pode ser calculada"
                    : selecionadas.length === 0
                      ? "Selecione na grid ou escolha aqui"
                      : "Adicionar outra campanha"}
              </option>
              {disponiveis.map((c) => (
                <option key={c.idCampanhaComercial} value={c.idCampanhaComercial}>
                  {c.idCampanhaComercial} · {c.descricaoCampanha}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button
          label={
            calculando
              ? `Calculando ${progresso.atual}/${progresso.total}...`
              : selecionadas.length > 1
                ? `Calcular ${selecionadas.length} campanhas`
                : "Calcular"
          }
          icon={<FiPlay size={16} />}
          onClick={onCalcular}
          disabled={selecionadas.length === 0 || bloqueado}
          className="h-12"
        />
      </div>

      {calculando && (
        <p className="text-sm text-other-muted">
          Calculando a campanha {progresso.id} ({progresso.atual} de {progresso.total}). Uma por vez; isso pode demorar,
          mantenha a tela aberta.
        </p>
      )}
    </section>
  );
}
