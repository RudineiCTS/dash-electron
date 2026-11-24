import { useUsuario } from './UsuarioContext'
import { getDigitadoras } from '../lib/digitadoras'
import { useApiResource } from '../lib/useApiResource'

/**
 * Gestor = quem tem perfil de gestão (Supervisora ou Auxiliar de supervisão, pelo tipo de pessoa na base de
 * televendas) ou quem supervisiona alguém da base de digitadoras (aparece como `idSupervisor` de outra pessoa).
 * Ele enxerga o resultado de todos; os demais, só o próprio.
 *
 * Quando existir perfil/cargo de verdade no login, só este hook muda e as telas continuam usando `useGestor()`.
 */
export function useGestor(idPessoa: number | null) {
  const base = useApiResource((signal) => getDigitadoras(signal), [])
  const { acesso, carregandoAcesso, administrador } = useUsuario()
  const ehGestor = !!idPessoa && (administrador || !!acesso?.gestao || !!base.data?.some((p) => p.idSupervisor === idPessoa))
  return { ehGestor, carregando: !!idPessoa && (base.loading || carregandoAcesso) }
}
