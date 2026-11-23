import { useCallback, useEffect, useMemo, useState } from "react";
import { ResultadoValidacao } from "../interfaces/ValidacaoCampanha";
import { detectarTipoPremio, montarRetornoSistema, TipoPremio, tiposPresentes } from "../utils/validacaoCampanhas";
import { useConferenciaCampanha } from "./useConferenciaCampanha";

export const ROTULO_TIPO_PREMIO: Record<TipoPremio, string> = {
  valor: "Prêmio (R$)",
  pontos: "Prêmio (pontos)",
};

/**
 * Conferência da campanha mostrada na validação com uma planilha enviada pelo usuário.
 * Reaproveita a conferência da tela de campanhas dinâmicas: aqui o "sistema" é o resultado calculado da campanha e
 * o usuário escolhe quais tipos de pessoa comparar e se o prêmio é em dinheiro ou em pontos.
 *
 * @param linhas resultado calculado da campanha mostrada.
 * @param idCampanha campanha mostrada; ao trocar, a seleção volta ao padrão e a planilha é removida
 *        (a planilha é a base daquela campanha).
 */
export function useConferenciaValidacao(linhas: ResultadoValidacao[], idCampanha: number | null) {
  // null = "todos os tipos da campanha" (padrão); lista = só esses
  const [tiposEscolhidos, setTiposEscolhidos] = useState<number[] | null>(null);
  const [tipoPremioEscolhido, setTipoPremioEscolhido] = useState<TipoPremio | null>(null);

  const presentes = useMemo(() => tiposPresentes(linhas), [linhas]);
  const idsPresentes = useMemo(() => presentes.map((t) => t.id), [presentes]);

  /** Tipos que realmente entram: os escolhidos que existem na campanha (ou todos, se nada foi escolhido). */
  const tiposIncluidos = useMemo(
    () => (tiposEscolhidos ? tiposEscolhidos.filter((id) => idsPresentes.includes(id)) : idsPresentes),
    [tiposEscolhidos, idsPresentes]
  );

  const tipoPremioSugerido = useMemo(() => detectarTipoPremio(linhas), [linhas]);
  const tipoPremio = tipoPremioEscolhido ?? tipoPremioSugerido;

  const retorno = useMemo(() => (linhas.length > 0 ? montarRetornoSistema(linhas, tipoPremio) : null), [linhas, tipoPremio]);

  const conferencia = useConferenciaCampanha(retorno, {
    tiposIncluidos,
    rotuloPremio: ROTULO_TIPO_PREMIO[tipoPremio],
  });

  const { limparArquivo } = conferencia;
  useEffect(() => {
    setTiposEscolhidos(null);
    setTipoPremioEscolhido(null);
    limparArquivo();
  }, [idCampanha, limparArquivo]);

  const alternarTipo = useCallback(
    (id: number) => {
      setTiposEscolhidos((atual) => {
        const base = atual ?? idsPresentes;
        return base.includes(id) ? base.filter((x) => x !== id) : [...base, id];
      });
    },
    [idsPresentes]
  );

  const marcarTodos = useCallback(() => setTiposEscolhidos(null), []);
  const desmarcarTodos = useCallback(() => setTiposEscolhidos([]), []);

  return {
    conferencia,
    temRetorno: retorno !== null,
    presentes,
    tiposIncluidos,
    alternarTipo,
    marcarTodos,
    desmarcarTodos,
    tipoPremio,
    tipoPremioSugerido,
    tipoPremioManual: tipoPremioEscolhido !== null,
    escolherTipoPremio: setTipoPremioEscolhido,
    rotuloPremio: ROTULO_TIPO_PREMIO[tipoPremio],
  };
}
