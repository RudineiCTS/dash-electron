/**
 * Sessão do login web. Fica em memória e no sessionStorage (sobrevive a F5, mas morre ao fechar a aba) e NUNCA no
 * localStorage. O token expira no fim do dia (a API define), então uma sessão vencida é descartada aqui também.
 *
 * É um store de módulo (e não só estado do React) porque o interceptor do axios (`configureHttp`, em web/lib/http.ts)
 * roda fora de componentes e precisa ler o token e avisar quando a API responde 401.
 */
export interface UsuarioSessao {
  idUsuario: number
  userName: string
  /** IDPerfilSistemaCampanha (1 consulta, 2 operacional, 3 total) ou null. */
  idPerfilCampanha: number | null
  /** IDPessoaTelevendas, se o usuário for digitadora. */
  idPessoa: number | null
}

export interface Sessao {
  accessToken: string
  /** ISO (UTC). */
  expiraEm: string
  usuario: UsuarioSessao
}

const CHAVE = 'compass-web:sessao'

function vencida(s: Sessao): boolean {
  return Date.parse(s.expiraEm) <= Date.now()
}

function lerSalva(): Sessao | null {
  try {
    const bruto = sessionStorage.getItem(CHAVE)
    if (!bruto) return null
    const s = JSON.parse(bruto) as Sessao
    if (!s?.accessToken || !s.expiraEm || vencida(s)) {
      sessionStorage.removeItem(CHAVE)
      return null
    }
    return s
  } catch {
    return null // sem sessionStorage (modo restrito) ou JSON quebrado: começa deslogado
  }
}

let atual: Sessao | null = lerSalva()
const ouvintes = new Set<() => void>()

function notificar() {
  ouvintes.forEach((fn) => fn())
}

/** Valor para o React (useSyncExternalStore): é sempre a mesma referência até a sessão mudar. */
export function obterSessao(): Sessao | null {
  return atual
}

/** Sessão vigente: descarta e avisa se já venceu. */
export function sessaoVigente(): Sessao | null {
  if (atual && vencida(atual)) definirSessao(null)
  return atual
}

export function definirSessao(sessao: Sessao | null) {
  atual = sessao
  try {
    if (sessao) sessionStorage.setItem(CHAVE, JSON.stringify(sessao))
    else sessionStorage.removeItem(CHAVE)
  } catch {
    // sem sessionStorage: a sessão vale só até recarregar a página
  }
  notificar()
}

export function atualizarUsuario(usuario: UsuarioSessao) {
  if (atual) definirSessao({ ...atual, usuario })
}

export function assinarSessao(fn: () => void): () => void {
  ouvintes.add(fn)
  return () => {
    ouvintes.delete(fn)
  }
}
