import { LayoutGrid, List } from 'lucide-react'
import type { Visao } from '../lib/visao'

const OPCOES = [
  { id: 'cards', label: 'Ver em cards', Icon: LayoutGrid },
  { id: 'lista', label: 'Ver em lista', Icon: List },
] as const

interface VisaoToggleProps {
  visao: Visao
  onChange: (visao: Visao) => void
  className?: string
}

/** Alterna a lista de campanhas entre cards e lista. Mesmo estilo das abas Valor/Pontos. */
export function VisaoToggle({ visao, onChange, className = '' }: VisaoToggleProps) {
  return (
    <div role="group" aria-label="Modo de visualização" className={`flex gap-0.5 rounded-lg bg-github-bg-hover p-0.5 ${className}`}>
      {OPCOES.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          aria-pressed={visao === id}
          aria-label={label}
          title={label}
          onClick={() => onChange(id)}
          className={`flex h-8 w-9 items-center justify-center rounded-md ${
            visao === id ? 'bg-github-bg-card text-github-text shadow-sm' : 'text-github-text-muted'
          }`}
        >
          <Icon size={16} aria-hidden />
        </button>
      ))}
    </div>
  )
}
