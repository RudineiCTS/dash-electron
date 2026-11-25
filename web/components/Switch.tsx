interface SwitchProps {
  checked: boolean
  onChange: (valor: boolean) => void
  /** Nome acessível (o que a chave liga/desliga). */
  label: string
  disabled?: boolean
}

/** Chave liga/desliga acessível (role="switch"), com alvo de toque confortável no celular. */
export function Switch({ checked, onChange, label, disabled }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:cursor-wait disabled:opacity-60 ${
        checked ? 'bg-github-btn-green' : 'bg-github-border'
      }`}
    >
      <span
        aria-hidden
        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-5' : ''
        }`}
      />
    </button>
  )
}
