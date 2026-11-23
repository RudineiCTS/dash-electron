import { TIPO_PESSOA_ROTULO } from "../../../interfaces/CampanhaFarmaResultado";
import { TipoPremio } from "../../../utils/validacaoCampanhas";

interface ControlesConferenciaProps {
  /** Tipos de pessoa que existem na campanha, com a quantidade de cada um. */
  presentes: { id: number; quantidade: number }[];
  /** Tipos marcados para comparar. */
  tiposIncluidos: number[];
  onAlternarTipo: (id: number) => void;
  onMarcarTodos: () => void;
  onDesmarcarTodos: () => void;
  tipoPremio: TipoPremio;
  tipoPremioSugerido: TipoPremio;
  /** O usuário trocou o tipo de prêmio (em vez de usar o sugerido). */
  tipoPremioManual: boolean;
  onEscolherTipoPremio: (tipo: TipoPremio) => void;
}

const OPCOES_PREMIO: { tipo: TipoPremio; rotulo: string; detalhe: string }[] = [
  { tipo: "valor", rotulo: "Dinheiro (R$)", detalhe: "compara com o prêmio valor" },
  { tipo: "pontos", rotulo: "Pontos", detalhe: "compara com o prêmio pontos" },
];

const estiloCaixa = "flex flex-col gap-3 rounded-lg border border-other-border bg-other-bg px-4 pb-4 pt-2";
const estiloLegenda = "px-2 text-xs font-bold uppercase tracking-wide text-other-muted";

/** Duas caixas: quais tipos de pessoa entram na comparação e se o prêmio é em dinheiro ou em pontos. */
export function ControlesConferencia({
  presentes,
  tiposIncluidos,
  onAlternarTipo,
  onMarcarTodos,
  onDesmarcarTodos,
  tipoPremio,
  tipoPremioSugerido,
  tipoPremioManual,
  onEscolherTipoPremio,
}: ControlesConferenciaProps) {
  return (
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <fieldset className={estiloCaixa}>
        <legend className={estiloLegenda}>Pessoas a comparar</legend>

        {presentes.length === 0 ? (
          <p className="text-sm text-other-muted">A campanha não tem pessoas com resultado.</p>
        ) : (
          <>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {presentes.map((t) => (
                <label key={t.id} className="flex cursor-pointer items-center gap-2 text-sm text-other-text">
                  <input
                    type="checkbox"
                    checked={tiposIncluidos.includes(t.id)}
                    onChange={() => onAlternarTipo(t.id)}
                    className="h-4 w-4 cursor-pointer accent-[#32307B]"
                  />
                  {TIPO_PESSOA_ROTULO[t.id] ?? `Tipo ${t.id}`}
                  <span className="text-xs text-other-muted">({t.quantidade})</span>
                </label>
              ))}
            </div>
            <div className="flex gap-4 text-xs font-semibold text-[#32307B]">
              <button type="button" onClick={onMarcarTodos} className="hover:underline cursor-pointer">
                Marcar todos
              </button>
              <button type="button" onClick={onDesmarcarTodos} className="hover:underline cursor-pointer">
                Desmarcar todos
              </button>
            </div>
            {tiposIncluidos.length === 0 && (
              <p className="text-xs text-red-500">Marque ao menos um tipo de pessoa para comparar.</p>
            )}
          </>
        )}
      </fieldset>

      <fieldset className={estiloCaixa}>
        <legend className={estiloLegenda}>Prêmio da campanha em</legend>

        <div className="flex flex-col gap-2">
          {OPCOES_PREMIO.map((o) => (
            <label key={o.tipo} className="flex cursor-pointer items-center gap-2 text-sm text-other-text">
              <input
                type="radio"
                name="tipo-premio"
                checked={tipoPremio === o.tipo}
                onChange={() => onEscolherTipoPremio(o.tipo)}
                className="h-4 w-4 cursor-pointer accent-[#32307B]"
              />
              {o.rotulo}
              <span className="text-xs text-other-muted">· {o.detalhe}</span>
            </label>
          ))}
        </div>
        <p className="text-xs text-other-muted">
          {tipoPremioManual
            ? tipoPremio === tipoPremioSugerido
              ? "Escolhido por você."
              : `Escolhido por você (pelo cálculo, o sugerido seria ${tipoPremioSugerido === "pontos" ? "pontos" : "dinheiro"}).`
            : `Sugerido pelo cálculo: ${tipoPremioSugerido === "pontos" ? "a campanha só tem pontos" : "a campanha paga em dinheiro"}.`}
        </p>
      </fieldset>
    </div>
  );
}
