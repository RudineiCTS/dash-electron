import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CampaignsActive from './pages/CampaingsActive';
import Layout from './pages/Layout';
import './index.css';
createRoot(document.getElementById('app')).render(_jsx(HashRouter, { children: _jsx(Routes, { children: _jsxs(Route, { path: "/", element: _jsx(Layout, {}, void 0), children: [_jsx(Route, { index: true, element: _jsx(Home, {}, void 0) }, void 0), _jsx(Route, { path: "/campaigns", element: _jsx(CampaignsActive, {}, void 0) }, void 0)] }, void 0) }, void 0) }, void 0));
//# sourceMappingURL=renderer.js.map