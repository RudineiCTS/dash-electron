import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";

export interface Cenario {
  id: number;
  descricao: string;
  dataInicio: string; // ISO (yyyy-mm-dd ou datetime)
  dataFim: string; // ISO (yyyy-mm-dd ou datetime)
  situacao: string; // texto cru vindo do banco (DescricaoCompetenciaSituacao)
  vendedores: number;
  idPeridoCompetencia: number;
}

export interface OpcoesCopia {
  vendedoresEIds: boolean;
  valoresDeMeta: boolean;
  parametrosEMinimoGarantido: boolean;
}

export interface CopiaCenarioForm {
  sourceScenarioId: number;
  newScenarioId: number;
  newPeriodCompetenceId: number;
  description: string;
  startDate: string; // yyyy-mm-dd
  endDate: string; // yyyy-mm-dd
}

interface CenarioCopyPanelProps {
  cenarios: Cenario[];
  onCopiar: (form: CopiaCenarioForm) => void;
  copiando?: boolean;
  erroCopia?: string;
  /** Disparado sempre que a seleção na tabela de cenários mudar (usado para alimentar o rodapé de metas). */
  onCenarioSelecionado?: (cenario: Cenario | null) => void;
}

const FILTROS = ["TODOS", "LIBERADO", "FINALIZADO"] as const;
type Filtro = (typeof FILTROS)[number];

// Best-effort: a query hoje só traz o texto cru da situação (DescricaoCompetenciaSituacao),
// não um catálogo fechado de valores. Esses filtros comparam por substring (case-insensitive).
const FILTRO_PARA_TEXTO: Record<Exclude<Filtro, "TODOS">, string> = {
  LIBERADO: "LIBERADO",
  FINALIZADO: "FINALIZADO"  
};

function situacaoStyle(situacao: string): { dot: string; text: string } {
  const s = situacao;
  if (s.includes("LIBERADO") || s.includes("aberto")) return { dot: "bg-emerald-500", text: "text-emerald-700" };
  if (s.includes("FINALIZADO") || s.includes("fechado")) return { dot: "bg-gray-400", text: "text-gray-500" };  
  return { dot: "bg-gray-300", text: "text-gray-500" };
}

function toDateInputValue(value: string): string {
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("YYYY-MM-DD") : "";
}

function formatarData(value: string): string {
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("DD/MM/YYYY") : "-";
}

