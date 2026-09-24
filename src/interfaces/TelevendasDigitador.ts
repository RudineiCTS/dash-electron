export interface TelevendasDigitador {
    idPessoa: number;
    /** GUID (não numérico) do usuário digitador no GS300ERP. */
    idUsuario: string | null;
    nomeUsuario: string | null;
    /** Texto livre, editável - GS300GP.dbo.tblTelevendasDigitadorGrupo. */
    grupo: string | null;
    subGrupo: string | null;
}

export interface TelevendasDigitadorGrupoUpdate {
    idPessoaTelevendas: number;
    grupo: string | null;
    subGrupo: string | null;
}
