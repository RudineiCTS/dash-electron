/** Para onde voltar depois de entrar: a página que o usuário queria (guardada pelo RequireAuth no state) ou as campanhas. */
export function destinoAposLogin(state: unknown): string {
  const origem = (state as { from?: { pathname?: string; search?: string } } | null)?.from
  return origem?.pathname ? `${origem.pathname}${origem.search ?? ''}` : '/campaigns'
}
