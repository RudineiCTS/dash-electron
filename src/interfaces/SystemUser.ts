export interface SystemUserProfile {
    idUser: number;
    userName: string;
    idUserProfile: number;
    /** tblSegUsuario.IDPerfilSistemaCampanha (1, 2 ou 3); null quando não configurado. */
    idCampaignSystemProfile: number | null;
    inactive: boolean;
}
