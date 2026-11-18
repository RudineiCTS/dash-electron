import { useMemo, useState } from "react";
import { FiAlertTriangle, FiCheck, FiDownload } from "react-icons/fi";
import dayjs from "dayjs";
import {
  SITUACOES_QUE_CALCULAM,
  TIPOS_PADRAO_TELEVENDAS,
  useCalculoComissao,
} from "../../../hook/useCalculoComissao";
import { CalculoComissaoLinha } from "../../../interfaces/CalculoComissao";
import { downloadExcelMultiSheet } from "../../../utils/excelExport";
import { ModalConfirmarCalculoComissao } from "./ModalConfirmarCalculoComissao";

const LINHAS_NA_TELA = 300;

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

function Indicador({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
      <span className="text-[11px] font-bold uppercase tracking-wide text-gray-400">{rotulo}</span>
      <strong className="text-base text-indigo-950">{valor}</strong>
    </div>
  );
}

function exportar(linhas: CalculoComissaoLinha[], periodoId: number) {
  const cabecalho = [
    "ID pessoa", "Pessoa", "Tipo pessoa", "ID supervisor", "Supervisor", "ID gerente", "Gerente",
    "KPI", "Nome KPI", "Valor prêmio", "Valor apurado", "Valor meta", "% realizado", "Data cálculo",
  ];
  const corpo = linhas.map((l) => [
    l.idPessoa, l.pessoa, l.tipoPessoa, l.idSupervisor, l.supervisor, l.idGerente, l.gerente,
    l.descricaoKpi ?? l.codigoKpi, l.nomeKpi, l.valorPremio, l.valorApurado, l.valorMeta, l.realizado,
    l.dataCalculo ? dayjs(l.dataCalculo).format("DD/MM/YYYY HH:mm") : "",
  ]);
  downloadExcelMultiSheet(
    [{ name: "Comissões", rows: [cabecalho, ...corpo] }],
    `comissoes-periodo-${periodoId}-${dayjs().format("YYYYMMDD-HHmm")}.xlsx`
  );
}

interface SecaoCalculoComissaoProps {
  periodoId: number | null;
  /** IDComissaoVendasPeriodoCompetenciaSituacao do período escolhido, se conhecido. */
  situacaoId: number | null;
  situacaoDescricao: string | null;
  /** Chamado depois que o cálculo foi gravado de verdade. */
  onCalculado: () => void;
}

