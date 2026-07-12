import { Hammer } from "lucide-react";

interface EmDesenvolvimentoProps {
  /** Título da tela/seção que ainda está em construção */
  titulo?: string;
  /** Texto de apoio, explicando o que vem por aí */
  descricao?: string;
  /** Percentual opcional (0-100) para dar noção de progresso */
  progresso?: number;
}

export default function InBuildingComponent({
  titulo = "Essa tela ainda está em produção",
  descricao = "Estamos construindo essa área com carinho. Em breve ela estará disponível por aqui.",
  progresso,
}: EmDesenvolvimentoProps) {
  return (
    <div className="flex h-full w-full items-center justify-center p-10">
      <div className="relative w-full max-w-md rounded-xl border border-dashed border-emerald-500/40 bg-[#0d1117] p-8">
        {/* faixa "canto" estilo etiqueta de obra */}
        <div className="absolute -top-3 left-6 rounded-full border border-emerald-500/50 bg-[#0d1117] px-3 py-1">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            Em construção
          </span>
        </div>

        <div className="flex flex-col items-center gap-4 pt-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-orange-400/30 bg-orange-400/10">
            <Hammer className="h-6 w-6 text-orange-400" strokeWidth={1.75} />
          </div>

          <h3 className="text-lg font-bold text-orange-400">{titulo}</h3>
          <p className="max-w-xs text-sm leading-relaxed text-gray-400">
            {descricao}
          </p>

          {typeof progresso === "number" && (
            <div className="mt-2 w-full">
              <div className="mb-1 flex justify-between text-[11px] text-gray-500">
                <span>Progresso</span>
                <span>{Math.max(0, Math.min(100, progresso))}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{
                    width: `${Math.max(0, Math.min(100, progresso))}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}