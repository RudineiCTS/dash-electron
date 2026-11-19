export interface TelevendasDigitador {
    idPessoa: number;
    /** GUID (não numérico) do usuário digitador no GS300ERP. */
    idUsuario: string | null;
    nomeUsuario: string | null;
    /** Texto livre, editável - GS300GP.dbo.tblTelevendasDigitadorGrupo. */
    grupo: string | null;
    subGrupo: string | null;
}

/** Cadastro de grupo com seus subgrupos (tblTelevendasGrupo / tblTelevendasSubGrupo). */
export interface TelevendasGrupoOpcao {
    idGrupo: number;
    grupo: string;
    subGrupos: { idSubGrupo: number; subGrupo: string }[];
}

export interface TelevendasDigitadorGrupoUpdate {
    idPessoaTelevendas: number;
    grupo: string | null;
    subGrupo: string | null;
}
