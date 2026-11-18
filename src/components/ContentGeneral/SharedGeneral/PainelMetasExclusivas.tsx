import { useState } from "react";
import { FiAlertTriangle, FiCheck, FiRotateCcw } from "react-icons/fi";
import { CommissionScenario } from "../../../interfaces/CommissionScenario";
import { ImportacaoMetasTotais } from "../../../interfaces/ImportacaoMetas";
import { TIPOS_EXCLUSIVAS, useImportacaoExclusivas } from "../../../hook/useImportacaoExclusivas";
import { ModalConfirmarImportacaoExclusivas } from "./ModalConfirmarImportacaoExclusivas";
import { SecaoCalculoComissao } from "./SecaoCalculoComissao";

const SITUACAO_ABERTO = 1;

const estiloInput =
  "h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 focus:border-indigo-400 focus:outline-none disabled:opacity-50";

function moeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function Campo({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-[11px] font-bold uppercase tracking-wide text-gray-400">
      {rotulo}
      {children}
    </label>
  );
}

function Total({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
      <span className="text-[11px] font-bold uppercase tracking-wide text-gray-400">{rotulo}</span>
      <strong className="text-base text-orange-500">{valor}</strong>
    </div>
  );
}

interface PainelMetasExclusivasProps {
  cenarios: CommissionScenario[];
  periodoId: number | null;
  cenarioId: number | null;
  onPeriodoChange: (id: number | null) => void;
  onCenarioChange: (id: number | null) => void;
  /** Escolher um item da lista define período e cenário juntos (cada um pode ser ajustado depois). */
  onEscolherDaLista: (cenario: CommissionScenario) => void;
  totais: ImportacaoMetasTotais | null;
  carregandoTotais: boolean;
  erroTotais: string;
  /** Chamado depois que as metas exclusivas foram gravadas de verdade. */
  onImportado: () => void;
}

