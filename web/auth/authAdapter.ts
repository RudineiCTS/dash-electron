import { definirSessao, sessaoVigente } from './sessao'

/**
 * Ponto de extensão da autenticação do app web: `configureHttp()` (web/lib/http.ts) manda o token em todas as
 * chamadas e, quando a API responde 401, chama `onUnauthorized`.
 */
export interface AuthAdapter {
  /** Devolve o access token atual, ou null se não houver sessão. */
  getAccessToken(): Promise<string | null> | string | null
  /** Chamado quando a API responde 401. */
  onUnauthorized?(): void
}

/** Sem autenticação: não envia token. Só para testes/ambientes sem login. */
export const anonymousAuth: AuthAdapter = {
  getAccessToken: () => null,
}

/**
 * Login real: o token vem da sessão (sessionStorage) e um 401 da API encerra a sessão, o que faz o `RequireAuth`
 * mandar o usuário de volta para a tela de login.
 */
export const sessionAuth: AuthAdapter = {
  getAccessToken: () => sessaoVigente()?.accessToken ?? null,
  onUnauthorized: () => definirSessao(null),
}
