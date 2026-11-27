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
  const { acesso, carregandoAcesso, administrador, supervisao } = useUsuario()
  // administrador e Supervisão do Compass veem todos os colaboradores, mesmo sem estar ligados a uma pessoa do televendas
  const veTudo = administrador || supervisao
  const ehGestor = veTudo || (!!idPessoa && (!!acesso?.gestao || !!base.data?.some((p) => p.idSupervisor === idPessoa)))
  return { ehGestor, carregando: !veTudo && !!idPessoa && (base.loading || carregandoAcesso) }
}
