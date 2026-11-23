import { useState } from "react";
import dayjs from "dayjs";
import { PedidosCarregados, ResultadoValidacao } from "../../../interfaces/ValidacaoCampanha";
import { formatCurrency } from "../../../utils/formateCurrency";
import {
  conferirValor,
  resumirPedidos,
  rotuloOrigem,
  temDetalhePedidos,
} from "../../../utils/validacaoCampanhas";
import { TableComponent, TableRow } from "../../ContentGeneral/SharedGeneral/TableComponent";

const PEDIDOS_POR_PAGINA = 100;

const CABECALHOS = [
  { id: 0, name: "Pedido" },
  { id: 1, name: "Faturamento" },
  { id: 2, name: "Cliente" },
  { id: 3, name: "Produto" },
  { id: 4, name: "Operação" },
  { id: 5, name: "Origem" },
  { id: 6, name: "Qtde" },
  { id: 7, name: "Valor" },
  { id: 8, name: "Crédito" },
  { id: 9, name: "No apurado" },
];

interface DetalhePessoaValidacaoProps {
  linha: ResultadoValidacao;
  /** Pedidos da pessoa (só existem para quem tem detalhe); undefined = ainda não pedidos. */
  carregado: PedidosCarregados | undefined;
  onTentarDeNovo: () => void;
}

function Pilula({ children, tom = "neutro" }: { children: React.ReactNode; tom?: "neutro" | "ok" | "alerta" | "erro" }) {
  const estilo = {
    neutro: "bg-gray-100 text-gray-600",
    ok: "bg-emerald-100 text-emerald-700",
    alerta: "bg-amber-100 text-amber-700",
    erro: "bg-red-100 text-red-700",
  }[tom];
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${estilo}`}>{children}</span>;
}

/** Conteúdo da linha aberta: log do cálculo e, para vendedor/grandes contas/televendas, os pedidos que formaram o valor. */
export function DetalhePessoaValidacao({ linha, carregado, onTentarDeNovo }: DetalhePessoaValidacaoProps) {
  const [limite, setLimite] = useState(PEDIDOS_POR_PAGINA);
  const pedidos = carregado?.pedidos ?? [];
  const resumo = resumirPedidos(pedidos);
  const conferencia = conferirValor(linha.valorApurado, resumo.totalConsiderado);

  const linhasTabela: TableRow[] = pedidos.slice(0, limite).map((p, i) => ({
    key: i,
    cells: [
      <span key="p" className="font-semibold text-gray-900">{p.idPedido ?? "—"}</span>,
      p.dataFaturamento ? dayjs(p.dataFaturamento).format("DD/MM/YYYY") : "—",
      <div key="c" className="flex flex-col">
        <span className="text-gray-900">{p.nomeCliente ?? "—"}</span>
        <span className="text-xs text-gray-400">{p.idCliente ?? ""}</span>
      </div>,
      <div key="pr" className="flex flex-col">
        <span className="text-gray-900">{p.descricaoProduto ?? "—"}</span>
        <span className="text-xs text-gray-400">
          {p.idProduto ?? ""}
          {p.nomeFabricante ? ` · ${p.nomeFabricante}` : ""}
        </span>
      </div>,
      p.idOperacao ?? "—",
      rotuloOrigem(p.idOrigem),
      <span key="q" className="block text-right">{p.quantidade ?? "—"}</span>,
      <span key="v" className={`block text-right font-semibold ${p.valorCampanha < 0 ? "text-red-600" : "text-gray-900"}`}>
        {formatCurrency(p.valorCampanha)}
      </span>,
      p.creditadoPorExclusivo ? (
        <span
          key="x"
          title={`Venda de ${p.nomeVendedorVenda ?? p.idVendedorVenda ?? "outro vendedor"}, creditada a esta pessoa por ser o vendedor exclusivo`}
          className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-[#32307B]"
        >
          Exclusivo
        </span>
      ) : (
        <span key="x" className="text-xs text-gray-400">Venda própria</span>
      ),
      p.consideradoNoApurado ? (
        <span key="n" className="text-xs font-semibold text-emerald-600">Sim</span>
      ) : (
        <span key="n" className="text-xs font-semibold text-red-500" title="Passou nos filtros da campanha, mas o vendedor creditado não está na base de vendedores atuais">
          Não
        </span>
      ),
    ],
  }));

  return (
    <div className="flex flex-col gap-4 py-2">
      {linha.logCalculo && (
        <p className="rounded-lg bg-gray-50 px-4 py-3 text-xs text-gray-600">
          <span className="font-semibold text-gray-700">Log do cálculo: </span>
          {linha.logCalculo}
        </p>
      )}

      {!temDetalhePedidos(linha) ? (
        <p className="rounded-lg border border-dashed border-gray-200 px-4 py-3 text-sm text-gray-500">
          Os pedidos aparecem para vendedor, grandes contas e televendas. Supervisor, gerente e pessoa interna são a soma das
          pessoas da equipe, então não têm pedidos próprios.
        </p>
      ) : !carregado || carregado.loading ? (
        <p className="px-1 py-3 text-sm text-gray-400">Carregando os pedidos...</p>
      ) : carregado.erro ? (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
          {carregado.erro}
          <button type="button" onClick={onTentarDeNovo} className="font-semibold underline cursor-pointer">
            Tentar novamente
          </button>
        </div>
      ) : pedidos.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-200 px-4 py-3 text-sm text-gray-500">
          Nenhum pedido gravado para esta pessoa nesta campanha. Os pedidos só são gravados em campanhas de Vendas calculadas
          depois da atualização da procedure; recalcule a campanha para gerá-los.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <Pilula>
              {resumo.linhas} {resumo.linhas === 1 ? "linha" : "linhas"} · {resumo.pedidos} {resumo.pedidos === 1 ? "pedido" : "pedidos"}
            </Pilula>
            <Pilula>Soma dos pedidos considerados: {formatCurrency(resumo.totalConsiderado)}</Pilula>
            <Pilula>Valor apurado: {formatCurrency(linha.valorApurado)}</Pilula>
            {conferencia.confere ? (
              <Pilula tom="ok">Confere com o apurado</Pilula>
            ) : (
              <Pilula tom="erro">
                Diferença de {formatCurrency(conferencia.diferenca)} entre o apurado e os pedidos
              </Pilula>
            )}
            {resumo.linhasForaDoApurado > 0 && (
              <Pilula tom="alerta">
                {resumo.linhasForaDoApurado} {resumo.linhasForaDoApurado === 1 ? "linha fora" : "linhas fora"} do apurado (
                {formatCurrency(resumo.totalForaDoApurado)})
              </Pilula>
            )}
            {resumo.linhasPorExclusivo > 0 && (
              <Pilula>
                {resumo.linhasPorExclusivo} por exclusivo
              </Pilula>
            )}
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-100 bg-white">
            <TableComponent listHeaders={CABECALHOS} rows={linhasTabela} />
          </div>

          {pedidos.length > limite && (
            <button
              type="button"
              onClick={() => setLimite((l) => l + PEDIDOS_POR_PAGINA)}
              className="h-10 w-fit rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-[#32307B] hover:bg-indigo-50 cursor-pointer"
            >
              Mostrar mais {Math.min(PEDIDOS_POR_PAGINA, pedidos.length - limite)} (de {pedidos.length - limite} restantes)
            </button>
          )}
        </>
      )}
    </div>
  );
}
