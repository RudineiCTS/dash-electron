import { useMemo, useRef, useState } from 'react'

export type Direcao = 'asc' | 'desc'

export interface Ordenacao {
  chave: string
  direcao: Direcao
}

type Leitor<T> = (linha: T) => string | number | boolean | null | undefined

const collator = new Intl.Collator('pt-BR', { numeric: true, sensitivity: 'base' })

function comparar(a: string | number | boolean | null | undefined, b: string | number | boolean | null | undefined) {
  if (typeof a === 'number' && typeof b === 'number') return a - b
  if (typeof a === 'boolean' || typeof b === 'boolean') return Number(a) - Number(b)
  return collator.compare(String(a ?? ''), String(b ?? ''))
}

/**
 * Ordenação por coluna, no navegador. Cada coluna ordenável tem uma chave e um leitor do valor.
 * Primeiro clique: números do MAIOR para o MENOR (texto: A a Z); segundo clique inverte; terceiro volta à ordem original.
 * Valores vazios ficam sempre no fim. Sem ordenação escolhida, devolve as linhas como vieram.
 */
export function useOrdenacao<T>(linhas: T[], leitores: Record<string, Leitor<T>>, inicial: Ordenacao | null = null) {
  const [ord, setOrd] = useState<Ordenacao | null>(inicial)
  const leitoresRef = useRef(leitores)
  leitoresRef.current = leitores

  const ordenadas = useMemo(() => {
    if (!ord) return linhas
    const ler = leitoresRef.current[ord.chave]
    if (!ler) return linhas
    const sinal = ord.direcao === 'asc' ? 1 : -1
    return [...linhas].sort((x, y) => {
      const a = ler(x)
      const b = ler(y)
      const aVazio = a === null || a === undefined || a === ''
      const bVazio = b === null || b === undefined || b === ''
      if (aVazio || bVazio) return aVazio === bVazio ? 0 : aVazio ? 1 : -1
      return comparar(a, b) * sinal
    })
  }, [linhas, ord])

  function alternar(chave: string) {
    setOrd((atual) => {
      if (!atual || atual.chave !== chave) {
        const amostra = linhas.map((l) => leitoresRef.current[chave]?.(l)).find((v) => v !== null && v !== undefined && v !== '')
        return { chave, direcao: typeof amostra === 'string' ? 'asc' : 'desc' }
      }
      const primeira = atual.direcao
      const inversa: Direcao = primeira === 'asc' ? 'desc' : 'asc'
      // já alternou uma vez (está na direção oposta à inicial): o clique seguinte limpa
      const amostra = linhas.map((l) => leitoresRef.current[chave]?.(l)).find((v) => v !== null && v !== undefined && v !== '')
      const inicialDaColuna: Direcao = typeof amostra === 'string' ? 'asc' : 'desc'
      return atual.direcao === inicialDaColuna ? { chave, direcao: inversa } : null
    })
  }

  return { ordenadas, ord, alternar }
}
