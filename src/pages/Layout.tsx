// src/components/Layout.tsx
import { Outlet } from 'react-router-dom'
import { items } from '../pages/Home'
import { SideBar } from '../components/SideBar'
import { useState } from 'react';

export default function Layout() {
  const [campaignType, setCamapignType] =useState(1);
  function handleSwitchCampaign(e:number){
    console.log(e)
    setCamapignType(e);
  }
  return (
    <div className="flex">
      <SideBar
        isMenuDefault={true}
        options={items}
        className="flex flex-col bg-other-card w-80 max-w-80  h-screen"
        optionActive={campaignType}
        switchCampaign={handleSwitchCampaign}
        
      />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}