/** Cálculo de comissões: executa uspUsuCalculaComissaoVendas para o período escolhido no rodapé. */
export function SecaoCalculoComissao({ periodoId, situacaoId, situacaoDescricao, onCalculado }: SecaoCalculoComissaoProps) {
  const c = useCalculoComissao({ periodoId, onCalculado });
  const [confirmando, setConfirmando] = useState(false);
  const [busca, setBusca] = useState("");

  const ocupado = c.executando !== null;
  const podeCalcular = situacaoId != null && SITUACOES_QUE_CALCULAM.includes(situacaoId);
  const r = c.resultado;

  const filtradas = useMemo(() => {
    if (!r) return [];
    const termo = busca.trim().toLowerCase();
    const base = termo
      ? r.linhas.filter(
          (l) => String(l.idPessoa).includes(termo) || (l.pessoa ?? "").toLowerCase().includes(termo) || (l.nomeKpi ?? "").toLowerCase().includes(termo)
        )
      : r.linhas;
    return base;
  }, [r, busca]);

  async function confirmar() {
    await c.executar("calcular");
    setConfirmando(false);
  }

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-gray-200 p-4">
      <h3 className="text-sm font-bold text-indigo-950">
        Calcular comissões
        <span className="ml-2 text-xs font-normal text-gray-400">uspUsuCalculaComissaoVendas</span>
      </h3>

      <div className="grid gap-3 md:grid-cols-[1fr_1fr]">
        <Campo rotulo="Tipo de comissão">
          <select value={c.tipoComissao} onChange={(e) => c.setTipoComissao(Number(e.target.value))} className={estiloInput}>
            <option value={0}>0 · Televendas (gerente 28727)</option>
            <option value={1}>1 · Farma (gerentes 7916, 4680 e 159452)</option>
          </select>
        </Campo>
        <Campo rotulo="IDs de pessoa (vazio = todas)">
          <input
            value={c.idPessoas}
            onChange={(e) => c.setIdPessoas(e.target.value)}
            placeholder="ex.: 112321, 124609"
            className={estiloInput}
          />
        </Campo>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
            Tipos de pessoa ({c.tipoPessoas.length} selecionados{c.tipoPessoas.length === 0 ? ": todos" : ""})
          </span>
          <div className="flex gap-3 text-xs font-semibold text-indigo-950">
            <button type="button" onClick={() => c.setTipoPessoas(TIPOS_PADRAO_TELEVENDAS)} className="hover:underline cursor-pointer">
              Padrão Televendas
            </button>
            <button type="button" onClick={() => c.setTipoPessoas(c.tipos.map((t) => t.id))} className="hover:underline cursor-pointer">
              Todos
            </button>
            <button type="button" onClick={() => c.setTipoPessoas([])} className="hover:underline cursor-pointer">
              Limpar
            </button>
          </div>
        </div>
        {c.erroTipos ? (
          <p className="text-sm text-red-600">{c.erroTipos}</p>
        ) : (
          <div className="grid max-h-40 gap-x-4 gap-y-1 overflow-auto rounded-lg border border-gray-200 p-3 text-sm text-gray-700 md:grid-cols-3">
            {c.tipos.map((t) => (
              <label key={t.id} className="flex items-center gap-2">
                <input type="checkbox" checked={c.tipoPessoas.includes(t.id)} onChange={() => c.alternarTipo(t.id)} />
                <span className="truncate" title={t.descricao}>
                  {t.id} · {t.descricao}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500">
        Período #{periodoId ?? "?"} · {situacaoDescricao ?? "situação desconhecida"}. Calcular só funciona em período
        LIBERADO ou em SIMULAÇÃO; consultar funciona em qualquer situação. O tipo de comissão segue o que a procedure faz
        no código (0 = gerente do Televendas, 1 = gerentes do Farma), que é o inverso do comentário dela.
      </p>

      {!podeCalcular && situacaoId != null && (
        <p className="flex items-center gap-2 rounded-lg border border-orange-300 bg-orange-50 px-3 py-2 text-sm text-orange-800">
          <FiAlertTriangle className="shrink-0" />O período está {situacaoDescricao ?? "numa situação"} que não aceita o
          cálculo: só dá para consultar o resultado.
        </p>
      )}

      {c.erro && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-3 text-sm font-medium text-red-700">{c.erro}</p>}

      <div className="flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => c.executar("consultar")}
          disabled={ocupado || periodoId == null}
          className="h-10 rounded-lg border border-gray-300 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        >
          {c.executando === "consultar" ? "Consultando..." : "Consultar resultado"}
        </button>
        <button
          type="button"
          onClick={() => c.executar("testar")}
          disabled={ocupado || periodoId == null || !podeCalcular}
          className="h-10 rounded-lg border border-indigo-950 px-4 text-sm font-semibold text-indigo-950 hover:bg-indigo-50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        >
          {c.executando === "testar" ? "Testando (pode levar minutos)..." : "Testar cálculo (não grava)"}
        </button>
        <button
          type="button"
          onClick={() => setConfirmando(true)}
          disabled={ocupado || periodoId == null || !podeCalcular}
          className="h-10 rounded-lg bg-orange-500 px-5 text-sm font-bold text-white hover:bg-orange-600 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        >
          {c.executando === "calcular" ? "Calculando (pode levar minutos)..." : "Calcular comissões"}
        </button>
      </div>

      {r?.sucesso && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            <strong className="flex items-center gap-2">
              <FiCheck />
              {!r.calculou ? "Resultado atual (nada foi calculado)" : r.simulado ? "Teste concluído: nada foi gravado" : "Comissões calculadas"}
            </strong>
            {r.mensagens.length > 0 && <span className="text-xs">{r.mensagens.join(" · ")}</span>}
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Indicador rotulo="Linhas" valor={r.totalLinhas.toLocaleString("pt-BR")} />
            <Indicador rotulo="Pessoas" valor={r.totalPessoas.toLocaleString("pt-BR")} />
            <Indicador rotulo="Total prêmio" valor={moeda(r.totalPremio)} />
            <Indicador rotulo="Total apurado" valor={moeda(r.totalApurado)} />
          </div>

          {r.totalLinhas === 0 ? (
            <p className="text-sm text-gray-500">
              A procedure não devolveu linhas para esses filtros. Confira o tipo de comissão e os tipos de pessoa: as
              metas do período podem ser de outro tipo.
            </p>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar por ID, pessoa ou KPI"
                  className={`${estiloInput} max-w-xs`}
                />
                <button
                  type="button"
                  onClick={() => exportar(r.linhas, periodoId ?? 0)}
                  className="ml-auto flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  <FiDownload size={14} /> Baixar Excel
                </button>
              </div>

              <div className="max-h-96 overflow-auto rounded-lg border border-gray-200">
                <table className="w-full border-collapse text-sm">
                  <thead className="sticky top-0 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-3 py-2 text-left">ID</th>
                      <th className="px-3 py-2 text-left">Pessoa</th>
                      <th className="px-3 py-2 text-left">Tipo</th>
                      <th className="px-3 py-2 text-left">KPI</th>
                      <th className="px-3 py-2 text-right">Apurado</th>
                      <th className="px-3 py-2 text-right">Meta</th>
                      <th className="px-3 py-2 text-right">% real.</th>
                      <th className="px-3 py-2 text-right">Prêmio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtradas.slice(0, LINHAS_NA_TELA).map((l, i) => (
                      <tr key={`${l.idMeta}-${l.idKpi}-${i}`} className="border-t border-gray-100 text-gray-700">
                        <td className="px-3 py-2 text-gray-400">{l.idPessoa}</td>
                        <td className="px-3 py-2 font-semibold">{l.pessoa ?? "-"}</td>
                        <td className="px-3 py-2">{l.tipoPessoa ?? "-"}</td>
                        <td className="px-3 py-2">{l.nomeKpi ?? l.descricaoKpi ?? "-"}</td>
                        <td className="px-3 py-2 text-right">{moeda(l.valorApurado)}</td>
                        <td className="px-3 py-2 text-right">{moeda(l.valorMeta)}</td>
                        <td className="px-3 py-2 text-right">{l.realizado.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%</td>
                        <td className="px-3 py-2 text-right font-bold">{moeda(l.valorPremio)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-500">
                Mostrando {Math.min(filtradas.length, LINHAS_NA_TELA).toLocaleString("pt-BR")} de{" "}
                {filtradas.length.toLocaleString("pt-BR")} linhas
                {r.truncado ? " (a API devolveu só as primeiras; os totais somam tudo)" : ""}. O Excel leva todas as linhas
                devolvidas.
              </p>
            </>
          )}
        </div>
      )}

      {confirmando && (
        <ModalConfirmarCalculoComissao
          periodoId={periodoId}
          situacaoDescricao={situacaoDescricao}
          tipoComissao={c.tipoComissao}
          idPessoas={c.idPessoas.trim()}
          tiposSelecionados={c.tipoPessoas.length}
          confirmando={c.executando === "calcular"}
          onConfirmar={confirmar}
          onCancelar={() => setConfirmando(false)}
        />
      )}
    </section>
  );
}
