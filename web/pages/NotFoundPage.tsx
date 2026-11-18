import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <p className="text-4xl font-extrabold text-github-text-muted">404</p>
      <p className="text-sm text-github-text-muted">Página não encontrada.</p>
      <Link to="/campaigns" className="flex h-11 items-center rounded-lg bg-github-btn-green px-5 text-sm font-medium text-white">
        Ver campanhas rodando
      </Link>
    </div>
  )
}
