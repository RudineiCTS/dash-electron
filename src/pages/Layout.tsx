// src/components/Layout.tsx
import { matchPath, Outlet, useLocation } from 'react-router-dom'
import { items } from '../pages/Home'
import { SideBar } from '../components/SideBar'
import { useState } from 'react';



const routesWithoutSideBar = ['/campaigns/details/:id']
export default function Layout() {
  const [campaignType, setCamapignType] =useState(1);
  const location = useLocation();
  function handleSwitchCampaign(e:number){    
    setCamapignType(e);
  }

  const hideSideBar = routesWithoutSideBar.some((p) => matchPath(p, location.pathname))


  return (
    <div className="flex">
      {!hideSideBar && (
        <SideBar
          isMenuDefault={true}
          options={items}
          className="flex flex-col bg-other-card w-80 max-w-80  h-screen"
          optionActive={campaignType}
          switchCampaign={handleSwitchCampaign}        
        />
      )}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}