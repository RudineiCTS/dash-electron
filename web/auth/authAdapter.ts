/**
 * Ponto de extensão da autenticação do app web.
 *
 * A estratégia (OIDC/SSO, login próprio, etc.) ainda não foi definida. Quando for,
 * basta implementar este contrato e passar a implementação para `configureHttp()`
 * em `web/main.tsx`: o token passa a ir em todas as chamadas e um 401 dispara
 * `onUnauthorized` (ex: redirecionar para o login).
 */
export interface AuthAdapter {
  /** Devolve o access token atual, ou null se não houver sessão. */
  getAccessToken(): Promise<string | null> | string | null
  /** Chamado quando a API responde 401. */
  onUnauthorized?(): void
}

/** Placeholder enquanto não há autenticação: não envia token. */
export const anonymousAuth: AuthAdapter = {
  getAccessToken: () => null,
}
