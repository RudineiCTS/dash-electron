import { ReactNode } from "react";
import dayjs from "dayjs";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import { PedidosCarregados, ResultadoValidacao } from "../../../interfaces/ValidacaoCampanha";
import { formatCurrency } from "../../../utils/formateCurrency";
import { formatPercent } from "../../../utils/formatPercent";
import { temDetalhePedidos } from "../../../utils/validacaoCampanhas";
import { TableComponent, TableRow } from "../../ContentGeneral/SharedGeneral/TableComponent";
import { DetalhePessoaValidacao } from "./DetalhePessoaValidacao";

const CABECALHOS = [
  { id: 0, name: "Tipo" },
  { id: 1, name: "ID" },
  { id: 2, name: "Nome" },
  { id: 3, name: "Supervisor" },
  { id: 4, name: "Gerente" },
  { id: 5, name: "Objetivo" },
  { id: 6, name: "Valor apurado" },
  { id: 7, name: "% realizado" },
  { id: 8, name: "Colocação" },
  { id: 9, name: "Prêmio pontos" },
  { id: 10, name: "Prêmio valor" },
  { id: 11, name: "Calculado em" },
];

export interface LinhaVisivel {
  /** Posição da linha na lista completa da campanha (é a chave da linha). */
  indice: number;
  linha: ResultadoValidacao;
}

interface TabelaResultadosValidacaoProps {
  linhas: LinhaVisivel[];
  loading: boolean;
  mensagemVazio: string;
  /** Chave (posição) da linha aberta. */
  abertaKey: string | null;
  onAlternarLinha: (indice: number) => void;
  pedidosDe: (linha: ResultadoValidacao) => PedidosCarregados | undefined;
  onTentarPedidosDeNovo: (linha: ResultadoValidacao) => void;
}

const direita = (conteudo: ReactNode) => <span className="block text-right">{conteudo}</span>;

export function TabelaResultadosValidacao({
  linhas,
  loading,
  mensagemVazio,
  abertaKey,
  onAlternarLinha,
  pedidosDe,
  onTentarPedidosDeNovo,
}: TabelaResultadosValidacaoProps) {
  const rows: TableRow[] = linhas.map(({ indice, linha: r }) => {
    const aberta = abertaKey === String(indice);
    const comPedidos = temDetalhePedidos(r);

    return {
      key: indice,
      celulaInicial: (
        <button
          type="button"
          aria-label={aberta ? "Fechar o detalhe" : "Abrir o detalhe"}
          aria-expanded={aberta}
          onClick={() => onAlternarLinha(indice)}
          className="flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-[#32307B] cursor-pointer"
        >
          {aberta ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
        </button>
      ),
      cells: [
        <span
          key="t"
          className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
            comPedidos ? "bg-indigo-50 text-[#32307B]" : "bg-gray-100 text-gray-500"
          }`}
        >
          {r.tipoPessoa ?? "—"}
        </span>,
        <span key="i" className="font-semibold text-gray-400">{r.idPessoa ?? "—"}</span>,
        <span key="n" className="font-semibold text-gray-900">{r.nomePessoa ?? "—"}</span>,
        r.nomeSupervisor ?? "—",
        r.nomeGerente ?? "—",
        direita(formatCurrency(r.objetivo)),
        direita(<span className="font-semibold text-gray-900">{formatCurrency(r.valorApurado)}</span>),
        direita(formatPercent(r.percentualRealizado)),
        direita(r.colocacao ?? "—"),
        direita(r.premiacaoPontos ?? "—"),
        direita(<span className="font-semibold text-gray-900">{formatCurrency(r.premiacaoValor)}</span>),
        <span key="d" className="whitespace-nowrap text-xs text-gray-500">
          {r.dataCalculo ? dayjs(r.dataCalculo).format("DD/MM/YYYY HH:mm") : "—"}
        </span>,
      ],
      conteudoExpandido: (
        <DetalhePessoaValidacao
          linha={r}
          carregado={pedidosDe(r)}
          onTentarDeNovo={() => onTentarPedidosDeNovo(r)}
        />
      ),
    };
  });

  return (
    <div className="overflow-x-auto">
      <TableComponent
        listHeaders={CABECALHOS}
        rows={rows}
        loading={loading}
        mensagemVazio={mensagemVazio}
        linhaExpandidaKey={abertaKey === null ? null : Number(abertaKey)}
        onClickLinha={(key) => onAlternarLinha(Number(key))}
      />
    </div>
  );
}
