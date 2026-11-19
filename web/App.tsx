import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { WebLayout } from './layout/WebLayout'
import CampaignsPage from './pages/CampaignsPage'
import CampaignDetailPage from './pages/CampaignDetailPage'
import NotFoundPage from './pages/NotFoundPage'
import SecaoPage from './pages/SecaoPage'
import ParametrosPage from './pages/ParametrosPage'

/**
 * Rotas do app web (somente leitura). As URLs seguem as do app desktop:
 *   /campaigns                  -> Campanhas Rodando
 *   /campaigns/details/:id      -> Detalhe da campanha
 *
 * BrowserRouter exige "SPA fallback" no servidor (qualquer caminho -> index.html).
 * `import.meta.env.BASE_URL` vem de VITE_BASE_PATH (padrão "/").
 *
 * Quando a autenticação for definida, proteja o <WebLayout /> com um guard de rota
 * (ex: <Route element={<RequireAuth />}>) envolvendo as rotas abaixo.
 */
export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route element={<WebLayout />}>
          <Route index element={<Navigate to="/campaigns" replace />} />
          <Route path="campaigns" element={<CampaignsPage />} />
          <Route path="campaigns/details/:id" element={<CampaignDetailPage />} />
          <Route path="prospeccao" element={<SecaoPage titulo="Prospecção" />} />
          <Route path="fidelizacao" element={<SecaoPage titulo="Fidelização" />} />
          <Route path="sac" element={<SecaoPage titulo="SAC" />} />
          <Route path="exclusivas" element={<SecaoPage titulo="Exclusivas" />} />
          <Route path="parametros" element={<ParametrosPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
