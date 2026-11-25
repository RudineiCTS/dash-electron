import { EyeOff } from 'lucide-react'

/**
 * Marca de um valor que o administrador escondeu (prêmio ou apurado) para usuário comum.
 * Mostrar "Oculto" em vez de R$ 0,00 evita que alguém ache que o valor é zero.
 */
export function ValorOculto({ className = '' }: { className?: string }) {
  return (
    <span
      title="Este valor foi ocultado pelo administrador"
      className={`inline-flex items-center gap-1 font-medium text-github-text-muted ${className}`}
    >
      <EyeOff size={12} aria-hidden />
      Oculto
    </span>
  )
}
