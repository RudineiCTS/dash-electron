import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { FiCheck, FiCopy, FiDownload } from "react-icons/fi";
import {
  LinhaResultadoCampanha,
  RetornoScript,
  TIPO_PESSOA_ROTULO,
} from "../../../interfaces/CampanhaFarmaResultado";
import { AbaResultado } from "../../../hook/useInserirCampanhaDinamica";
import { calcularTotaisRetorno } from "../../../utils/gerarInsertResultadoCampanha";
import { downloadBlob } from "../../../utils/downloadFile";
import { useConferenciaCampanha } from "../../../hook/useConferenciaCampanha";
import { PainelConferencia } from "./PainelConferencia";
import Button from "../../shared/Button/ButtonComponent";

const moeda = (valor: number) => valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

interface PainelResultadoScriptProps {
  retorno: RetornoScript | null;
  aba: AbaResultado;
  onAbaChange: (aba: AbaResultado) => void;
  scriptInsert: string;
  nomeArquivo: string;
  inserido: boolean;
  /** O script foi editado depois da execução: o retorno na tela não é mais o deste texto. */
  retornoDesatualizado: boolean;
  /** A rota de inserção da API ainda não existe: o botão fica desabilitado. */
  insercaoDisponivel: boolean;
  inserindo: boolean;
  onGerarInsert: () => void;
  onInserir: () => void;
}

function Indicador({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-other-border bg-other-bg px-4 py-3">
      <span className="text-xs text-other-muted">{rotulo}</span>
      <strong className="text-lg text-other-text">{valor}</strong>
    </div>
  );
}

