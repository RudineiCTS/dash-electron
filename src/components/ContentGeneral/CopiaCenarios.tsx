import { useMemo, useState } from "react";

export type SituacaoCenario = "Vigente" | "Encerrado" | "Rascunho";

export interface Cenario {
  id: number;
  descricao: string;
  dataInicio: string;
  dataFim: string;
  situacao: SituacaoCenario;
  vendedores: number;
  idPeridoCompetencia: number;
}

export interface OpcoesCopia {
  vendedoresEIds: boolean;
  valoresDeMeta: boolean;
  parametrosEMinimoGarantido: boolean;
}

interface CenarioCopyPanelProps {
  cenarios: Cenario[];
  onCopiar: (cenarioId: number, opcoes: OpcoesCopia) => void;
}

const FILTROS = ["Todos", "Vigentes", "Encerrados", "Rascunhos"] as const;
type Filtro = (typeof FILTROS)[number];

const FILTRO_PARA_SITUACAO: Record<Exclude<Filtro, "Todos">, SituacaoCenario> = {
  Vigentes: "Vigente",
  Encerrados: "Encerrado",
  Rascunhos: "Rascunho",
};

const SITUACAO_STYLES: Record<SituacaoCenario, { dot: string; text: string }> = {
  Vigente: { dot: "bg-emerald-500", text: "text-emerald-700" },
  Encerrado: { dot: "bg-gray-400", text: "text-gray-500" },
  Rascunho: { dot: "bg-amber-500", text: "text-amber-700" },
};

function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function CenarioCopyPanel({ cenarios, onCopiar }: CenarioCopyPanelProps) {
  const [filtro, setFiltro] = useState<Filtro>("Todos");
  const [selecionadoId, setSelecionadoId] = useState<number | null>(
    cenarios[0]?.id ?? null
  );
  const [opcoes, setOpcoes] = useState<OpcoesCopia>({
    vendedoresEIds: true,
    valoresDeMeta: true,
    parametrosEMinimoGarantido: true,
  });

  const cenariosFiltrados = useMemo(() => {
    if (filtro === "Todos") return cenarios;
    return cenarios.filter((c) => c.situacao === FILTRO_PARA_SITUACAO[filtro]);
  }, [cenarios, filtro]);

  const selecionado = useMemo(
    () => cenarios.find((c) => c.id === selecionadoId) ?? null,
    [cenarios, selecionadoId]
  );

  const toggleOpcao = (chave: keyof OpcoesCopia) => {
    setOpcoes((prev) => ({ ...prev, [chave]: !prev[chave] }));
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      {/* Cabeçalho + filtros */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-bold text-indigo-950">
            Cenários gravados
          </span>
          <span className="text-sm text-gray-400">
            
          </span>
        </div>

        <div className="flex gap-2">
          {FILTROS.map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors ${
                filtro === f
                  ? "border-indigo-950 bg-indigo-950 text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto px-6">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-indigo-950 text-xs font-bold uppercase tracking-wide text-white">
              <th className="w-10 rounded-l-lg py-3 pl-4" />
              <th className="px-3 py-3 text-left">ID Cenário</th>
              <th className="px-3 py-3 text-left">ID Periodo Competencia</th>
              <th className="px-3 py-3 text-left">Data Início</th>
              <th className="px-3 py-3 text-left">Data Fim</th>
              <th className="px-3 py-3 text-left">Situação</th>            
              <th className="rounded-r-lg px-3 py-3 text-right">
                Vendedores
              </th>
            </tr>
          </thead>
          <tbody>
            {cenariosFiltrados.map((c) => {
              const isSelected = c.id === selecionadoId;
              const situacaoStyle = SITUACAO_STYLES[c.situacao];

              return (
                <tr
                  key={c.id}
                  onClick={() => setSelecionadoId(c.id)}
                  className={`cursor-pointer border-b border-gray-100 last:border-none ${
                    isSelected ? "bg-indigo-50" : "hover:bg-gray-50"
                  }`}
                >
                  <td className="py-3 pl-4">
                    <input
                      type="radio"
                      checked={isSelected}
                      onChange={() => setSelecionadoId(c.id)}
                      className="h-4 w-4 accent-indigo-900"
                    />
                  </td>
                  <td className="px-3 py-3 font-semibold text-indigo-950">
                    {c.id}
                  </td>
                    <td className="px-3 py-3 font-semibold text-indigo-950">
                    {c.idPeridoCompetencia}
                  </td>
                  <td className="px-3 py-3 font-medium text-gray-700">
                    {c.descricao}
                  </td>
                  <td className="px-3 py-3 text-gray-500">{c.dataInicio}</td>
                  <td className="px-3 py-3 text-gray-500">{c.dataFim}</td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 font-semibold ${situacaoStyle.text}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${situacaoStyle.dot}`}
                      />
                      {c.situacao}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right font-semibold text-gray-700">
                    {c.vendedores}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detalhe do cenário selecionado */}
      {selecionado && (
        <div className="m-6 rounded-xl border-2 border-orange-400 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wide text-gray-400">
                Cenário selecionado
              </span>
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-500">
                {selecionado.situacao}
              </span>
            </div>
            <span className="text-xs text-gray-400">
              Cenário #{selecionado.id}
            </span>
          </div>

          <h3 className="mt-1 text-xl font-bold text-indigo-950">
            {selecionado.descricao}
          </h3>

          <div className="mt-4 grid grid-cols-3 gap-6">
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-gray-400">
                Vigência
              </div>
              <div className="mt-1 text-sm font-semibold text-gray-700">
                {selecionado.dataInicio} → {selecionado.dataFim}
              </div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-gray-400">
                Vendedores
              </div>
              <div className="mt-1 text-sm font-semibold text-gray-700">
                {selecionado.vendedores} vendedores
              </div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-gray-400">
                Total de Metas
              </div>
              <div className="mt-1 text-sm font-bold text-orange-500">
                
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-4">
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={opcoes.vendedoresEIds}
                  onChange={() => toggleOpcao("vendedoresEIds")}
                  className="h-4 w-4 rounded accent-indigo-900"
                />
                Vendedores e IDs
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={opcoes.valoresDeMeta}
                  onChange={() => toggleOpcao("valoresDeMeta")}
                  className="h-4 w-4 rounded accent-indigo-900"
                />
                Valores de meta
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={opcoes.parametrosEMinimoGarantido}
                  onChange={() => toggleOpcao("parametrosEMinimoGarantido")}
                  className="h-4 w-4 rounded accent-indigo-900"
                />
                Parâmetros e mínimo garantido
              </label>
            </div>

            <button
              onClick={() => onCopiar(selecionado.id, opcoes)}
              className="rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-600"
            >
              Copiar para o lote atual
            </button>
          </div>
        </div>
      )}
    </div>
  );
}