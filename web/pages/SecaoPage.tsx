/** Página provisória das seções novas, até o conteúdo de cada uma ser definido. */
export default function SecaoPage({ titulo }: { titulo: string }) {
  return (
    <div>
      <h1 className="text-lg font-semibold">{titulo}</h1>
      <p className="mt-2 text-sm text-github-text-muted">Em construção.</p>
    </div>
  )
}
