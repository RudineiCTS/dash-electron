// src/components/Layout.tsx
import { matchPath, Outlet, useLocation } from 'react-router-dom'
import { items } from '../pages/Home'
import { SideBar } from '../components/SideBar'
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const routesWithoutSideBar = ['/campaigns/details/:id', 'campaigns-advanced']

export default function Layout() {
  const [campaignType, setCamapignType] = useState(1);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  function handleSwitchCampaign(e: number) {
    setCamapignType(e);
    setMobileOpen(false); // fecha o drawer ao navegar
  }

  const hideSideBar = routesWithoutSideBar.some((p) => matchPath(p, location.pathname));

  return (
    <div className="flex h-screen overflow-hidden">
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
            className={`flex flex-col bg-other-card w-80 max-w-80 h-screen
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
  )
}