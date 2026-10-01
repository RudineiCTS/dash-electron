import { ReactNode, useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { useKpiVinculosDetalhe } from "../../../hook/useKpiVinculosDetalhe";
import { KpiVinculosDetalhe } from "../../../interfaces/KpiVinculo";

interface SecaoConfig {
    chave: string;
    titulo: string;
    tabela: string;
    colunas: string[];
    itens: { valores: ReactNode[]; contem: string | null }[];
}

function Pill({ texto }: { texto: string | null }) {
    if (!texto) return <span className="text-gray-400">-</span>;
    const positivo = texto.trim().toLowerCase() === "sim";
    const negativo = texto.trim().toLowerCase() === "não";
    if (!positivo && !negativo) return <span>{texto}</span>;
    return (
        <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                positivo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
        >
            {texto}
        </span>
    );
}

function montarSecoes(detalhe: KpiVinculosDetalhe): SecaoConfig[] {
    return [
        {
            chave: "fabricante",
            titulo: "Fabricante",
            tabela: detalhe.fabricante[0]?.tabelaOrigem ?? "tblComissaoVendasKPIFabricante",
            colunas: ["IDPessoaFabricante", "Nome", "Contem"],
            itens: detalhe.fabricante.map((i) => ({ valores: [i.id, i.descricao ?? "-"], contem: i.contem })),
        },
        {
            chave: "cliente",
            titulo: "Cliente",
            tabela: detalhe.cliente[0]?.tabelaOrigem ?? "tblComissaoVendasKPICliente",
            colunas: ["IDPessoaCliente", "NomeCliente", "DescBandeira", "Contem"],
            itens: detalhe.cliente.map((i) => ({
                valores: [i.idPessoaCliente, i.nomeCliente ?? "-", i.descBandeira ?? "-"],
                contem: i.contem,
            })),
        },
        {
            chave: "bandeira",
            titulo: "Bandeira",
            tabela: detalhe.bandeira[0]?.tabelaOrigem ?? "tblComissaoVendasKPIBandeira",
            colunas: ["IDPessoaBandeira", "DescBandeira", "Contem"],
            itens: detalhe.bandeira.map((i) => ({ valores: [i.id, i.descricao ?? "-"], contem: i.contem })),
        },
        {
            chave: "setor",
            titulo: "Setor",
            tabela: detalhe.setor[0]?.tabelaOrigem ?? "tblComissaoVendasKPISetor",
            colunas: ["IDSetor", "DescSetor", "Contem"],
            itens: detalhe.setor.map((i) => ({ valores: [i.id, i.descricao ?? "-"], contem: i.contem })),
        },
        {
            chave: "vendedorAtual",
            titulo: "Vendedor atual",
            tabela: detalhe.vendedorAtual[0]?.tabelaOrigem ?? "tblComissaoVendasKPIVendedorAtual",
            colunas: ["IDComissaoVendasKPI", "IDVendedorAtual", "Contem"],
            itens: detalhe.vendedorAtual.map((i) => ({
                valores: [i.idComissaoVendasKpi, i.idVendedorAtual ?? "-"],
                contem: i.contem,
            })),
        },
        {
            chave: "condicao",
            titulo: "Condição",
            tabela: detalhe.condicao[0]?.tabelaOrigem ?? "tblComissaoVendasKPICondicao",
            colunas: ["IDCondicao", "DescCondicao", "Contem"],
            itens: detalhe.condicao.map((i) => ({ valores: [i.id, i.descricao ?? "-"], contem: i.contem })),
        },
        {
            chave: "produto",
            titulo: "Produto",
            tabela: detalhe.produto[0]?.tabelaOrigem ?? "tblComissaoVendasKPIProduto",
            colunas: ["IDComissaoVendasKPI", "IDProduto", "DescProduto", "Contem"],
            itens: detalhe.produto.map((i) => ({
                valores: [i.idComissaoVendasKpi, i.idProduto ?? "-", i.descProduto ?? "-"],
                contem: i.contem,
            })),
        },
        {
            chave: "grupoProdutos",
            titulo: "Grupo de produtos",
            tabela: detalhe.grupoProdutos[0]?.tabelaOrigem ?? "tblGrupoProdutosLoreal",
            colunas: ["IDProduto", "CodigoBarras", "DescProduto", "DescGrupo", "Contem"],
            itens: detalhe.grupoProdutos.map((i) => ({
                valores: [i.idProduto, i.codigoBarras ?? "-", i.descProduto ?? "-", i.descGrupo ?? "-"],
                contem: i.contem,
            })),
        },
        {
            chave: "regraValidacaoFaixa",
            titulo: "Regra validação Faixa",
            tabela: detalhe.regraValidacaoFaixa[0]?.tabelaOrigem ?? "tblComissaoVendasKPIRegraValidacaoFaixa",
            colunas: ["IDRegraValidacao", "IDKPIAValidar", "DescricaoKPI", "ValorInicio", "ValorFim", "Percentual"],
            itens: detalhe.regraValidacaoFaixa.map((i) => ({
                valores: [
                    i.idComissaoVendasKpiRegraValidacao,
                    i.idComissaoVendasKpiAValidar,
                    i.descricaoKpi ?? "-",
                    i.valorInicio,
                    i.valorFim,
                    i.percentual,
                ],
                contem: null,
            })),
        },
        {
            chave: "fabricanteCalculoPremiacao",
            titulo: "Fabricante Calculo Premiação",
            tabela: detalhe.fabricanteCalculoPremiacao[0]?.tabelaOrigem ?? "tblComissaoVendasKPIFabricanteCalculoValorPremiacao",
            colunas: ["IDPessoaFabricante", "Nome", "Contem"],
            itens: detalhe.fabricanteCalculoPremiacao.map((i) => ({
                valores: [i.id, i.descricao ?? "-"],
                contem: i.contem,
            })),
        },
        {
            chave: "faixaPremiacao",
            titulo: "Faixa Premiação",
            tabela: detalhe.faixaPremiacao[0]?.tabelaOrigem ?? "tblComissaoVendasKPIFaixaPremiacao",
            colunas: ["IDFaixaPremiacao", "ValorInicio", "ValorFim", "ValorPremio", "Percentual", "Curva"],
            itens: detalhe.faixaPremiacao.map((i) => ({
                valores: [
                    i.idComissaoVendasKpiFaixaPremiacao,
                    i.valorInicio ?? "-",
                    i.valorFim ?? "-",
                    i.valorPremio ?? "-",
                    i.percentual ?? "-",
                    i.curva ?? "-",
                ],
                contem: null,
            })),
        },
        {
            chave: "operacao",
            titulo: "Operação",
            tabela: detalhe.operacao[0]?.tabelaOrigem ?? "tblComissaoVendasKPIOperacao",
            colunas: ["IDOperacao", "DescOperacao", "Contem"],
            itens: detalhe.operacao.map((i) => ({ valores: [i.id, i.descricao ?? "-"], contem: i.contem })),
        },
        {
            chave: "origem",
            titulo: "Origem",
            tabela: detalhe.origem[0]?.tabelaOrigem ?? "tblComissaoVendasKPIOrigem",
            colunas: ["IDOrigem", "DescOrigem", "Contem"],
            itens: detalhe.origem.map((i) => ({ valores: [i.id, i.descricao ?? "-"], contem: i.contem })),
        },
        {
            chave: "produtoLinha",
            titulo: "Linha de Produto",
            tabela: detalhe.produtoLinha[0]?.tabelaOrigem ?? "tblComissaoVendasKPIProdutoILinha",
            colunas: ["IDProdutoLinha", "DescProdutoLinha", "Contem"],
            itens: detalhe.produtoLinha.map((i) => ({ valores: [i.id, i.descricao ?? "-"], contem: i.contem })),
        },
        {
            chave: "regraValidacao",
            titulo: "Regra Validação",
            tabela: detalhe.regraValidacao[0]?.tabelaOrigem ?? "tblComissaoVendasKPIRegraValidacao",
            colunas: ["IDRegraValidacao", "IDKPIAValidar", "DescricaoKPI", "ResultadoMinimo", "ResultadoMaximo"],
            itens: detalhe.regraValidacao.map((i) => ({
                valores: [
                    i.idComissaoVendasKpiRegraValidacao,
                    i.idComissaoVendasKpiAValidar,
                    i.descricaoKpi ?? "-",
                    i.resultadoMinimo,
                    i.resultadoMaximo,
                ],
                contem: null,
            })),
        },
    ];
}

export const SIDEBAR_PARA_SECAO_KPI: Record<string, string> = {
    Fabricante: "fabricante",
    Cliente: "cliente",
    Bandeira: "bandeira",
    Setor: "setor",
    "Gerente Atual": "vendedorAtual",
    Condição: "condicao",
    Produtos: "produto",
    "Grupo de produtos": "grupoProdutos",
    "Regra validação Faixa": "regraValidacaoFaixa",
    "Fabricante Calculo Premiação": "fabricanteCalculoPremiacao",
    "Faixa Premiação": "faixaPremiacao",
    Operação: "operacao",
    Origem: "origem",
    "Linha de Produto": "produtoLinha",
    "Regra Validação": "regraValidacao",
};

interface ModalDetalheKpiProps {
    aberto: boolean;
    idComissaoVendasKpi: number | null;
    secaoInicial?: string | null;
    onFechar: () => void;
}

export function ModalDetalheKpi({ aberto, idComissaoVendasKpi, secaoInicial, onFechar }: ModalDetalheKpiProps) {
    const { detalhe, loading, error } = useKpiVinculosDetalhe(aberto ? idComissaoVendasKpi : null);
    const [filtro, setFiltro] = useState<string>(secaoInicial ?? "todas");
    const [buscaCliente, setBuscaCliente] = useState("");

    useEffect(() => {
        if (aberto) setFiltro(secaoInicial ?? "todas");
    }, [aberto, secaoInicial]);

    useEffect(() => {
        if (aberto) setBuscaCliente("");
    }, [aberto]);

    const secoes = useMemo(() => (detalhe ? montarSecoes(detalhe) : []), [detalhe]);
    const configuradas = secoes.filter((s) => s.itens.length > 0).length;
    const totalRegistros = secoes.reduce((acc, s) => acc + s.itens.length, 0);
    const secoesExibidas = filtro === "todas" ? secoes : secoes.filter((s) => s.chave === filtro);

    if (!aberto) return null;

    function handleCopiarDados() {
        if (!detalhe) return;
        navigator.clipboard.writeText(JSON.stringify(detalhe, null, 2));
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
            <div className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-xl">
                <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 pt-5 pb-4">
                    <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
                            Configuração do KPI · tblComissaoVendasKPI
                        </span>
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg font-bold text-gray-900">KPI #{idComissaoVendasKpi}</h2>
                            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                                {configuradas} de {secoes.length} campos configurados
                            </span>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onFechar}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="flex flex-wrap items-end gap-3 border-b border-gray-100 px-6 py-4">
                    <label className="flex flex-col gap-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
                            Campo de configuração
                        </span>
                        <select
                            value={filtro}
                            onChange={(e) => setFiltro(e.target.value)}
                            className="h-9 rounded-lg border border-gray-200 px-3 text-sm font-semibold text-gray-800 outline-none"
                        >
                            <option value="todas">Todas as tabelas ({secoes.length})</option>
                            {secoes.map((s) => (
                                <option key={s.chave} value={s.chave}>
                                    {s.titulo} ({s.itens.length})
                                </option>
                            ))}
                        </select>
                    </label>
                    <div className="ml-auto flex items-center gap-2 text-xs font-semibold">
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-green-700">Sim inclui</span>
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-red-700">Não exclui</span>
                    </div>
                </div>

                <div className="flex flex-col gap-6 overflow-y-auto px-6 py-6">
                    {loading ? (
                        <p className="py-8 text-center text-sm text-gray-400">Carregando vínculos do KPI...</p>
                    ) : error ? (
                        <p className="py-8 text-center text-sm text-red-500">{error}</p>
                    ) : (
                        secoesExibidas.map((secao) => {
                            const ehCliente = secao.chave === "cliente";
                            const termoCliente = buscaCliente.trim().toLowerCase();
                            const itensExibidos =
                                ehCliente && filtro === "cliente" && termoCliente
                                    ? secao.itens.filter(
                                          (item) =>
                                              String(item.valores[0] ?? "").toLowerCase().includes(termoCliente) ||
                                              String(item.valores[1] ?? "").toLowerCase().includes(termoCliente)
                                      )
                                    : secao.itens;

                            return (
                            <div key={secao.chave} className=" rounded-xl border border-gray-200 shadow-sm">
                                <div className="flex items-center justify-between gap-3 bg-gray-50 px-5 py-3.5">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-gray-800">{secao.titulo}</span>
                                        <span
                                            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                                secao.itens.length > 0
                                                    ? "bg-indigo-50 text-indigo-700"
                                                    : "bg-gray-200 text-gray-500"
                                            }`}
                                        >
                                            {secao.itens.length > 0 ? `${itensExibidos.length} registro(s)` : "vazio"}
                                        </span>
                                    </div>
                                    <span className="text-xs text-gray-400">{secao.tabela}</span>
                                </div>
                                {ehCliente && filtro === "cliente" && secao.itens.length > 0 && (
                                    <div className="border-b border-gray-100 bg-white px-5 py-3">
                                        <label className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
                                            <Search size={15} className="shrink-0 text-gray-400" />
                                            <input
                                                type="text"
                                                value={buscaCliente}
                                                onChange={(e) => setBuscaCliente(e.target.value)}
                                                placeholder="Filtrar por ID ou nome do cliente..."
                                                className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
                                            />
                                        </label>
                                    </div>
                                )}
                                {secao.itens.length === 0 ? (
                                    <p className="px-5 py-5 text-sm italic text-gray-400">
                                        Nenhum registro para o KPI #{idComissaoVendasKpi} — sem restrição neste campo.
                                    </p>
                                ) : itensExibidos.length === 0 ? (
                                    <p className="px-5 py-5 text-sm italic text-gray-400">
                                        Nenhum cliente encontrado para essa busca.
                                    </p>
                                ) : (
                                    <table className="w-full border-collapse text-sm">
                                        <thead>
                                            <tr className="bg-gray-50/60 text-xs font-bold uppercase tracking-wide text-gray-400">
                                                <th className="px-4 py-2 text-left">#</th>
                                                {secao.colunas.map((c) => (
                                                    <th key={c} className="px-4 py-2 text-left">
                                                        {c}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {itensExibidos.map((item, index) => (
                                                <tr key={index} className="border-t border-gray-100">
                                                    <td className="px-4 py-2.5 text-gray-500">{index + 1}</td>
                                                    {item.valores.map((valor, i) => (
                                                        <td key={i} className="px-4 py-2.5 text-gray-700">
                                                            {valor}
                                                        </td>
                                                    ))}
                                                    {secao.colunas[secao.colunas.length - 1] === "Contem" && (
                                                        <td className="px-4 py-2.5">
                                                            <Pill texto={item.contem} />
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                            );
                        })
                    )}
                </div>

                <div className="flex items-center justify-between gap-4 border-t border-gray-100 px-6 py-4">
                    <span className="text-xs text-gray-400">
                        {totalRegistros} registros no total · campos vazios não restringem a apuração
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleCopiarDados}
                            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                        >
                            Copiar dados
                        </button>
                        <button
                            type="button"
                            onClick={onFechar}
                            className="rounded-lg bg-indigo-950 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-900 cursor-pointer"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
