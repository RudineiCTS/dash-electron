import { EVENTO_SESSAO_EXPIRADA, lerSessao, salvarSessao, tokenAtual } from '../lib/sessao'

/**
 * Ponto de extensão da autenticação do app web: `configureHttp()` (web/lib/http.ts) usa este contrato
 * para mandar o token em todas as chamadas e reagir a um 401.
 */
export interface AuthAdapter {
  /** Devolve o access token atual, ou null se não houver sessão. */
  getAccessToken(): Promise<string | null> | string | null
  /** Chamado quando a API responde 401. */
  onUnauthorized?(): void
}

/** Sem autenticação: não envia token. */
export const anonymousAuth: AuthAdapter = {
  getAccessToken: () => null,
}

/** Login do Compass: o token guardado nesta aba vai em todas as chamadas; 401 com sessão = expirou. */
export const sessaoAuth: AuthAdapter = {
  getAccessToken: () => tokenAtual(),
  onUnauthorized: () => {
    if (!lerSessao()) return // 401 sem sessão (ex.: senha errada no login) não é expiração
    salvarSessao(null)
    window.dispatchEvent(new Event(EVENTO_SESSAO_EXPIRADA))
  },
}
