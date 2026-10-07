import { useCallback } from "react";
import { useUser } from "../context/UserContext";
import { podeAcessarRota, podeUsarAbaParamsGeneral, RotaRestrita } from "../utils/permissoes";

export function usePermissoes() {
  const { profile } = useUser();
  const perfil = profile?.idCampaignSystemProfile ?? null;

  const podeAcessar = useCallback((rota: RotaRestrita) => podeAcessarRota(perfil, rota), [perfil]);
  const podeUsarAba = useCallback((idAba: number) => podeUsarAbaParamsGeneral(perfil, idAba), [perfil]);

  return { perfil, podeAcessar, podeUsarAba };
}
