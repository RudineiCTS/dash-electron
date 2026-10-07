/**
 * Perfil de acesso ao sistema de campanhas (tblSegUsuario.IDPerfilSistemaCampanha).
 *  1 = consulta: campanhas, relatório avançado, histórico e campanhas recebidas
 *  2 = operacional: campanhas e campanhas recebidas + parâmetros (importar valores e visualizar metas)
 *  3 = acesso total
 */
export const PERFIL_CAMPANHA = {
  CONSULTA: 1,
  OPERACIONAL: 2,
  COMPLETO: 3,
} as const;

export type RotaRestrita =
  | "campaigns"
  | "campaigns-advanced"
  | "campaigns-history"
  | "campaign-received"
  | "params-telesales"
  | "params-general";

const ROTAS_POR_PERFIL: Record<number, readonly RotaRestrita[]> = {
  [PERFIL_CAMPANHA.CONSULTA]: ["campaigns", "campaigns-advanced", "campaigns-history", "campaign-received"],
  [PERFIL_CAMPANHA.OPERACIONAL]: ["campaigns", "campaign-received", "params-telesales", "params-general"],
  [PERFIL_CAMPANHA.COMPLETO]: [
    "campaigns",
    "campaigns-advanced",
    "campaigns-history",
    "campaign-received",
    "params-telesales",
    "params-general",
  ],
};

/** Abas de "params-general" (ids de META_TABS) liberadas por perfil. Perfil sem entrada: nenhuma. */
const ABAS_PARAMS_GENERAL_POR_PERFIL: Record<number, readonly number[] | "todas"> = {
  [PERFIL_CAMPANHA.OPERACIONAL]: [2, 3], // Importar valores e Visualizar metas
  [PERFIL_CAMPANHA.COMPLETO]: "todas",
};

export function podeAcessarRota(perfil: number | null | undefined, rota: RotaRestrita): boolean {
  if (perfil == null) return false;
  return ROTAS_POR_PERFIL[perfil]?.includes(rota) ?? false;
}

export function podeUsarAbaParamsGeneral(perfil: number | null | undefined, idAba: number): boolean {
  if (perfil == null) return false;
  const abas = ABAS_PARAMS_GENERAL_POR_PERFIL[perfil];
  if (!abas) return false;
  return abas === "todas" || abas.includes(idAba);
}