/** Conteúdo do rodapé expandido: período e cenário, totais de meta e importação das metas exclusivas. */
export function PainelMetasExclusivas({
  cenarios,
  periodoId,
  cenarioId,
  onPeriodoChange,
  onCenarioChange,
  onEscolherDaLista,
  totais,
  carregandoTotais,
  erroTotais,
  onImportado,
}: PainelMetasExclusivasProps) {
  const x = useImportacaoExclusivas({ periodoId, cenarioId, onImportado });
  const [confirmando, setConfirmando] = useState(false);

  const periodo = cenarios.find((c) => c.idPeriodCompetence === periodoId) ?? null;
  const periodoAberto = periodo?.idPeriodCompetenceStatus === SITUACAO_ABERTO;
  const ocupado = x.executando !== null;
  const podeExecutar = !!x.script.trim() && !x.carregandoScript && !x.erroScript && !ocupado;
  const importou = !!x.resultado?.sucesso && !x.resultado.simulado;
  const tipo = TIPOS_EXCLUSIVAS.find((t) => t.id === x.tipoPessoa);
  const [linhasMetas, linhasValores, linhasLimites] = x.resultado?.linhasPorResultado ?? [];

  async function confirmar() {
    await x.executar(false);
    setConfirmando(false);
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Período e cenário */}
      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-bold text-indigo-950">Período e cenário</h3>
        <div className="grid gap-3 md:grid-cols-[minmax(0,2fr)_1fr_1fr]">
          <Campo rotulo="Escolher da lista">
            <select
              value=""
              onChange={(e) => {
                const escolhido = cenarios.find((c) => c.idPeriodCompetence === Number(e.target.value));
                if (escolhido) onEscolherDaLista(escolhido);
              }}
              className={estiloInput}
            >
              <option value="">
                {periodo ? `#${periodo.idPeriodCompetence} · ${periodo.scenarioDescription ?? ""}` : "Escolha um cenário"}
              </option>
              {cenarios.map((c) => (
                <option key={c.idPeriodCompetence} value={c.idPeriodCompetence}>
                  #{c.idPeriodCompetence} · {c.scenarioDescription ?? `Cenário #${c.idScenario}`} ·{" "}
                  {c.periodCompetenceStatusDescription ?? "-"}
                </option>
              ))}
            </select>
          </Campo>
          <Campo rotulo="Período de competência (ID)">
            <input
              type="number"
              min={1}
              value={periodoId ?? ""}
              onChange={(e) => onPeriodoChange(e.target.value ? Number(e.target.value) : null)}
              className={estiloInput}
            />
          </Campo>
          <Campo rotulo="Cenário (ID)">
            <input
              type="number"
              min={1}
              value={cenarioId ?? ""}
              onChange={(e) => onCenarioChange(e.target.value ? Number(e.target.value) : null)}
              className={estiloInput}
            />
          </Campo>
        </div>

        {periodo && !periodoAberto && (
          <p className="flex items-center gap-2 rounded-lg border border-orange-300 bg-orange-50 px-3 py-2 text-sm text-orange-800">
            <FiAlertTriangle className="shrink-0" />
            O período #{periodo.idPeriodCompetence} está {periodo.periodCompetenceStatusDescription ?? "fechado"}: a
            importação só funciona em período ABERTO.
          </p>
        )}
      </section>

      {/* Totais */}
      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-bold text-indigo-950">
          Totais de meta do período {periodoId ? `#${periodoId}` : ""}
          <span className="ml-2 text-xs font-normal text-gray-400">linha do totalizador</span>
        </h3>
        {erroTotais ? (
          <p className="text-sm text-red-600">{erroTotais}</p>
        ) : carregandoTotais ? (
          <p className="text-sm text-gray-400">Carregando...</p>
        ) : totais && totais.temMetas ? (
          <div className="grid gap-3 md:grid-cols-3">
            <Total rotulo="Loja virtual" valor={moeda(totais.lojaVirtual)} />
            <Total rotulo="Setor" valor={moeda(totais.setor)} />
            <Total rotulo="Cobertura" valor={totais.coberturaCarteira.toLocaleString("pt-BR")} />
          </div>
        ) : (
          <p className="text-sm text-gray-400">Sem metas do totalizador neste período.</p>
        )}
      </section>

      {/* Importar metas exclusivas */}
      <section className="flex flex-col gap-3 rounded-xl border border-gray-200 p-4">
        <h3 className="text-sm font-bold text-indigo-950">Importar metas exclusivas</h3>

        <div className="grid gap-3 md:grid-cols-4">
          <Campo rotulo="Tipo de pessoa">
            <select value={x.tipoPessoa} onChange={(e) => x.setTipoPessoa(Number(e.target.value))} className={estiloInput}>
              {TIPOS_EXCLUSIVAS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.id} · {t.nome}
                </option>
              ))}
            </select>
          </Campo>
          <Campo rotulo="ID da supervisora">
            <input value={x.idSupervisor} onChange={(e) => x.setIdSupervisor(e.target.value)} className={estiloInput} />
          </Campo>
          <Campo rotulo="ID do gerente">
            <input value={x.idGerente} onChange={(e) => x.setIdGerente(e.target.value)} className={estiloInput} />
          </Campo>
          <div className="flex flex-col justify-end gap-1 text-sm font-medium text-gray-700">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={x.valoresGarantidos} onChange={(e) => x.setValoresGarantidos(e.target.checked)} />
              Mínimo garantido + máximo
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={x.premioLojaVirtual} onChange={(e) => x.setPremioLojaVirtual(e.target.checked)} />
              KPIs de loja virtual
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={x.gatilhoVenda} onChange={(e) => x.setGatilhoVenda(e.target.checked)} />
              Possui gatilho de venda
            </label>
          </div>

          <Campo rotulo="Mínimo garantido (R$)">
            <input value={x.minimoGarantido} onChange={(e) => x.setMinimoGarantido(e.target.value)} inputMode="decimal" className={`${estiloInput} text-right`} />
          </Campo>
          <Campo rotulo="Ganho máximo (R$)">
            <input value={x.ganhoMaximo} onChange={(e) => x.setGanhoMaximo(e.target.value)} inputMode="decimal" className={`${estiloInput} text-right`} />
          </Campo>
          <Campo rotulo="Gatilho de venda">
            <input value={x.valorGatilho} onChange={(e) => x.setValorGatilho(e.target.value)} inputMode="decimal" className={`${estiloInput} text-right`} />
          </Campo>
          <Campo rotulo="Meta de venda (loja virtual)">
            <input value={x.metaVenda} onChange={(e) => x.setMetaVenda(e.target.value)} inputMode="decimal" className={`${estiloInput} text-right`} />
          </Campo>
          <Campo rotulo="Meta de positivação">
            <input value={x.metaPositivacao} onChange={(e) => x.setMetaPositivacao(e.target.value)} inputMode="numeric" className={`${estiloInput} text-right`} />
          </Campo>
          <Campo rotulo="Mínimo de positivação">
            <input value={x.minimoPositivacao} onChange={(e) => x.setMinimoPositivacao(e.target.value)} inputMode="numeric" className={`${estiloInput} text-right`} />
          </Campo>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold text-gray-500">
            Script que vai rodar
            {x.editado && (
              <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold uppercase text-orange-600">
                Editado manualmente
              </span>
            )}
          </span>
          {x.editado && (
            <button
              type="button"
              onClick={x.restaurarScript}
              className="flex items-center gap-1 text-xs font-semibold text-indigo-950 hover:underline cursor-pointer"
            >
              <FiRotateCcw size={12} /> Restaurar do formulário
            </button>
          )}
        </div>

        {x.erroScript ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-3 text-sm font-medium text-red-700">{x.erroScript}</p>
        ) : (
          <textarea
            value={x.carregandoScript ? "Montando o script..." : x.script}
            onChange={(e) => x.alterarScript(e.target.value)}
            readOnly={x.carregandoScript}
            spellCheck={false}
            className="h-72 w-full resize-y rounded-lg border border-gray-200 bg-gray-50 p-3 font-mono text-xs text-gray-700 outline-none focus:border-indigo-400"
          />
        )}
        {x.editado && (
          <p className="text-xs text-gray-500">
            Enquanto o texto estiver editado, mudar os campos acima não altera o script. A API só executa se o script
            escrever nas tabelas da importação de metas e declarar o mesmo período escolhido.
          </p>
        )}

        {x.erroExecucao && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-3 text-sm font-medium text-red-700">{x.erroExecucao}</p>
        )}

        {x.resultado?.sucesso && (
          <div className="flex flex-col gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            <strong className="flex items-center gap-2">
              <FiCheck />
              {x.resultado.simulado ? "Teste concluído: nada foi gravado" : "Metas exclusivas importadas"}
            </strong>
            <span>
              {linhasMetas ?? 0} meta(s), {linhasValores ?? 0} valor(es) e {linhasLimites ?? 0} limite(s)
              {x.resultado.simulado ? " seriam gravados" : " gravados"} para {tipo ? `${tipo.id} · ${tipo.nome}` : `o tipo ${x.tipoPessoa}`}.
            </span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => x.executar(true)}
            disabled={!podeExecutar || importou}
            className="h-10 rounded-lg border border-indigo-950 px-4 text-sm font-semibold text-indigo-950 hover:bg-indigo-50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          >
            {x.executando === "simular" ? "Testando..." : "Testar sem gravar"}
          </button>
          <button
            type="button"
            onClick={() => setConfirmando(true)}
            disabled={!podeExecutar || !periodoAberto || importou}
            title={periodoAberto ? undefined : "O período precisa estar ABERTO"}
            className="h-10 rounded-lg bg-orange-500 px-5 text-sm font-bold text-white hover:bg-orange-600 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          >
            Importar metas exclusivas
          </button>
        </div>
      </section>

      {/* Calcular comissões do período escolhido */}
      <SecaoCalculoComissao
        periodoId={periodoId}
        situacaoId={periodo?.idPeriodCompetenceStatus ?? null}
        situacaoDescricao={periodo?.periodCompetenceStatusDescription ?? null}
        onCalculado={onImportado}
      />

      {confirmando && (
        <ModalConfirmarImportacaoExclusivas
          periodoId={periodoId}
          cenarioId={cenarioId ?? periodoId}
          tipoPessoa={x.tipoPessoa}
          tipoNome={tipo?.nome ?? ""}
          scriptEditado={x.editado}
          confirmando={x.executando === "importar"}
          onConfirmar={confirmar}
          onCancelar={() => setConfirmando(false)}
        />
      )}
    </div>
  );
}
