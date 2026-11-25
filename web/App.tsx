import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { WebLayout } from './layout/WebLayout'
import CampaignsPage from './pages/CampaignsPage'
import CampaignDetailPage from './pages/CampaignDetailPage'
import CampaignOrdersPage from './pages/CampaignOrdersPage'
import NotFoundPage from './pages/NotFoundPage'
import SecaoPage from './pages/SecaoPage'
import ParametrosPage from './pages/ParametrosPage'
import ExclusivasPage from './pages/ExclusivasPage'
import OportunidadesPage from './pages/OportunidadesPage'
import { Inicio } from './components/Inicio'
import { RotaProtegida } from './components/RotaProtegida'
import FidelizacaoPage from './pages/FidelizacaoPage'
import ProspeccaoPage from './pages/ProspeccaoPage'
import LoginPage from './pages/LoginPage'
import UsuariosPage from './pages/UsuariosPage'
import ConfiguracoesPage from './pages/ConfiguracoesPage'
import { SomenteAdministrador } from './components/SomenteAdministrador'

/**
 * Rotas do app web (somente leitura). As URLs seguem as do app desktop:
 *   /campaigns                  -> Campanhas Rodando
 *   /campaigns/details/:id      -> Detalhe da campanha
 *
 * BrowserRouter exige "SPA fallback" no servidor (qualquer caminho -> index.html).
 * `import.meta.env.BASE_URL` vem de VITE_BASE_PATH (padrão "/").
 *
 * Login: /login (usuário e senha do Windows, conferidos no AD pela API). Quando a simulação de usuário
 * está desligada (produção), o <WebLayout /> redireciona para /login enquanto não houver sessão.
 */
export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route element={<WebLayout />}>
          <Route index element={<Inicio />} />
          <Route path="campaigns" element={<RotaProtegida aba="/campaigns"><CampaignsPage /></RotaProtegida>} />
          <Route path="campaigns/details/:id" element={<RotaProtegida aba="/campaigns"><CampaignDetailPage /></RotaProtegida>} />
          <Route path="campaigns/details/:id/pedidos" element={<RotaProtegida aba="/campaigns"><CampaignOrdersPage /></RotaProtegida>} />
          <Route path="prospeccao" element={<RotaProtegida aba="/prospeccao"><ProspeccaoPage /></RotaProtegida>} />
          <Route path="fidelizacao" element={<RotaProtegida aba="/fidelizacao"><FidelizacaoPage /></RotaProtegida>} />
          <Route path="sac" element={<RotaProtegida aba="/sac"><SecaoPage titulo="SAC" /></RotaProtegida>} />
          <Route path="exclusivas" element={<RotaProtegida aba="/exclusivas"><ExclusivasPage /></RotaProtegida>} />
          <Route path="oportunidades" element={<RotaProtegida aba="/oportunidades"><OportunidadesPage /></RotaProtegida>} />
          <Route path="parametros" element={<RotaProtegida aba="/parametros"><ParametrosPage /></RotaProtegida>} />
          <Route path="usuarios" element={<RotaProtegida aba="/usuarios"><UsuariosPage /></RotaProtegida>} />
          <Route path="configuracoes" element={<SomenteAdministrador><ConfiguracoesPage /></SomenteAdministrador>} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
