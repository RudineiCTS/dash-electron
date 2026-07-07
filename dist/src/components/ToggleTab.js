import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
export function ToggleTab() {
    const [active, setActive] = useState("valor");
    return (_jsxs("div", { className: "flex bg-[#10171f] border border-white/[0.07] rounded-[9px] p-[3px] gap-[2px]", children: [_jsx("button", { onClick: () => setActive("pontos"), className: `px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-150 cursor-pointer ${active === "pontos"
                    ? "bg-green-400 text-green-900"
                    : "bg-transparent text-white/50 hover:text-white/70"}`, children: "Pontos" }, void 0), _jsx("button", { onClick: () => setActive("valor"), className: `px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-150 cursor-pointer ${active === "valor"
                    ? "bg-green-400 text-green-900"
                    : "bg-transparent text-white/50 hover:text-white/70"}`, children: "Valor" }, void 0)] }, void 0));
}
//# sourceMappingURL=ToggleTab.js.map