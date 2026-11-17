export interface ComissaoTelevendasMeta {
    idComissaoVendasMeta: number;
    idComissaoVendasPeriodoCompetencia: number;
    idPessoa: number;
    /** GUID (não numérico) do usuário digitador. */
    usuarioDigitador: string | null;
    nomeDigitador: string | null;
    /** null quando a meta ainda não tem valor gravado. */
    idComissaoVendasMetaTipo: number | null;
    descricaoMetaTipo: string | null;
    valor: number | null;
    idPessoaSupervisor: number | null;
    idPessoaGerente: number | null;
    calcular: boolean | null;
    idComissaoVendasTipoPessoa: number;
    descricaoTipoPessoa: string | null;
    idDigitadorGrupo: number;
    grupo: string | null;
}

export interface ComissaoTelevendasMetasDigitador {
  idPessoa: number;
  usuarioDigitador: string | null;
  nomeDigitador: string | null;
  idComissaoVendasMetaTipo: (number | null)[];
  descricaoMetaTipo: (string | null)[];
  valor: (number | null)[];
  calcular: (boolean | null)[];
}