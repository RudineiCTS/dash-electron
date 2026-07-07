import { jsx as _jsx } from "react/jsx-runtime";
export function Value({ children, mono = false, empty = false }) {
    return (_jsx("span", { style: {
            fontSize: "0.85rem",
            fontWeight: empty ? 400 : 500,
            color: empty ? "#2D3748" : "#CBD5E0",
            fontFamily: mono ? "'JetBrains Mono', monospace" : "'Inter', sans-serif",
            fontStyle: empty ? "italic" : "normal",
        }, children: children }, void 0));
}
//# sourceMappingURL=Value.js.map