/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/process-model
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.ts` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import CampaignsActive from './pages/CampaingsActive'
import CampaignDetail from './pages/CampaignDetail'
import Layout from './pages/Layout'
import './index.css'
import CampaignsAdvanced from './pages/CampaignAdvanced'
import { ThemeProvider } from './context/ThemeContext'
import { UserProvider } from './context/UserContext'
import { CampaignHistory } from './pages/CampaignHistory'
import InitialScreen from './pages/InitialScreen'
import AppGate from './components/AppGate'

createRoot(document.getElementById('app')!).render(
  <ThemeProvider>
    <UserProvider>
      <AppGate>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<InitialScreen />} />
              <Route path="/campaigns" element={<CampaignsActive />} />
              <Route path="/campaigns/details/:id" element={<CampaignDetail />} />
              <Route path="campaigns-advanced" element={<CampaignsAdvanced />} />
              <Route path="campaigns-history" element={<CampaignHistory />} />
              <Route path="campaign-received" element={<Home />} />
            </Route>
          </Routes>
        </HashRouter>
      </AppGate>
    </UserProvider>
  </ThemeProvider>
)

// const root = createRoot(document.getElementById('app'))
// root.render(<Home />)