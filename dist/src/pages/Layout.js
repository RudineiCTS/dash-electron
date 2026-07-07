import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/Layout.tsx
import { Outlet } from 'react-router-dom';
import { items } from '../pages/Home';
import { SideBar } from '../components/SideBar';
import { useState } from 'react';
export default function Layout() {
    const [campaignType, setCamapignType] = useState(1);
    function handleSwitchCampaign(e) {
        console.log(e);
        setCamapignType(e);
    }
    return (_jsxs("div", { className: "flex", children: [_jsx(SideBar, { isMenuDefault: true, options: items, className: "flex flex-col bg-other-card w-80 max-w-80  h-screen", optionActive: campaignType, switchCampaign: handleSwitchCampaign }, void 0), _jsx("main", { className: "flex-1", children: _jsx(Outlet, {}, void 0) }, void 0)] }, void 0));
}
//# sourceMappingURL=Layout.js.map