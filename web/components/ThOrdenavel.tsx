import type { ReactNode } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import type { Ordenacao } from '../lib/ordenar'

/**
 * Cabeçalho de coluna que ordena ao clicar (maior para o menor no primeiro clique; de novo inverte; terceiro limpa).
 * `className` é o mesmo do <th> original (alinhamento, largura, visibilidade em telas pequenas).
 * Para colunas alinhadas à direita use `direita`.
 */
export function ThOrdenavel({
  rotulo,
  chave,
  ord,
  onAlternar,
  className = '',
  direita = false,
}: {
  rotulo: ReactNode
  chave: string
  ord: Ordenacao | null
  onAlternar: (chave: string) => void
  className?: string
  direita?: boolean
}) {
  const ativa = ord?.chave === chave
  const Icone = !ativa ? ArrowUpDown : ord.direcao === 'asc' ? ArrowUp : ArrowDown
  return (
    <th className={className} aria-sort={!ativa ? 'none' : ord.direcao === 'asc' ? 'ascending' : 'descending'}>
      <button
        type="button"
        onClick={() => onAlternar(chave)}
        title="Ordenar"
        className={`inline-flex items-center gap-1 uppercase hover:text-github-text ${direita ? 'flex-row-reverse' : ''} ${ativa ? 'text-github-text' : ''}`}
      >
        {rotulo}
        <Icone size={11} aria-hidden className={ativa ? '' : 'opacity-40'} />
      </button>
    </th>
  )
}
