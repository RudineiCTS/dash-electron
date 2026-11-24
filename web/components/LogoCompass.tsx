import { useId } from 'react'

/** Ícone do Compass (a bússola): o mesmo do app desktop e do favicon. */
export function IconeCompass({ tamanho = 28, className }: { tamanho?: number; className?: string }) {
  const id = useId()
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="100" y2="100">
          <stop offset="0%" stopColor="#3fb950" />
          <stop offset="100%" stopColor="#1f8a3d" />
        </linearGradient>
      </defs>
      <circle
        cx="50"
        cy="50"
        r="45"
        stroke={`url(#${id})`}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray="220 283"
        transform="rotate(-90 50 50)"
      />
      <path d="M50 30 L64 55 L50 70 L36 55 Z" fill="#2ecb73" />
    </svg>
  )
}

/**
 * Logo + nome "Compass Comercial" (o "pass" em verde, como no app desktop).
 * `claro`: texto branco, para fundos escuros (header); senão usa a cor do texto do tema.
 */
export function LogoCompass({ claro = false, tamanho = 28, mostrarNome = true }: { claro?: boolean; tamanho?: number; mostrarNome?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <IconeCompass tamanho={tamanho} className="shrink-0" />
      {mostrarNome && (
        <span className={`truncate text-sm font-extrabold tracking-tight ${claro ? 'text-white' : 'text-github-text'}`}>
          Com<span className="text-[#3fb950]">pass</span>
          <span className={`ml-1 font-semibold ${claro ? 'text-white/80' : 'text-github-text-muted'}`}>Comercial</span>
        </span>
      )}
    </span>
  )
}
