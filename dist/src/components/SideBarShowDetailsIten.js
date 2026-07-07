import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { DataRow } from "./ComponentControls/DataRow";
import { Divider } from "./ComponentControls/Divider";
import { Label } from "./ComponentControls/Label";
import { Tag } from "./ComponentControls/Tag";
import { Value } from "./ComponentControls/Value";
import { Chip } from "./ComponentControls/Chip";
const statusConfig = {
    ativa: { label: "Ativa", color: "#E8B84B", dot: "#E8B84B" },
    encerrada: { label: "Encerrada", color: "#4ADE80", dot: "#4ADE80" },
    rascunho: { label: "Rascunho", color: "#64748B", dot: "#64748B" },
};
export function SideBarShowDetailsIten({ campaign }) {
    const [activeTab, setActiveTab] = useState("resumo");
    const st = statusConfig[campaign.status];
    return (_jsxs("div", { children: [_jsx("link", { href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap", rel: "stylesheet" }, void 0), _jsx("div", { className: "min-h-screen bg-github-bg-card flex items-center justify-center px-8 py-8", children: _jsxs("div", { style: {
                        width: 300,
                        background: "#161B22",
                        borderRadius: "10px",
                        overflow: "hidden",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                        border: "1px solid #1E2733",
                        display: "flex",
                        flexDirection: "column",
                    }, children: [_jsxs("div", { style: {
                                padding: "20px 20px 16px",
                                borderLeft: `3px solid ${st.color}`,
                                background: "#1A2130",
                                position: "relative",
                            }, children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }, children: [_jsx(Label, { children: "Campanha ativa" }, void 0), _jsx(Tag, { active: campaign.status === "ativa", children: st.label }, void 0)] }, void 0), _jsx("div", { style: {
                                        fontFamily: "'Inter', sans-serif",
                                        fontWeight: 700,
                                        fontSize: "1.05rem",
                                        color: "#E8B84B",
                                        letterSpacing: "-0.01em",
                                        lineHeight: 1.3,
                                    }, children: campaign.name }, void 0)] }, void 0), _jsx("div", { style: { display: "flex", borderBottom: "1px solid #1E2733", background: "#161B22" }, children: ["resumo", "produtos", "clientes"].map((tab) => (_jsx("button", { onClick: () => setActiveTab(tab), style: {
                                    flex: 1,
                                    padding: "10px 0",
                                    fontSize: "0.7rem",
                                    fontWeight: 600,
                                    letterSpacing: "0.08em",
                                    textTransform: "uppercase",
                                    fontFamily: "'Inter', sans-serif",
                                    background: "transparent",
                                    border: "none",
                                    borderBottom: activeTab === tab ? `2px solid ${st.color}` : "2px solid transparent",
                                    color: activeTab === tab ? st.color : "#4A5568",
                                    cursor: "pointer",
                                    transition: "color 0.15s",
                                    marginBottom: -1,
                                }, children: tab }, tab))) }, void 0), activeTab === "resumo" && (_jsxs("div", { style: { display: "flex", flexDirection: "column" }, children: [_jsxs("div", { style: { padding: "12px 20px", display: "flex", flexDirection: "column", gap: 2 }, children: [_jsx(Label, { children: "Per\u00EDodo de apura\u00E7\u00E3o" }, void 0), _jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, marginTop: 2 }, children: [_jsx(Value, { mono: true, children: campaign.periodo.inicio }, void 0), _jsx("span", { style: { color: "#2D3748", fontSize: "0.75rem" }, children: "\u2192" }, void 0), _jsx(Value, { mono: true, children: campaign.periodo.fim }, void 0)] }, void 0)] }, void 0), _jsx(Divider, { dashed: true }, void 0), _jsx(DataRow, { label: "Meta", value: campaign.meta, mono: true }, void 0), _jsx(Divider, {}, void 0), _jsx(DataRow, { label: "Valor a receber da ind\u00FAstria", value: campaign.valorIndustria, mono: true }, void 0), _jsx(Divider, {}, void 0), _jsx(DataRow, { label: "Forma de recebimento", value: campaign.formaRecebimento }, void 0), _jsx(Divider, { dashed: true }, void 0), _jsxs("div", { style: { padding: "10px 20px", display: "flex", flexDirection: "column", gap: 6 }, children: [_jsx(Label, { children: "Fabricantes" }, void 0), _jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: 5, marginTop: 2 }, children: campaign.fabricantes.map((f) => _jsx(Chip, { children: f }, f)) }, void 0)] }, void 0), _jsx(Divider, {}, void 0), _jsxs("div", { style: { padding: "10px 20px", display: "flex", flexDirection: "column", gap: 6 }, children: [_jsx(Label, { children: "Produtos" }, void 0), _jsx("div", { style: { display: "flex", flexDirection: "column", gap: 3, marginTop: 2 }, children: campaign.produtos.map((p) => (_jsxs("span", { style: { fontSize: "0.8rem", color: "#94A3B8", fontFamily: "'Inter', sans-serif" }, children: ["\u00B7 ", p] }, p))) }, void 0)] }, void 0), _jsx(Divider, { dashed: true }, void 0), _jsxs("div", { style: { padding: "10px 20px 16px", display: "flex", flexDirection: "column", gap: 6 }, children: [_jsx(Label, { children: "Anexos" }, void 0), _jsxs("div", { style: { display: "flex", gap: 6, marginTop: 4 }, children: [_jsx(Tag, { active: campaign.anexoProduto, children: "Produto" }, void 0), _jsx(Tag, { active: campaign.anexoCliente, children: "Cliente" }, void 0)] }, void 0)] }, void 0)] }, void 0)), activeTab === "produtos" && (_jsx("div", { style: { padding: "20px", display: "flex", flexDirection: "column", gap: 10 }, children: campaign.produtos.map((p, i) => (_jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#1A2130", borderRadius: 6, border: "1px solid #1E2733" }, children: [_jsx("div", { style: { width: 6, height: 6, borderRadius: "50%", background: "#E8B84B", flexShrink: 0 } }, void 0), _jsx("span", { style: { fontSize: "0.82rem", color: "#CBD5E0", fontFamily: "'Inter', sans-serif" }, children: p }, void 0)] }, i))) }, void 0)), activeTab === "clientes" && (_jsx("div", { style: { padding: "20px", textAlign: "center" }, children: _jsx("span", { style: { fontSize: "0.8rem", color: "#4A5568", fontFamily: "'Inter', sans-serif", fontStyle: "italic" }, children: "Nenhum cliente vinculado" }, void 0) }, void 0)), _jsxs("div", { style: {
                                padding: "10px 20px",
                                borderTop: "1px solid #1E2733",
                                background: "#13191F",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }, children: [_jsx("span", { style: { fontSize: "0.65rem", color: "#2D3748", fontFamily: "'JetBrains Mono', monospace" }, children: "GS300GP \u00B7 Farma" }, void 0), _jsx("span", { style: { fontSize: "0.65rem", color: "#2D3748", fontFamily: "'JetBrains Mono', monospace" }, children: "Jun 2026" }, void 0)] }, void 0)] }, void 0) }, void 0)] }, void 0));
}
//# sourceMappingURL=SideBarShowDetailsIten.js.map