import { EyeOff } from 'lucide-react'
import type { VisibilidadeCampanha } from '../lib/visibilidade'

/** Para o administrador, que vê tudo: lembra o que desta campanha os usuários comuns NÃO estão vendo. */
export function AvisoOcultoAdmin({ regra, className = '' }: { regra: VisibilidadeCampanha; className?: string }) {
  const itens = [regra.hidePrize && 'prêmio', regra.hideAssessed && 'apurado'].filter(Boolean).join(' e ')
  if (!itens) return null

  return (
    <p className={`flex items-center gap-1 text-[11px] text-github-text-muted ${className}`}>
      <EyeOff size={12} aria-hidden />
      Oculto para usuários: {itens}
    </p>
  )
}
