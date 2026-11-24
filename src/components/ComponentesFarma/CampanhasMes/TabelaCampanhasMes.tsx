import { ReactNode } from "react";
import dayjs from "dayjs";
import { CampanhaComercial } from "../../../interfaces/CampanhaComercial";
import { formatCurrency } from "../../../utils/formateCurrency";
import {
  descreverPeriodo,
  ehCancelada,
  podeCalcular,
  rotuloSituacao,
  tipoDaSituacao,
  TipoSituacao,
} from "../../../utils/resumoCampanhasComerciais";
import { TableComponent, TableRow } from "../../ContentGeneral/SharedGeneral/TableComponent";

const CABECALHOS = [
  { id: 0, name: "ID" },
  { id: 1, name: "Campanha" },
  { id: 2, name: "Situação" },
  { id: 3, name: "Período de apuração" },
  { id: 4, name: "Apuração" },
  { id: 5, name: "Cálculo" },
  { id: 6, name: "Objetivo total" },
  { id: 7, name: "Prêmio total" },
  { id: 8, name: "Tipo de meta" },
];

const ESTILO_BADGE: Record<TipoSituacao, { badge: string; ponto: string }> = {
  cancelada: { badge: "bg-gray-100 text-gray-500", ponto: "bg-gray-400" },
  calculando: { badge: "bg-orange-100 text-orange-700", ponto: "bg-orange-500" },
  outra: { badge: "bg-indigo-50 text-[#32307B]", ponto: "bg-[#32307B]" },
};

const estiloCheckbox = "h-4 w-4 cursor-pointer accent-[#32307B] disabled:cursor-not-allowed disabled:opacity-40";

function BadgeSituacao({ descricao }: { descricao: string | null }) {
  const estilo = ESTILO_BADGE[tipoDaSituacao(descricao)];
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${estilo.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${estilo.ponto}`} />
      {rotuloSituacao(descricao)}
    </span>
  );
}

interface TabelaCampanhasMesProps {
  campanhas: CampanhaComercial[];
  loading: boolean;
  mensagemVazio: string;
  /** Campanha aberta para edição (linha expandida). */
  editandoId: number | null;
  onClickLinha: (campanha: CampanhaComercial) => void;
  /** Conteúdo exibido embaixo da linha aberta (resultado + formulário de edição). */
  renderEdicao: (campanha: CampanhaComercial) => ReactNode;
  /** IDs marcados para cálculo. */
  selecionadasIds: number[];
  onAlternarSelecao: (id: number) => void;
  /** Marca (true) ou desmarca (false) todas as campanhas selecionáveis que estão na tabela. */
  onAlternarTodas: (ids: number[], marcar: boolean) => void;
  /** Trava a seleção (ex.: enquanto o cálculo está rodando). */
  selecaoTravada: boolean;
}

export function TabelaCampanhasMes({
  campanhas,
  loading,
  mensagemVazio,
  editandoId,
  onClickLinha,
  renderEdicao,
  selecionadasIds,
  onAlternarSelecao,
  onAlternarTodas,
  selecaoTravada,
}: TabelaCampanhasMesProps) {
  const selecionaveis = campanhas.filter(podeCalcular).map((c) => c.idCampanhaComercial);
  const todasMarcadas = selecionaveis.length > 0 && selecionaveis.every((id) => selecionadasIds.includes(id));

  const linhas: TableRow[] = campanhas.map((c) => {
    const periodo = descreverPeriodo(c);
    // campanha cancelada fica esmaecida
    const celula = (conteudo: ReactNode) => <div className={ehCancelada(c) ? "opacity-50" : ""}>{conteudo}</div>;
    const selecionavel = podeCalcular(c);

    return {
      key: c.idCampanhaComercial,
      celulaInicial: (
        <input
          type="checkbox"
          checked={selecionadasIds.includes(c.idCampanhaComercial)}
          disabled={!selecionavel || selecaoTravada}
          onChange={() => onAlternarSelecao(c.idCampanhaComercial)}
          title={selecionavel ? "Selecionar para calcular" : "Só campanhas Abertas ou Calculando podem ser calculadas"}
          aria-label={`Selecionar a campanha ${c.idCampanhaComercial} para calcular`}
          className={estiloCheckbox}
        />
      ),
      cells: [
        celula(<span className="font-semibold text-gray-400">{c.idCampanhaComercial}</span>),
        celula(
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900">{c.descricaoCampanha}</span>
            <span className="text-xs text-gray-400">
              {c.descricaoTipoValor ?? "—"}
              {c.ultimoCalculoEm && (
                <span className="font-semibold text-emerald-600">
                  {" "}
                  · calculada em {dayjs(c.ultimoCalculoEm).format("DD/MM HH:mm")}
                </span>
              )}
            </span>
          </div>
        ),
        celula(<BadgeSituacao descricao={c.descricaoSituacao} />),
        celula(
          periodo ? (
            <div className="flex flex-col">
              <span>{periodo.intervalo}</span>
              <span className="text-xs text-gray-400">{periodo.dias}</span>
            </div>
          ) : (
            <span className="text-gray-400">Sem período</span>
          )
        ),
        celula(c.descricaoTipoApuracao ?? "—"),
        celula(c.descricaoTipoCalculo ?? "—"),
        celula(<span className="font-semibold text-gray-900">{formatCurrency(c.objetivoTotal)}</span>),
        celula(<span className="font-semibold text-gray-900">{formatCurrency(c.valorTotalPremiacao)}</span>),
        celula(c.descricaoTipoMeta ?? "—"),
      ],
      conteudoExpandido: renderEdicao(c),
    };
  });

  return (
    <div className="overflow-x-auto">
      <TableComponent
        listHeaders={CABECALHOS}
        cabecalhoInicial={
          <input
            type="checkbox"
            checked={todasMarcadas}
            disabled={selecionaveis.length === 0 || selecaoTravada}
            onChange={() => onAlternarTodas(selecionaveis, !todasMarcadas)}
            title="Selecionar todas as campanhas que podem ser calculadas"
            aria-label="Selecionar todas as campanhas que podem ser calculadas"
            className={estiloCheckbox}
          />
        }
        rows={linhas}
        loading={loading}
        mensagemVazio={mensagemVazio}
        linhaExpandidaKey={editandoId}
        onClickLinha={(key) => {
          const campanha = campanhas.find((c) => c.idCampanhaComercial === key);
          if (campanha) onClickLinha(campanha);
        }}
      />
    </div>
  );
}