export function CenarioCopyPanel({
  cenarios,
  onCopiar,
  copiando = false,
  erroCopia = "",
  onCenarioSelecionado,
}: CenarioCopyPanelProps) {
  const [filtro, setFiltro] = useState<Filtro>("TODOS");
  const [selecionadoId, setSelecionadoId] = useState<number | null>(
    cenarios[0]?.id ?? null
  );
  const [opcoes, setOpcoes] = useState<OpcoesCopia>({
    vendedoresEIds: true,
    valoresDeMeta: true,
    parametrosEMinimoGarantido: true,
  });

  const proximoIdCenario = useMemo(() => {
    if (cenarios.length === 0) return 1;
    return Math.max(...cenarios.map((c) => c.id)) + 1;
  }, [cenarios]);

  const proximoIdPeriodo = useMemo(() => {
    if (cenarios.length === 0) return 1;
    return Math.max(...cenarios.map((c) => c.idPeridoCompetencia)) + 1;
  }, [cenarios]);

  const [novoIdCenario, setNovoIdCenario] = useState(proximoIdCenario);
  const [novoIdPeriodo, setNovoIdPeriodo] = useState(proximoIdPeriodo);
  const [novaDescricao, setNovaDescricao] = useState("");
  const [novaDataInicio, setNovaDataInicio] = useState("");
  const [novaDataFim, setNovaDataFim] = useState("");

  // Sugere os próximos IDs sempre que a lista mudar (ex: depois de copiar com sucesso).
  useEffect(() => {
    setNovoIdCenario(proximoIdCenario);
    setNovoIdPeriodo(proximoIdPeriodo);
  }, [proximoIdCenario, proximoIdPeriodo]);

  const cenariosFiltrados = useMemo(() => {
    if (filtro === "TODOS") return cenarios;
    const texto = FILTRO_PARA_TEXTO[filtro];
    // const cen = cenarios.filter((c) => c.situacao.includes(texto));
    // console.log(cen)
    // console.log(texto)
    return cenarios.filter((c) => c.situacao.includes(texto));
  }, [cenarios, filtro]);

  const selecionado = useMemo(
    () => cenarios.find((c) => c.id === selecionadoId) ?? null,
    [cenarios, selecionadoId]
  );

  useEffect(() => {
    onCenarioSelecionado?.(selecionado);
  }, [selecionado, onCenarioSelecionado]);

  // Ao trocar o cenário de origem, sugere as mesmas datas de vigência como ponto de partida.
  useEffect(() => {
    if (!selecionado) return;
    setNovaDataInicio(toDateInputValue(selecionado.dataInicio));
    setNovaDataFim(toDateInputValue(selecionado.dataFim));
    setNovaDescricao((prev) => prev || `Cópia de ${selecionado.descricao}`);
  }, [selecionado]);

  const toggleOpcao = (chave: keyof OpcoesCopia) => {
    setOpcoes((prev) => ({ ...prev, [chave]: !prev[chave] }));
  };

  function handleCopiar() {
    if (!selecionado) return;
    onCopiar({
      sourceScenarioId: selecionado.id,
      newScenarioId: novoIdCenario,
      newPeriodCompetenceId: novoIdPeriodo,
      description: novaDescricao,
      startDate: novaDataInicio,
      endDate: novaDataFim,
    });
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      {/* Cabeçalho + filtros */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-bold text-indigo-950">
            Cenários gravados
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
              <th className="px-3 py-3 text-left">Descrição</th>
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
              const style = situacaoStyle(c.situacao);

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
                  <td className="px-3 py-3 text-gray-500">{formatarData(c.dataInicio)}</td>
                  <td className="px-3 py-3 text-gray-500">{formatarData(c.dataFim)}</td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 font-semibold ${style.text}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${style.dot}`}
                      />
                      {c.situacao }
                      
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

          <div className="mt-4 grid grid-cols-2 gap-6">
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-gray-400">
                Vigência
              </div>
              <div className="mt-1 text-sm font-semibold text-gray-700">
                {formatarData(selecionado.dataInicio)} → {formatarData(selecionado.dataFim)}
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
          </div>

          {/* Dados do novo cenário/período */}
          <div className="mt-5 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 md:grid-cols-3">
            <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wide text-gray-400">
              Novo ID do cenário
              <input
                type="number"
                value={novoIdCenario}
                onChange={(e) => setNovoIdCenario(Number(e.target.value))}
                className="rounded-md border border-gray-200 px-2.5 py-1.5 text-sm font-semibold text-gray-700 normal-case tracking-normal"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wide text-gray-400">
              Novo ID do período
              <input
                type="number"
                value={novoIdPeriodo}
                onChange={(e) => setNovoIdPeriodo(Number(e.target.value))}
                className="rounded-md border border-gray-200 px-2.5 py-1.5 text-sm font-semibold text-gray-700 normal-case tracking-normal"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wide text-gray-400 md:col-span-1">
              Descrição do novo cenário
              <input
                type="text"
                value={novaDescricao}
                onChange={(e) => setNovaDescricao(e.target.value)}
                className="rounded-md border border-gray-200 px-2.5 py-1.5 text-sm font-semibold text-gray-700 normal-case tracking-normal"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wide text-gray-400">
              Data início
              <input
                type="date"
                value={novaDataInicio}
                onChange={(e) => setNovaDataInicio(e.target.value)}
                className="rounded-md border border-gray-200 px-2.5 py-1.5 text-sm font-semibold text-gray-700 normal-case tracking-normal"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wide text-gray-400">
              Data fim
              <input
                type="date"
                value={novaDataFim}
                onChange={(e) => setNovaDataFim(e.target.value)}
                className="rounded-md border border-gray-200 px-2.5 py-1.5 text-sm font-semibold text-gray-700 normal-case tracking-normal"
              />
            </label>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-4">
            <div className=" flex-wrap gap-6 hidden">
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
              onClick={handleCopiar}
              disabled={copiando}
              className="rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {copiando ? "Copiando..." : "Criar e copiar cenário"}
            </button>
          </div>

          {erroCopia && (
            <p className="mt-3 text-sm font-medium text-red-600">{erroCopia}</p>
          )}
        </div>
      )}
    </div>
  );
}
