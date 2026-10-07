import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { usePermissoes } from "../hook/usePermissoes";
import { RotaRestrita } from "../utils/permissoes";

interface RotaProtegidaProps {
  rota: RotaRestrita;
  children: ReactNode;
}

/** Quem não tem o perfil da rota volta para o menu inicial. */
export function RotaProtegida({ rota, children }: RotaProtegidaProps) {
  const { podeAcessar } = usePermissoes();
  if (!podeAcessar(rota)) return <Navigate to="/menu" replace />;
  return <>{children}</>;
}
