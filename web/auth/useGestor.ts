import { getDigitadoras } from '../lib/digitadoras'
import { useApiResource } from '../lib/useApiResource'

/**
 * Gestor = quem supervisiona alguém da base de digitadoras (aparece como `idSupervisor`
 * de outra pessoa). Ele enxerga o resultado de todos; os demais, só o próprio.
 *
 * Regra provisória, derivada da base: quando existir perfil/cargo de verdade no login,
 * só este hook muda e as telas continuam usando `useGestor()`.
 */
export function useGestor(idPessoa: number | null) {
  const base = useApiResource((signal) => getDigitadoras(signal), [])
  const ehGestor = !!idPessoa && !!base.data?.some((p) => p.idSupervisor === idPessoa)
  return { ehGestor, carregando: !!idPessoa && base.loading }
}
