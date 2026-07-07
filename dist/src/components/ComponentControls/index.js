import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50", onClick: onClose, children: _jsxs("div", { className: "bg-github-bg-card rounded-xl p-6 w-full max-w-lg mx-4 relative", onClick: (e) => e.stopPropagation(), children: [title && (_jsxs("div", { className: "flex items-center justify-between mb-4 border-b border-gray-700 pb-3", children: [_jsx("h2", { className: "text-github-text font-medium text-lg", children: title }, void 0), _jsx("button", { onClick: onClose, className: "text-github-text-muted hover:text-github-text transition-colors", children: "\u2715" }, void 0)] }, void 0)), _jsx("div", { className: "text-github-text-muted", children: children }, void 0)] }, void 0) }, void 0));
}
//# sourceMappingURL=index.js.map