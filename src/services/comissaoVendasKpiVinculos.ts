import {
    KpiFaixaPremiacao,
    KpiGrupoProdutoLoreal,
    KpiRegraValidacao,
    KpiRegraValidacaoFaixa,
    KpiVinculoCliente,
    KpiVinculoProduto,
    KpiVinculoSimples,
    KpiVinculoVendedorAtual,
    KpiVinculosDetalhe,
} from "../interfaces/KpiVinculo";
import { api } from "./api";

const BASE = "comissao-vendas-kpi-vinculos";

async function get<T>(sufixo: string, id: number, signal?: AbortSignal): Promise<T[]> {
    const response = await api.get<T[]>(`${BASE}/${id}/${sufixo}`, { signal });
    return response.data;
}

export const getKpiVinculoFabricante = (id: number, signal?: AbortSignal) =>
    get<KpiVinculoSimples>("fabricante", id, signal);

export const getKpiVinculoCliente = (id: number, signal?: AbortSignal) =>
    get<KpiVinculoCliente>("cliente", id, signal);

export const getKpiVinculoBandeira = (id: number, signal?: AbortSignal) =>
    get<KpiVinculoSimples>("bandeira", id, signal);

export const getKpiVinculoSetor = (id: number, signal?: AbortSignal) =>
    get<KpiVinculoSimples>("setor", id, signal);

export const getKpiVinculoVendedorAtual = (id: number, signal?: AbortSignal) =>
    get<KpiVinculoVendedorAtual>("vendedor-atual", id, signal);

export const getKpiVinculoCondicao = (id: number, signal?: AbortSignal) =>
    get<KpiVinculoSimples>("condicao", id, signal);

export const getKpiVinculoProduto = (id: number, signal?: AbortSignal) =>
    get<KpiVinculoProduto>("produto", id, signal);

export const getKpiVinculoGrupoProdutos = (id: number, signal?: AbortSignal) =>
    get<KpiGrupoProdutoLoreal>("grupo-produtos", id, signal);

export const getKpiVinculoRegraValidacaoFaixa = (id: number, signal?: AbortSignal) =>
    get<KpiRegraValidacaoFaixa>("regra-validacao-faixa", id, signal);

export const getKpiVinculoFabricanteCalculoPremiacao = (id: number, signal?: AbortSignal) =>
    get<KpiVinculoSimples>("fabricante-calculo-premiacao", id, signal);

export const getKpiVinculoFaixaPremiacao = (id: number, signal?: AbortSignal) =>
    get<KpiFaixaPremiacao>("faixa-premiacao", id, signal);

export const getKpiVinculoOperacao = (id: number, signal?: AbortSignal) =>
    get<KpiVinculoSimples>("operacao", id, signal);

export const getKpiVinculoOrigem = (id: number, signal?: AbortSignal) =>
    get<KpiVinculoSimples>("origem", id, signal);

export const getKpiVinculoProdutoLinha = (id: number, signal?: AbortSignal) =>
    get<KpiVinculoSimples>("produto-linha", id, signal);

export const getKpiVinculoRegraValidacao = (id: number, signal?: AbortSignal) =>
    get<KpiRegraValidacao>("regra-validacao", id, signal);

export async function getKpiVinculosDetalhe(id: number, signal?: AbortSignal): Promise<KpiVinculosDetalhe> {
    const [
        fabricante,
        cliente,
        bandeira,
        setor,
        vendedorAtual,
        condicao,
        produto,
        grupoProdutos,
        regraValidacaoFaixa,
        fabricanteCalculoPremiacao,
        faixaPremiacao,
        operacao,
        origem,
        produtoLinha,
        regraValidacao,
    ] = await Promise.all([
        getKpiVinculoFabricante(id, signal),
        getKpiVinculoCliente(id, signal),
        getKpiVinculoBandeira(id, signal),
        getKpiVinculoSetor(id, signal),
        getKpiVinculoVendedorAtual(id, signal),
        getKpiVinculoCondicao(id, signal),
        getKpiVinculoProduto(id, signal),
        getKpiVinculoGrupoProdutos(id, signal),
        getKpiVinculoRegraValidacaoFaixa(id, signal),
        getKpiVinculoFabricanteCalculoPremiacao(id, signal),
        getKpiVinculoFaixaPremiacao(id, signal),
        getKpiVinculoOperacao(id, signal),
        getKpiVinculoOrigem(id, signal),
        getKpiVinculoProdutoLinha(id, signal),
        getKpiVinculoRegraValidacao(id, signal),
    ]);

    return {
        fabricante,
        cliente,
        bandeira,
        setor,
        vendedorAtual,
        condicao,
        produto,
        grupoProdutos,
        regraValidacaoFaixa,
        fabricanteCalculoPremiacao,
        faixaPremiacao,
        operacao,
        origem,
        produtoLinha,
        regraValidacao,
    };
}
