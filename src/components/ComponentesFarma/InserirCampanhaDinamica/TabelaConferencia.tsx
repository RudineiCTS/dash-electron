import { useMemo, useState } from "react";
import { FiDownload } from "react-icons/fi";
import { TIPO_PESSOA_ROTULO } from "../../../interfaces/CampanhaFarmaResultado";
import {
  ResultadoConferencia,
  ROTULO_STATUS,
  StatusConferencia,
} from "../../../utils/conferenciaCampanha";

const moeda = (valor: number | null) =>
  valor === null ? "-" : valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const ESTILO_STATUS: Record<StatusConferencia, string> = {
  ok: "bg-green-100 text-green-700",
  divergente: "bg-red-100 text-red-700",
  so_sistema: "bg-amber-100 text-amber-700",
  so_planilha: "bg-blue-100 text-blue-700",
  ambiguo: "bg-purple-100 text-purple-700",
};

// ordem de importância na tabela
const PESO_STATUS: Record<StatusConferencia, number> = {
  divergente: 0,
  ambiguo: 1,
  so_planilha: 2,
  so_sistema: 3,
  ok: 4,
};

type FiltroStatus = "problemas" | "todos" | StatusConferencia;

interface TabelaConferenciaProps {
  resultados: ResultadoConferencia[];
  tolerancia: number;
  onBaixar: () => void;
}

function Diferenca({ valor, tolerancia }: { valor: number | null; tolerancia: number }) {
  if (valor === null) return <span className="text-other-muted">-</span>;
  const fora = Math.abs(valor) > tolerancia;
  return (
    <span className={fora ? "font-bold text-red-600" : "text-other-muted"}>
      {valor > 0 ? "+" : ""}
      {moeda(valor)}
    </span>
  );
}

export function TabelaConferencia({ resultados, tolerancia, onBaixar }: TabelaConferenciaProps) {
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState<FiltroStatus>("problemas");
  const [tipo, setTipo] = useState("todos");
  const [mostrarZeradas, setMostrarZeradas] = useState(false);

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return resultados
      .filter((r) => {
        if (r.zeradaForaDaBase && !mostrarZeradas) return false;
        if (status === "problemas" && r.status === "ok") return false;
        if (status !== "problemas" && status !== "todos" && r.status !== status) return false;
        if (tipo !== "todos" && String(r.tipoPessoa) !== tipo) return false;
        if (!termo) return true;
        return String(r.idPessoa ?? "").includes(termo) || r.nome.toLowerCase().includes(termo);
      })
      .sort(
        (a, b) =>
          PESO_STATUS[a.status] - PESO_STATUS[b.status] ||
          Math.abs(b.difValor ?? 0) + Math.abs(b.difPremio ?? 0) - (Math.abs(a.difValor ?? 0) + Math.abs(a.difPremio ?? 0)) ||
          a.nome.localeCompare(b.nome)
      );
  }, [resultados, busca, status, tipo, mostrarZeradas]);

  const estiloFiltro =
    "h-11 rounded-lg border border-other-border bg-other-card px-4 text-sm text-other-text outline-none focus:border-[#32307B]";

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por ID ou nome"
          className={`${estiloFiltro} w-64`}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value as FiltroStatus)} className={estiloFiltro}>
          <option value="problemas">Só o que não bate</option>
          <option value="todos">Todos os status</option>
          {(Object.keys(ROTULO_STATUS) as StatusConferencia[]).map((s) => (
            <option key={s} value={s}>
              {ROTULO_STATUS[s]}
            </option>
          ))}
        </select>
        <select value={tipo} onChange={(e) => setTipo(e.target.value)} className={estiloFiltro}>
          <option value="todos">Todos os tipos</option>
          {Object.entries(TIPO_PESSOA_ROTULO).map(([valor, rotulo]) => (
            <option key={valor} value={valor}>
              {rotulo}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-other-muted">
          <input type="checkbox" checked={mostrarZeradas} onChange={(e) => setMostrarZeradas(e.target.checked)} />
          Mostrar zerados fora da base
        </label>

        <button
          type="button"
          onClick={onBaixar}
          className="ml-auto flex h-11 items-center gap-2 rounded-lg border border-other-border bg-other-card px-4 text-sm font-semibold text-other-text transition-colors hover:bg-other-hoverbg cursor-pointer"
        >
          <FiDownload size={16} />
          Baixar divergências (.xlsx)
        </button>
      </div>

      <div className="max-h-[32rem] overflow-auto rounded-lg border border-other-border">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 bg-other-bg text-xs uppercase tracking-wide text-other-muted">
            <tr>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-3 py-3 text-left">Tipo</th>
              <th className="px-3 py-3 text-left">ID</th>
              <th className="px-3 py-3 text-left">Nome</th>
              <th className="px-3 py-3 text-right">Valor sistema</th>
              <th className="px-3 py-3 text-right">Valor base</th>
              <th className="px-3 py-3 text-right">Dif.</th>
              <th className="px-3 py-3 text-right">Prêmio sistema</th>
              <th className="px-3 py-3 text-right">Prêmio base</th>
              <th className="px-3 py-3 text-right">Dif.</th>
              <th className="px-4 py-3 text-left">Observação</th>
            </tr>
          </thead>
          <tbody>
            {filtradas.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-4 py-6 text-center text-other-muted">
                  Nada para mostrar com esses filtros.
                </td>
              </tr>
            ) : (
              filtradas.map((r, i) => (
                <tr key={`${r.idPessoa ?? "x"}-${r.nome}-${i}`} className="border-t border-other-border text-other-text">
                  <td className="px-4 py-2.5">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${ESTILO_STATUS[r.status]}`}>
                      {ROTULO_STATUS[r.status]}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">{r.tipoPessoa === null ? "-" : TIPO_PESSOA_ROTULO[r.tipoPessoa] ?? r.tipoPessoa}</td>
                  <td className="px-3 py-2.5 text-other-muted">{r.idPessoa ?? "-"}</td>
                  <td className="px-3 py-2.5 font-semibold">{r.nome || "-"}</td>
                  <td className="px-3 py-2.5 text-right">{moeda(r.valorSistema)}</td>
                  <td className="px-3 py-2.5 text-right">{moeda(r.valorBase)}</td>
                  <td className="px-3 py-2.5 text-right">
                    <Diferenca valor={r.difValor} tolerancia={tolerancia} />
                  </td>
                  <td className="px-3 py-2.5 text-right">{moeda(r.premioSistema)}</td>
                  <td className="px-3 py-2.5 text-right">{moeda(r.premioBase)}</td>
                  <td className="px-3 py-2.5 text-right">
                    <Diferenca valor={r.difPremio} tolerancia={tolerancia} />
                  </td>
                  <td className="px-4 py-2.5 text-xs text-other-muted">{r.observacao}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
