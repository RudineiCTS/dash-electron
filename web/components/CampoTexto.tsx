import { useId, useState, type InputHTMLAttributes } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface CampoTextoProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label: string
  value: string
  onChange: (valor: string) => void
  /** Texto de apoio abaixo do campo. */
  dica?: string
}

/** Campo de formulário mobile first (altura de toque de 44px). Em `type="password"` ganha o botão de mostrar/ocultar. */
export function CampoTexto({ label, value, onChange, dica, type = 'text', className = '', ...resto }: CampoTextoProps) {
  const id = useId()
  const [visivel, setVisivel] = useState(false)
  const ehSenha = type === 'password'

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold text-github-text-muted">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={ehSenha && visivel ? 'text' : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`h-11 w-full rounded-lg border border-github-border bg-github-bg px-3 text-sm text-github-text outline-none
                      focus:border-[#32307B] focus:ring-2 focus:ring-[#32307B]/20 disabled:opacity-60 ${ehSenha ? 'pr-11' : ''} ${className}`}
          {...resto}
        />
        {ehSenha && (
          <button
            type="button"
            onClick={() => setVisivel((v) => !v)}
            aria-label={visivel ? 'Ocultar a senha' : 'Mostrar a senha'}
            className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-github-text-muted hover:text-github-text"
          >
            {visivel ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {dica && <p className="text-xs text-github-text-muted">{dica}</p>}
    </div>
  )
}