function TabelaRetorno({ linhas }: { linhas: LinhaResultadoCampanha[] }) {
  const [busca, setBusca] = useState("");
  const [tipo, setTipo] = useState("todos");

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return linhas.filter((l) => {
      if (tipo !== "todos" && String(l.tipoPessoa) !== tipo) return false;
      if (!termo) return true;
      return String(l.idPessoa).includes(termo) || l.nomePessoa.toLowerCase().includes(termo);
    });
  }, [linhas, busca, tipo]);

  return (
    <>
      <div className="flex flex-wrap gap-3">
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por ID ou nome"
          className="h-11 w-72 rounded-lg border border-other-border bg-other-card px-4 text-sm text-other-text outline-none focus:border-[#32307B]"
        />
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="h-11 rounded-lg border border-other-border bg-other-card px-4 text-sm text-other-text outline-none focus:border-[#32307B]"
        >
          <option value="todos">Todos os tipos</option>
          {Object.entries(TIPO_PESSOA_ROTULO).map(([valor, rotulo]) => (
            <option key={valor} value={valor}>
              {rotulo}
            </option>
          ))}
        </select>
      </div>

      <div className="max-h-96 overflow-auto rounded-lg border border-other-border">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 bg-other-bg text-xs uppercase tracking-wide text-other-muted">
            <tr>
              <th className="px-4 py-3 text-left">Tipo</th>
              <th className="px-3 py-3 text-left">ID</th>
              <th className="px-3 py-3 text-left">Nome</th>
              <th className="px-3 py-3 text-left">Supervisor</th>
              <th className="px-3 py-3 text-left">Gerente</th>
              <th className="px-3 py-3 text-right">Objetivo</th>
              <th className="px-3 py-3 text-right">Apurado</th>
              <th className="px-4 py-3 text-right">Prêmio</th>
            </tr>
          </thead>
          <tbody>
            {filtradas.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-other-muted">
                  Nenhuma linha encontrada.
                </td>
              </tr>
            ) : (
              filtradas.map((l) => (
                <tr key={`${l.tipoPessoa}-${l.idPessoa}`} className="border-t border-other-border text-other-text">
                  <td className="px-4 py-2.5">{TIPO_PESSOA_ROTULO[l.tipoPessoa] ?? l.tipoPessoa}</td>
                  <td className="px-3 py-2.5 text-other-muted">{l.idPessoa}</td>
                  <td className="px-3 py-2.5 font-semibold">{l.nomePessoa}</td>
                  <td className="px-3 py-2.5">{l.nomeSupervisor || "-"}</td>
                  <td className="px-3 py-2.5">{l.nomeGerente || "-"}</td>
                  <td className="px-3 py-2.5 text-right">{moeda(l.objetivo)}</td>
                  <td className="px-3 py-2.5 text-right">{moeda(l.valorApurado)}</td>
                  <td className="px-4 py-2.5 text-right font-semibold">{moeda(l.premio)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

function PainelInsert({ scriptInsert, nomeArquivo }: { scriptInsert: string; nomeArquivo: string }) {
  const [copiado, setCopiado] = useState(false);
  const [erroCopia, setErroCopia] = useState("");

  async function copiar() {
    try {
      await navigator.clipboard.writeText(scriptInsert);
      setErroCopia("");
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setErroCopia("Não foi possível copiar automaticamente. Selecione o texto e use Ctrl+C.");
    }
  }

  function baixar() {
    downloadBlob(new Blob([scriptInsert], { type: "text/sql;charset=utf-8" }), nomeArquivo);
  }

  if (!scriptInsert) {
    return (
      <p className="py-6 text-sm text-other-muted">
        Clique em &quot;Gerar script INSERT&quot; para montar o script a partir do retorno guardado.
      </p>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={copiar}
          className="flex h-10 items-center gap-2 rounded-lg border border-other-border bg-other-card px-4 text-sm font-semibold text-other-text transition-colors hover:bg-other-hoverbg cursor-pointer"
        >
          {copiado ? <FiCheck size={16} /> : <FiCopy size={16} />}
          {copiado ? "Copiado!" : "Copiar"}
        </button>
        <button
          type="button"
          onClick={baixar}
          className="flex h-10 items-center gap-2 rounded-lg border border-other-border bg-other-card px-4 text-sm font-semibold text-other-text transition-colors hover:bg-other-hoverbg cursor-pointer"
        >
          <FiDownload size={16} />
          Baixar .sql
        </button>
        {erroCopia && <span className="text-xs text-red-500">{erroCopia}</span>}
      </div>
      <pre className="max-h-96 overflow-auto rounded-lg bg-[#111827] p-4 font-mono text-xs leading-relaxed text-gray-100">
        {scriptInsert}
      </pre>
    </>
  );
}

export function PainelResultadoScript({
  retorno,
  aba,
  onAbaChange,
  scriptInsert,
  nomeArquivo,
  inserido,
  retornoDesatualizado,
  insercaoDisponivel,
  inserindo,
  onGerarInsert,
  onInserir,
}: PainelResultadoScriptProps) {
  const totais = useMemo(() => (retorno ? calcularTotaisRetorno(retorno.linhas) : null), [retorno]);
  // fica aqui (e não dentro da aba) para a planilha enviada sobreviver à troca de aba
  const conferencia = useConferenciaCampanha(retorno);

  const abas: { id: AbaResultado; rotulo: string }[] = [
    { id: "retorno", rotulo: "Retorno guardado" },
    { id: "insert", rotulo: "Script INSERT" },
    { id: "conferencia", rotulo: "Conferir com planilha" },
  ];

  return (
    <section className="overflow-hidden rounded-xl border border-other-border bg-other-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-other-border px-5">
        <nav className="flex gap-6">
          {abas.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onAbaChange(item.id)}
              className={`border-b-2 py-4 text-sm font-semibold transition-colors cursor-pointer ${
                aba === item.id
                  ? "border-[#32307B] text-[#32307B]"
                  : "border-transparent text-other-muted hover:text-other-text"
              }`}
            >
              {item.rotulo}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3 py-3">
          <Button
            label="Gerar script INSERT"
            variant="secundario"
            onClick={onGerarInsert}
            disabled={!retorno}
          />
          <button
            type="button"
            onClick={onInserir}
            disabled={!retorno || inserido || inserindo || !insercaoDisponivel}
            title={insercaoDisponivel ? undefined : "A inserção na resultado ainda não está disponível na API"}
            className="h-11 rounded-md bg-green-600 px-5 text-sm font-semibold text-white transition-[filter] hover:brightness-110 active:brightness-95 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          >
            {inserindo ? "Inserindo..." : inserido ? "Já inserido" : "Inserir na resultado"}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-5">
        {aba === "conferencia" ? (
          <PainelConferencia
            conferencia={conferencia}
            temRetorno={!!retorno}
            retornoDesatualizado={retornoDesatualizado}
          />
        ) : !retorno ? (
          <p className="py-6 text-sm text-other-muted">
            Execute o script para ver o retorno da apuração aqui.
          </p>
        ) : aba === "retorno" ? (
          <>
            <p className="text-xs text-other-muted">
              Executado em {dayjs(retorno.executadoEm).format("DD/MM/YYYY, HH:mm:ss")}. Supervisores e gerentes já
              consolidados.
            </p>
            {totais && (
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Indicador rotulo="Linhas" valor={String(totais.linhas)} />
                <Indicador rotulo="Total gerentes" valor={moeda(totais.totalGerentes)} />
                <Indicador rotulo="Total supervisores" valor={moeda(totais.totalSupervisores)} />
                <Indicador rotulo="Total prêmio" valor={moeda(totais.totalPremio)} />
              </div>
            )}
            <TabelaRetorno linhas={retorno.linhas} />
          </>
        ) : (
          <PainelInsert scriptInsert={scriptInsert} nomeArquivo={nomeArquivo} />
        )}
      </div>
    </section>
  );
}
