/** Como a lista de campanhas é mostrada: cards (padrão) ou lista (tabela compacta). */
export type Visao = 'cards' | 'lista'

const CHAVE = 'compass-web:visao-campanhas'

export function ehVisao(valor: string | null): valor is Visao {
  return valor === 'cards' || valor === 'lista'
}

/** Última visão escolhida neste navegador (cards se nunca escolheu ou se o armazenamento não está disponível). */
export function lerVisaoSalva(): Visao {
  try {
    const salva = localStorage.getItem(CHAVE)
    return ehVisao(salva) ? salva : 'cards'
  } catch {
    return 'cards'
  }
}

export function salvarVisao(visao: Visao) {
  try {
    localStorage.setItem(CHAVE, visao)
  } catch {
    // sem localStorage (modo privado etc.): a escolha só vale até recarregar a página
  }
}
