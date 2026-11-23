import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiRefreshCw, FiSearch } from "react-icons/fi";
import dayjs from "dayjs";
import { NavegadorCompetencia } from "../components/ComponentesFarma/CampanhasMes/NavegadorCompetencia";
import {
  LinhaVisivel,
  TabelaResultadosValidacao,
} from "../components/ComponentesFarma/ValidacaoCampanhas/TabelaResultadosValidacao";
import { ControlesConferencia } from "../components/ComponentesFarma/ValidacaoCampanhas/ControlesConferencia";
import { PainelConferencia } from "../components/ComponentesFarma/InserirCampanhaDinamica/PainelConferencia";
import { TopCardTopic } from "../components/TopCardTopic";
import { useConferenciaValidacao } from "../hook/useConferenciaValidacao";
import { useValidacaoCampanhas } from "../hook/useValidacaoCampanhas";
import { ResultadoValidacao } from "../interfaces/ValidacaoCampanha";
import { formatCurrency } from "../utils/formateCurrency";
import { contarPorTipoPessoa, resumirResultados } from "../utils/validacaoCampanhas";

const plural = (n: number, singular: string, pluralTxt: string) => `${n} ${n === 1 ? singular : pluralTxt}`;

export function FarmaValidacaoCampanhas() {
  const navigate = useNavigate();
  const [competencia, setCompetencia] = useState(() => dayjs().format("YYYY-MM"));
  const [filtroTipo, setFiltroTipo] = useState("");
  const [busca, setBusca] = useState("");

  // DataCompetencia em tblCampanhaComercialResultado é sempre o último dia do mês
  const dataCompetencia = useMemo(() => dayjs(`${competencia}-01`).endOf("month").format("YYYY-MM-DD"), [competencia]);
  const h = useValidacaoCampanhas(dataCompetencia);
  const conf = useConferenciaValidacao(h.linhas, h.idCampanha);
  const [aba, setAba] = useState<"resultado" | "conferencia">("resultado");

  const resumo = useMemo(() => resumirResultados(h.linhas), [h.linhas]);
  const tipos = useMemo(() => contarPorTipoPessoa(h.linhas), [h.linhas]);

  const termo = busca.trim().toLowerCase();
  const linhasVisiveis: LinhaVisivel[] = useMemo(
    () =>
      h.linhas
        .map((linha, indice) => ({ indice, linha }))
        .filter(
          ({ linha }) =>
            (!filtroTipo || (linha.tipoPessoa ?? "Sem tipo") === filtroTipo) &&
            (!termo || String(linha.idPessoa ?? "").includes(termo) || (linha.nomePessoa ?? "").toLowerCase().includes(termo))
        ),
    [h.linhas, filtroTipo, termo]
  );

  function handleCompetenciaChange(nova: string) {
    setCompetencia(nova);
    setFiltroTipo("");
    setBusca("");
  }

  function handleEscolherCampanha(id: number) {
    h.escolherCampanha(id);
    setFiltroTipo("");
    setBusca("");
  }

  const pedidosDe = (r: ResultadoValidacao) =>
    r.idPessoa == null ? undefined : h.pedidosPorPessoa[`${r.idCampanha}|${r.idPessoa}`];

  const campanha = h.campanha;

  return (
    <div className="flex flex-col gap-6 p-10">
      <button
        type="button"
        onClick={() => navigate("/farma")}
        aria-label="Voltar para o início do Campanha Farma"
        className="-mb-2 flex w-fit items-center gap-2 text-sm text-other-muted transition-colors hover:text-other-text cursor-pointer"
      >
        <FiArrowLeft size={18} /> Voltar
      </button>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-other-text">Validação de campanhas</h1>
          <p className="text-sm text-other-muted">
            Resultado calculado de cada campanha da competência. Clique em uma pessoa para ver os pedidos que formaram o valor dela.
          </p>
        </div>
        <NavegadorCompetencia competencia={competencia} onChange={handleCompetenciaChange} />
      </header>

      {h.error && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
          {h.error}
          <button type="button" onClick={h.retry} className="font-semibold underline cursor-pointer">
            Tentar novamente
          </button>
        </div>
      )}

      <section className="flex flex-col gap-3 rounded-xl border border-other-border bg-other-card p-5">
        <label className="flex flex-col gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-other-muted">
          Campanha para validar
          <select
            value={h.idCampanha ?? ""}
            disabled={h.loading || h.campanhas.length === 0}
            onChange={(e) => handleEscolherCampanha(Number(e.target.value))}
            className="h-12 w-full rounded-lg border border-other-border bg-other-card px-4 text-sm font-normal normal-case tracking-normal
                       text-other-text outline-none focus:border-[#32307B] disabled:opacity-60 cursor-pointer"
          >
            {h.campanhas.length === 0 && (
              <option value="">{h.loading ? "Carregando..." : "Nenhuma campanha calculada nesta competência"}</option>
            )}
            {h.campanhas.map((c) => (
              <option key={c.idCampanha} value={c.idCampanha}>
                {c.idCampanha} · {c.descricao}
              </option>
            ))}
          </select>
        </label>
        {campanha && (
          <p className="text-sm text-other-muted">
            {campanha.dataInicioApuracao && campanha.dataFimApuracao
              ? `Apuração de ${dayjs(campanha.dataInicioApuracao).format("DD/MM/YYYY")} a ${dayjs(campanha.dataFimApuracao).format("DD/MM/YYYY")}`
              : "Apuração sem período definido"}
            {campanha.descricaoTipoCalculo ? ` · Cálculo: ${campanha.descricaoTipoCalculo}` : ""}
            {` · ${plural(h.campanhas.length, "campanha calculada", "campanhas calculadas")} na competência`}
          </p>
        )}
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <TopCardTopic
          title="Campanha"
          value={campanha?.idCampanha ?? 0}
          displayValue={campanha ? `#${campanha.idCampanha}` : "—"}
          subtitles={campanha?.descricao ?? "Nenhuma selecionada"}
        />
        <TopCardTopic title="Pessoas" value={resumo.pessoas} format="numero" subtitles="Com resultado nesta campanha" />
        <TopCardTopic
          title="Valor apurado"
          value={resumo.valorApurado}
          displayValue={formatCurrency(resumo.valorApurado)}
          subtitles="Vendedores, grandes contas e televendas"
        />
        <TopCardTopic
          title="Premiação total"
          value={resumo.premiacao}
          displayValue={formatCurrency(resumo.premiacao)}
          subtitles={resumo.ultimoCalculo ? `Calculada em ${dayjs(resumo.ultimoCalculo).format("DD/MM/YYYY HH:mm")}` : "Sem cálculo"}
        />
      </div>

      <div className="-mb-3 flex gap-2">
        {(
          [
            { id: "resultado", rotulo: "Resultado do sistema", marca: 0 },
            { id: "conferencia", rotulo: "Conferir com planilha", marca: conf.conferencia.resumo?.divergentes ?? 0 },
          ] as const
        ).map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => setAba(a.id)}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors cursor-pointer ${
              aba === a.id ? "bg-[#32307B] text-white" : "bg-indigo-50 text-[#32307B] hover:bg-indigo-100"
            }`}
          >
            {a.rotulo}
            {a.marca > 0 && (
              <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white" title="Divergências na conferência">
                {a.marca}
              </span>
            )}
          </button>
        ))}
      </div>

      {aba === "conferencia" && (
        <section className="flex flex-col gap-4 rounded-xl border border-other-border bg-other-card p-5">
          <ControlesConferencia
            presentes={conf.presentes}
            tiposIncluidos={conf.tiposIncluidos}
            onAlternarTipo={conf.alternarTipo}
            onMarcarTodos={conf.marcarTodos}
            onDesmarcarTodos={conf.desmarcarTodos}
            tipoPremio={conf.tipoPremio}
            tipoPremioSugerido={conf.tipoPremioSugerido}
            tipoPremioManual={conf.tipoPremioManual}
            onEscolherTipoPremio={conf.escolherTipoPremio}
          />
          <PainelConferencia
            conferencia={conf.conferencia}
            temRetorno={conf.temRetorno && conf.tiposIncluidos.length > 0}
            retornoDesatualizado={false}
            formatoPremio={conf.tipoPremio === "pontos" ? "pontos" : "moeda"}
            rotuloPremio={conf.rotuloPremio}
            textoSemRetorno={
              conf.temRetorno
                ? "Marque ao menos um tipo de pessoa para poder comparar."
                : "Escolha uma campanha com resultado calculado para poder comparar com a planilha."
            }
          />
        </section>
      )}

      {aba === "resultado" && (
      <section className="flex flex-col overflow-hidden rounded-xl border border-other-border bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div className="flex flex-wrap items-center gap-2">
            {[{ tipo: "", quantidade: resumo.pessoas, rotulo: "Todos" }, ...tipos.map((t) => ({ ...t, rotulo: t.tipo }))].map((chip) => {
              const ativo = filtroTipo === chip.tipo;
              return (
                <button
                  key={chip.rotulo}
                  type="button"
                  onClick={() => setFiltroTipo(chip.tipo)}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors cursor-pointer ${
                    ativo ? "bg-[#32307B] text-white" : "bg-indigo-50 text-[#32307B] hover:bg-indigo-100"
                  }`}
                >
                  {chip.rotulo}
                  <span className={`text-xs ${ativo ? "text-white/70" : "text-[#32307B]/60"}`}>{chip.quantidade}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <label className="flex h-11 w-72 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 focus-within:border-[#32307B]">
              <FiSearch size={15} className="text-gray-400" />
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por ID ou nome"
                className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
              />
            </label>
            <button
              type="button"
              onClick={h.retry}
              disabled={h.loading}
              title="Recarregar"
              className="flex h-11 w-11 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50
                         disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
            >
              <FiRefreshCw size={15} />
            </button>
          </div>
        </div>

        <TabelaResultadosValidacao
          linhas={linhasVisiveis}
          loading={h.loading}
          mensagemVazio={
            termo || filtroTipo ? "Nenhuma pessoa encontrada para esse filtro." : "Nenhum resultado calculado nesta competência."
          }
          abertaKey={h.abertaKey}
          onAlternarLinha={h.alternarLinha}
          pedidosDe={pedidosDe}
          onTentarPedidosDeNovo={h.tentarPedidosDeNovo}
        />
      </section>
      )}
    </div>
  );
}
