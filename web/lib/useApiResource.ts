import { useCallback, useEffect, useState } from 'react'
import { isAxiosError, isCancel } from 'axios'

interface ResourceState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

function describeError(err: unknown): string {
  if (isAxiosError(err)) {
    const status = err.response?.status
    if (status === 401 || status === 403) return 'Sua sessão expirou ou você não tem permissão para ver isto.'
    if (status === 404) return 'Não encontramos esse conteúdo.'
    if (status && status >= 500) return 'O servidor teve um problema. Tente novamente em instantes.'
    if (!err.response) return 'Sem conexão com o servidor. Verifique sua internet e tente de novo.'
  }
  return 'Não foi possível carregar os dados.'
}

/**
 * Busca um recurso e refaz a busca quando `deps` mudam. Cancela a requisição anterior
 * e NÃO cai para dados de exemplo em caso de erro (diferente do app Electron).
 */
export function useApiResource<T>(fetcher: (signal: AbortSignal) => Promise<T>, deps: readonly unknown[]) {
  const [state, setState] = useState<ResourceState<T>>({ data: null, loading: true, error: null })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setState({ data: null, loading: true, error: null })

    fetcher(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setState({ data, loading: false, error: null })
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted || isCancel(err)) return
        setState({ data: null, loading: false, error: describeError(err) })
      })

    return () => controller.abort()
  }, [...deps, attempt])

  const reload = useCallback(() => setAttempt((n) => n + 1), [])

  return { ...state, reload }
}
