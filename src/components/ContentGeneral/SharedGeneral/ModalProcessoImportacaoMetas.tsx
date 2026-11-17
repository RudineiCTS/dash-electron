import { useState } from "react";
import { FiAlertTriangle, FiCheck, FiCopy, FiX } from "react-icons/fi";
import { CommissionScenario } from "../../../interfaces/CommissionScenario";
import { useImportacaoMetas } from "../../../hook/useImportacaoMetas";
import { LinhaPreview } from "./PreviewTableImportacao";

export type ModoProcessoMetas = "ver" | "importar";

interface ModalProcessoImportacaoMetasProps {
  modo: ModoProcessoMetas;
  linhas: LinhaPreview[];
  cenarios: CommissionScenario[];
  /** Período do cenário selecionado na aba "Copiar cenário". */
  periodoSugeridoId: number | null;
  onImportado: () => void;
  onClose: () => void;
}

const estiloInput =
  "h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 focus:border-indigo-400 focus:outline-none disabled:opacity-50";

function Campo({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-semibold text-gray-500">
      {rotulo}
      {children}
    </label>
  );
}

/**
 * "Ver script de processo": mostra o script completo que a importação executa (montado pela API).
 * "Importar Metas": o mesmo script, com a confirmação antes de executar.
 */
export function ModalProcessoImportacaoMetas({
  modo,
  linhas,
  cenarios,
  periodoSugeridoId,
  onImportado,
  onClose,
}: ModalProcessoImportacaoMetasProps) {
  const m = useImportacaoMetas({ linhas, cenarios, periodoSugeridoId, ativo: true, onImportado });
  const [copiado, setCopiado] = useState(false);
  const [erroCopia, setErroCopia] = useState("");

  const importando = modo === "importar";
  const ocupado = m.executando !== null;
  const importou = !!m.resultado?.sucesso && !m.resultado.simulado;
  const podeExecutar = !!m.script && !m.carregandoScript && !m.erroScript && m.periodoAberto && !ocupado && !importou;

  async function copiar() {
    try {
      await navigator.clipboard.writeText(m.script);
      setErroCopia("");
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setErroCopia("Não foi possível copiar automaticamente. Selecione o texto e use Ctrl+C.");
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col gap-4 overflow-auto rounded-xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-extrabold text-indigo-950">
              {importando ? "Importar metas" : "Script de processo"}
            </h2>
            <span className="text-xs text-gray-500">
              {m.vendedoresTotal} vendedores + Auxiliar Supervisora e Supervisora
              {m.periodo ? ` · período #${m.periodo.idPeriodCompetence}` : ""}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={ocupado}
            aria-label="Fechar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 cursor-pointer disabled:opacity-50"
          >
            <FiX size={16} />
          </button>
        </div>

        <div className="grid gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 md:grid-cols-3">
          <div className="md:col-span-3">
            <Campo rotulo="Período de competência">
              <select
                value={m.periodoId ?? ""}
                onChange={(e) => m.setPeriodoId(e.target.value ? Number(e.target.value) : null)}
                disabled={ocupado || importou}
                className={estiloInput}
              >
                <option value="">Escolha o período</option>
                {cenarios.map((c) => (
                  <option key={c.idPeriodCompetence} value={c.idPeriodCompetence}>
                    #{c.idPeriodCompetence} · {c.scenarioDescription ?? `Cenário #${c.idScenario}`} ·{" "}
                    {c.periodCompetenceStatusDescription ?? "-"}
                  </option>
                ))}
              </select>
            </Campo>
          </div>

          <Campo rotulo="ID da supervisora">
            <input value={m.idSupervisor} onChange={(e) => m.setIdSupervisor(e.target.value)} disabled={ocupado || importou} className={estiloInput} />
          </Campo>
          <Campo rotulo="ID da auxiliar supervisora">
            <input value={m.idAuxiliar} onChange={(e) => m.setIdAuxiliar(e.target.value)} disabled={ocupado || importou} className={estiloInput} />
          </Campo>
          <Campo rotulo="ID do gerente">
            <input value={m.idGerente} onChange={(e) => m.setIdGerente(e.target.value)} disabled={ocupado || importou} className={estiloInput} />
          </Campo>

          <Campo rotulo="Supervisão · Meta Loja Virtual">
            <input value={m.lojaVirtual} onChange={(e) => m.setLojaVirtual(e.target.value)} disabled={ocupado || importou} inputMode="decimal" className={`${estiloInput} text-right`} />
          </Campo>
          <Campo rotulo="Supervisão · Meta Setor">
            <input value={m.setor} onChange={(e) => m.setSetor(e.target.value)} disabled={ocupado || importou} inputMode="decimal" className={`${estiloInput} text-right`} />
          </Campo>
          <Campo rotulo="Supervisão · Cobertura">
            <input value={m.cobertura} onChange={(e) => m.setCobertura(e.target.value)} disabled={ocupado || importou} inputMode="decimal" className={`${estiloInput} text-right`} />
          </Campo>
        </div>

        {m.periodo && !m.periodoAberto && (
          <p className="flex items-center gap-2 rounded-lg border border-orange-300 bg-orange-50 px-3 py-2 text-sm text-orange-800">
            <FiAlertTriangle className="shrink-0" />
            O período #{m.periodo.idPeriodCompetence} está {m.periodo.periodCompetenceStatusDescription ?? "fechado"}:
            só é possível importar em período ABERTO.
          </p>
        )}

        {m.avisos.map((aviso) => (
          <p key={aviso} className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600">
            {aviso}
          </p>
        ))}

        {m.erroScript ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-3 text-sm font-medium text-red-700">{m.erroScript}</p>
        ) : (
          <textarea
            value={m.carregandoScript ? "Montando o script..." : m.script}
            readOnly
            spellCheck={false}
            className="min-h-[38vh] w-full flex-1 resize-none rounded-lg border border-gray-200 bg-gray-50 p-3 font-mono text-xs text-gray-700 outline-none"
          />
        )}

        {importando && (
          <div className="flex flex-col gap-1 rounded-lg border border-orange-300 bg-orange-50 px-4 py-3 text-sm text-orange-900">
            <strong className="flex items-center gap-2">
              <FiAlertTriangle /> Confira antes de confirmar
            </strong>
            <span>
              Este script <strong>apaga as metas atuais</strong> do período #{m.periodo?.idPeriodCompetence ?? "?"}{" "}
              (Televendas, Auxiliar Supervisora, Supervisora e Grandes Contas) e grava as da planilha. Tudo roda numa
              transação: se algo falhar, nada é alterado. Use &quot;Testar sem gravar&quot; para executar tudo e
              desfazer no final.
            </span>
          </div>
        )}

        {m.erroExecucao && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-3 text-sm font-medium text-red-700">{m.erroExecucao}</p>
        )}

        {m.resultado?.sucesso && (
          <div className="flex flex-col gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            <strong className="flex items-center gap-2">
              <FiCheck />
              {m.resultado.simulado ? "Teste concluído: nada foi gravado" : "Metas importadas"}
            </strong>
            <span>
              {m.resultado.metasGravadas} metas {m.resultado.simulado ? "seriam gravadas" : "gravadas"} no período
              #{m.periodoId}; {m.resultado.linhasMetaValor} valores (loja virtual, setor e cobertura).
            </span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={copiar}
              disabled={!m.script}
              className="flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer disabled:opacity-50"
            >
              {copiado ? <FiCheck size={16} /> : <FiCopy size={16} />}
              {copiado ? "Copiado!" : "Copiar script"}
            </button>
            <span className="text-xs text-gray-500">
              {erroCopia ? <span className="text-red-500">{erroCopia}</span> : `${m.script.length.toLocaleString("pt-BR")} caracteres`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={ocupado}
              className="h-10 rounded-lg border border-gray-200 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer disabled:opacity-50"
            >
              {importou ? "Fechar" : "Cancelar"}
            </button>
            {importando && (
              <>
                <button
                  type="button"
                  onClick={() => m.executar(true)}
                  disabled={!podeExecutar}
                  className="h-10 rounded-lg border border-indigo-950 px-4 text-sm font-semibold text-indigo-950 hover:bg-indigo-50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {m.executando === "simular" ? "Testando..." : "Testar sem gravar"}
                </button>
                <button
                  type="button"
                  onClick={() => m.executar(false)}
                  disabled={!podeExecutar}
                  className="h-10 rounded-lg bg-orange-500 px-5 text-sm font-bold text-white hover:bg-orange-600 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {m.executando === "importar" ? "Importando..." : "Confirmar e importar"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
