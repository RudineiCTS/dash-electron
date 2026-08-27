// src/components/Layout.tsx
import { matchPath, Outlet, useLocation } from 'react-router-dom'
import { items } from '../pages/Home'
import { SideBar } from '../components/SideBar'
import { useState } from 'react';
import { Menu } from 'lucide-react';
import { TitleBar } from '../components/TitleBarWindow';
import { CampaignSummary } from '../interfaces/CampaignSummary';

const routesWithoutSideBar = ['/campaigns/details/:id', 'campaigns-advanced']

interface CampaignDetailLocationState {
  summary?: CampaignSummary;
}

const ambiente = import.meta.env.VITE_APP_ENV === 'HOMOLOG'
  ? 'HOMOLOG'
  : import.meta.env.DEV
    ? 'DEV'
    : 'PROD';

function useContextoAtual(): string | undefined {
  const location = useLocation();

  if (matchPath('/campaigns/details/:id', location.pathname)) {
    const state = location.state as CampaignDetailLocationState | null;
    if (state?.summary) {
      return `Campanhas · #${state.summary.idCampaign} ${state.summary.campaignDescription}`;
    }
    return 'Campanhas · Detalhe da campanha';
  }

  if (matchPath('/campaigns-advanced', location.pathname)) {
    return 'Relatório Avançado';
  }

  if (matchPath('/campaigns-history', location.pathname)) {
    return 'Histórico de Campanhas';
  }

  if (matchPath('/campaigns', location.pathname)) {
    return 'Campanhas Rodando';
  }

  if (matchPath('/', location.pathname)) {
    return 'Campanhas Recebidas';
  }

  return undefined;
}

export default function Layout() {
  const [campaignType, setCamapignType] = useState(1);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const contextoAtual = useContextoAtual();

  function handleSwitchCampaign(e: number) {
    setCamapignType(e);
    setMobileOpen(false); // fecha o drawer ao navegar
  }

  const hideSideBar = routesWithoutSideBar.some((p) => matchPath(p, location.pathname));

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TitleBar contextoAtual={contextoAtual} ambiente={ambiente} versao={__APP_VERSION__} />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {!hideSideBar && (
          <>
            {/* Overlay escuro atrás do drawer no mobile */}
            {mobileOpen && (
              <div
                className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                onClick={() => setMobileOpen(false)}
              />
            )}

            <SideBar
              isMenuDefault={true}
              options={items}
              className={`flex flex-col bg-other-card w-80 max-w-80 h-full
                          fixed lg:static z-50 transition-transform duration-200

                          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
              optionActive={campaignType}
              switchCampaign={handleSwitchCampaign}
            />
          </>
        )}

        <main className="flex-1 overflow-y-auto min-w-0">
          {/* Botão hambúrguer, só aparece em telas pequenas */}
          {!hideSideBar && (
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-3 text-github-text"
              aria-label="Abrir menu"
            >
              <Menu size={22} />
            </button>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  )
}
