import type { ComponentType } from 'react'
import { useSearchParams } from 'react-router-dom'
import { EyeOff, type LucideIcon } from 'lucide-react'
import VisibilidadeCampanhas from './configuracoes/VisibilidadeCampanhas'

interface Secao {
  id: string
  label: string
  Icon: LucideIcon
  Componente: ComponentType
}

/** Menus da tela de configurações. A ordem aqui é a ordem na tela; o primeiro abre por padrão. */
const SECOES: Secao[] = [{ id: 'visibilidade', label: 'Visibilidade das campanhas', Icon: EyeOff, Componente: VisibilidadeCampanhas }]

/** Configurações do Compass (só administrador). Menu em faixa no celular e lateral a partir de `md`. */
export default function ConfiguracoesPage() {
  const [params, setParams] = useSearchParams()
  const atual = SECOES.find((s) => s.id === params.get('secao')) ?? SECOES[0]
  const { Componente } = atual

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-lg font-extrabold">Configurações</h1>

      <div className="flex flex-col gap-3 md:flex-row md:items-start md:gap-6">
        <nav aria-label="Menus de configuração" className="flex gap-1 overflow-x-auto md:w-60 md:shrink-0 md:flex-col">
          {SECOES.map(({ id, label, Icon }) => {
            const ativa = id === atual.id
            return (
              <button
                key={id}
                type="button"
                aria-current={ativa ? 'page' : undefined}
                onClick={() => setParams({ secao: id }, { replace: true })}
                className={`flex h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-left text-sm font-medium transition-colors ${
                  ativa
                    ? 'bg-[#32307B] text-white'
                    : 'text-github-text-muted hover:bg-github-bg-hover hover:text-github-text'
                }`}
              >
                <Icon size={16} aria-hidden />
                {label}
              </button>
            )
          })}
        </nav>

        <div className="min-w-0 flex-1 md:max-w-3xl">
          <Componente />
        </div>
      </div>
    </div>
  )
}
