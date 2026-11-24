import { useEffect, useState } from 'react'

/** Segundos que faltam até `quando` (ms desde 1970), nunca negativo. */
function segundosAte(quando: number): number {
  return Math.max(0, Math.ceil((quando - Date.now()) / 1000))
}

/** Contagem regressiva (em segundos) até `quando`; 0 quando acabou ou quando não há prazo. */
export function useContagem(quando: number | undefined): number {
  const [restam, setRestam] = useState(() => (quando ? segundosAte(quando) : 0))

  useEffect(() => {
    if (!quando) {
      setRestam(0)
      return
    }
    setRestam(segundosAte(quando))
    const timer = setInterval(() => setRestam(segundosAte(quando)), 1000)
    return () => clearInterval(timer)
  }, [quando])

  return restam
}
