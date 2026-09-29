export interface KpiVinculoSimples {
    id: number;
    descricao: string | null;
    contem: string | null;
    tabelaOrigem: string;
}

export interface KpiVinculoCliente {
    idPessoaCliente: number;
    nomeCliente: string | null;
    descBandeira: string | null;
    contem: string | null;
    tabelaOrigem: string;
}

export interface KpiVinculoVendedorAtual {
    idComissaoVendasKpi: number;
    idVendedorAtual: number | null;
    contem: string | null;
    tabelaOrigem: string;
}

export interface KpiVinculoProduto {
    idComissaoVendasKpi: number;
    idProduto: number | null;
    descProduto: string | null;
    contem: string | null;
    tabelaOrigem: string;
}

export interface KpiGrupoProdutoLoreal {
    idProduto: number;
    codigoBarras: string | null;
    descProduto: string | null;
    descGrupo: string | null;
    contem: string | null;
    tabelaOrigem: string;
}

export interface KpiRegraValidacaoFaixa {
    idComissaoVendasKpiRegraValidacao: number;
    idComissaoVendasKpiAValidar: number;
    descricaoKpi: string | null;
    valorInicio: number;
    valorFim: number;
    percentual: number;
    tabelaOrigem: string;
}

export interface KpiFaixaPremiacao {
    idComissaoVendasKpiFaixaPremiacao: number;
    valorInicio: number | null;
    valorFim: number | null;
    valorPremio: number | null;
    percentual: number | null;
    curva: string | null;
    tabelaOrigem: string;
}

export interface KpiRegraValidacao {
    idComissaoVendasKpiRegraValidacao: number;
    idComissaoVendasKpiAValidar: number;
    descricaoKpi: string | null;
    resultadoMinimo: number;
    resultadoMaximo: number;
    tabelaOrigem: string;
}

export interface KpiVinculosDetalhe {
    fabricante: KpiVinculoSimples[];
    cliente: KpiVinculoCliente[];
    bandeira: KpiVinculoSimples[];
    setor: KpiVinculoSimples[];
    vendedorAtual: KpiVinculoVendedorAtual[];
    condicao: KpiVinculoSimples[];
    produto: KpiVinculoProduto[];
    grupoProdutos: KpiGrupoProdutoLoreal[];
    regraValidacaoFaixa: KpiRegraValidacaoFaixa[];
    fabricanteCalculoPremiacao: KpiVinculoSimples[];
    faixaPremiacao: KpiFaixaPremiacao[];
    operacao: KpiVinculoSimples[];
    origem: KpiVinculoSimples[];
    produtoLinha: KpiVinculoSimples[];
    regraValidacao: KpiRegraValidacao[];
}
