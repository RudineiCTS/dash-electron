import { isAxiosError } from 'axios'
import { api, apiParams } from '@shared/services/api'
import type { AuthAdapter } from '../auth/authAdapter'

/**
 * Reconfigura os clientes axios compartilhados com o app Electron (src/services/api.ts,
 * que aponta para localhost:5225) para o ambiente web, e pluga a autenticação.
 * Deve rodar antes do primeiro render.
 */
export function configureHttp(auth: AuthAdapter) {
  const base = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '')
  api.defaults.baseURL = `${base}/api`
  apiParams.defaults.baseURL = `${base}/Campaign/Params/Detail`

  for (const client of [api, apiParams]) {
    client.interceptors.request.use(async (config) => {
      const token = await auth.getAccessToken()
      if (token) config.headers.set('Authorization', `Bearer ${token}`)
      return config
    })

    client.interceptors.response.use(
      (response) => response,
      (error: unknown) => {
        if (isAxiosError(error) && error.response?.status === 401) {
          auth.onUnauthorized?.()
        }
        return Promise.reject(error)
      },
    )
  }
}
