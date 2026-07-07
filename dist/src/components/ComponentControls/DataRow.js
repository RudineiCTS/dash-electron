import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Label } from "./Label";
import { Value } from "./Value";
export function DataRow({ label, value, mono = false }) {
    const isEmpty = !value || value === "—";
    return (_jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "2px", padding: "10px 20px" }, children: [_jsx(Label, { children: label }, void 0), _jsx(Value, { mono: mono, empty: isEmpty, children: value || "Não informado" }, void 0)] }, void 0));
}
//# sourceMappingURL=DataRow.js.map