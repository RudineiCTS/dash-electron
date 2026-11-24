import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { RequireAuth } from './auth/RequireAuth'
import { WebLayout } from './layout/WebLayout'
import CampaignsPage from './pages/CampaignsPage'
import CampaignDetailPage from './pages/CampaignDetailPage'
import CampaignOrdersPage from './pages/CampaignOrdersPage'
import ConfirmarEmailPage from './pages/auth/ConfirmarEmailPage'
import DefinirSenhaPage from './pages/auth/DefinirSenhaPage'
import LoginPage from './pages/auth/LoginPage'
import NotFoundPage from './pages/NotFoundPage'
import SecaoPage from './pages/SecaoPage'
import ParametrosPage from './pages/ParametrosPage'

/**
 * Rotas do app web. As URLs seguem as do app desktop:
 *   /campaigns                  -> Campanhas Rodando
 *   /campaigns/details/:id      -> Detalhe da campanha
 *
 * /login, /login/confirmar e /senha ficam fora do login; todo o resto exige sessão (<RequireAuth />).
 *
 * BrowserRouter exige "SPA fallback" no servidor (qualquer caminho -> index.html).
 * `import.meta.env.BASE_URL` vem de VITE_BASE_PATH (padrão "/").
 */
export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route path="login/confirmar" element={<ConfirmarEmailPage />} />
        <Route path="senha" element={<DefinirSenhaPage />} />

        <Route element={<RequireAuth />}>
          <Route element={<WebLayout />}>
            <Route index element={<Navigate to="/campaigns" replace />} />
            <Route path="campaigns" element={<CampaignsPage />} />
            <Route path="campaigns/details/:id" element={<CampaignDetailPage />} />
            <Route path="campaigns/details/:id/pedidos" element={<CampaignOrdersPage />} />
            <Route path="prospeccao" element={<SecaoPage titulo="Prospecção" />} />
            <Route path="fidelizacao" element={<SecaoPage titulo="Fidelização" />} />
            <Route path="sac" element={<SecaoPage titulo="SAC" />} />
            <Route path="exclusivas" element={<SecaoPage titulo="Exclusivas" />} />
            <Route path="parametros" element={<ParametrosPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
