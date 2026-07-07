import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { LogoApp } from './logoApp';
import { FiActivity, FiArchive } from 'react-icons/fi';
import { NavLink } from 'react-router-dom';
export function SideBar({ options, className, isMenuDefault, children, switchCampaign, optionActive }) {
    function handleSelectOption(e) {
        switchCampaign(e);
    }
    return (_jsx("div", { className: `${className}`, children: isMenuDefault == true ? (_jsxs(_Fragment, { children: [_jsx("div", { className: 'mt-4 w-full', children: _jsxs("div", { className: 'text-github-text-muted flex flex-col gap-4 pl-4', children: [_jsxs(NavLink, { className: ({ isActive }) => `flex items-center gap-5 cursor-pointer
                                     bg-transparent p-2 rounded-md w-5/6
                                    hover:text-github-btn-green-hover transition duration-500
                                    ${isActive ? 'bg-other-badge p-2 rounded-md w-5/6 text-github-bg-focus' : 'text-gray-400'}`, to: "campaigns", children: [_jsx(FiArchive, {}, void 0), "Campanhas Rodando"] }, void 0), _jsxs(NavLink, { className: ({ isActive }) => `flex items-center gap-5 cursor-pointer
                                     bg-transparent p-2 rounded-md w-5/6
                                    hover:text-github-btn-green-hover transition duration-500
                                    ${isActive ? 'bg-other-badge p-2 rounded-md w-5/6 text-github-bg-focus' : 'text-gray-400'}`, to: "/", children: [_jsx(FiActivity, {}, void 0), "Campanhas Recebidas"] }, void 0)] }, void 0) }, void 0), _jsx(LogoApp, {}, void 0), _jsx("div", { className: "flex flex-col  items-center", children: _jsx("ul", { className: "flex flex-col gap-3 w-full items-center", children: options.map((e) => (_jsxs("li", { onClick: () => handleSelectOption(e.key), className: `text-[#8A8A9A] flex gap-4 items-center text-sm 
                                        bg-github-border w-4/5 py-3 rounded-xl px-3 mb-4 cursor-pointer
                                        hover:text-github-text hover:bg-github-btn-green-hover transition-all duration-200
                                        ${optionActive === e.key && 'bg-github-btn-green-hover text-github-text'}
                                    `, children: [_jsx(e.icon, { size: 20, color: "#21262d" }, void 0), e.value] }, e.key))) }, void 0) }, void 0), _jsx("span", { className: 'text-github-bg-hover text-sm mt-8', children: "@Created by rudineicts" }, void 0)] }, void 0)) : (_jsx(_Fragment, { children: children }, void 0)) }, void 0));
}
//# sourceMappingURL=SideBar.js.map