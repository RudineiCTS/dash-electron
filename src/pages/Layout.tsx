// src/components/Layout.tsx
import { Outlet } from 'react-router-dom'
import { items } from '../pages/Home'
import { SideBar } from '../components/SideBar'

export default function Layout() {
  return (
    <div className="flex">
      <SideBar
        isMenuDefault={true}
        options={items}
        className="flex flex-col bg-other-card w-80 max-w-80  h-screen"
      />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}