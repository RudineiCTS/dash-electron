import { useState } from "react";
import { DataRow } from "./ComponentControls/DataRow";
import { Divider } from "./ComponentControls/Divider";
import { Label } from "./ComponentControls/Label";
import { Tag } from "./ComponentControls/Tag";
import { Campaign } from "src/interfaces/TCampaign";
import { Value } from "./ComponentControls/Value";
import { Chip } from "./ComponentControls/Chip";

const statusConfig = {
  ativa: { label: "Ativa", color: "#E8B84B", dot: "#E8B84B" },
  encerrada: { label: "Encerrada", color: "#4ADE80", dot: "#4ADE80" },
  rascunho: { label: "Rascunho", color: "#64748B", dot: "#64748B" },
};

interface SideBarShowDetailsItenProps{
    campaign:Campaign
}


export function SideBarShowDetailsIten({campaign}:SideBarShowDetailsItenProps){
    const [activeTab, setActiveTab] = useState("resumo");
    const st = statusConfig[campaign.status];
    return (
    <div>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
        rel="stylesheet"
      />
      <div className="min-h-screen bg-github-bg-card flex items-center justify-center px-8 py-8">
        <div 
          style={{
            width: 300,
            background: "#161B22",
            borderRadius: "10px",
            overflow: "hidden",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            border: "1px solid #1E2733",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "20px 20px 16px",
              borderLeft: `3px solid ${st.color}`,
              background: "#1A2130",
              position: "relative",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <Label>Campanha ativa</Label>
              <Tag active={campaign.status === "ativa"}>{st.label}</Tag>
            </div>
            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 700,
                fontSize: "1.05rem",
                color: "#E8B84B",
                letterSpacing: "-0.01em",
                lineHeight: 1.3,
              }}
            >
              {campaign.name}
            </div>
          </div>
 
          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid #1E2733", background: "#161B22" }}>
            {["resumo", "produtos", "clientes"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
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
                }}
              >
                {tab}
              </button>
            ))}
          </div>
 
          {/* Content */}
          {activeTab === "resumo" && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {/* Período */}
              <div style={{ padding: "12px 20px", display: "flex", flexDirection: "column", gap: 2 }}>
                <Label>Período de apuração</Label>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                  <Value mono>{campaign.periodo.inicio}</Value>
                  <span style={{ color: "#2D3748", fontSize: "0.75rem" }}>→</span>
                  <Value mono>{campaign.periodo.fim}</Value>
                </div>
              </div>
 
              <Divider dashed />
              <DataRow label="Meta" value={campaign.meta} mono />
              <Divider />
              <DataRow label="Valor a receber da indústria" value={campaign.valorIndustria} mono />
              <Divider />
              <DataRow label="Forma de recebimento" value={campaign.formaRecebimento} />
 
              <Divider dashed />
 
              {/* Fabricantes */}
              <div style={{ padding: "10px 20px", display: "flex", flexDirection: "column", gap: 6 }}>
                <Label>Fabricantes</Label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 2 }}>
                  {campaign.fabricantes.map((f) => <Chip key={f}>{f}</Chip>)}
                </div>
              </div>
 
              <Divider />
 
              {/* Produtos */}
              <div style={{ padding: "10px 20px", display: "flex", flexDirection: "column", gap: 6 }}>
                <Label>Produtos</Label>
                <div style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: 2 }}>
                  {campaign.produtos.map((p) => (
                    <span key={p} style={{ fontSize: "0.8rem", color: "#94A3B8", fontFamily: "'Inter', sans-serif" }}>
                      · {p}
                    </span>
                  ))}
                </div>
              </div>
 
              <Divider dashed />
 
              {/* Anexos */}
              <div style={{ padding: "10px 20px 16px", display: "flex", flexDirection: "column", gap: 6 }}>
                <Label>Anexos</Label>
                <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                  <Tag active={campaign.anexoProduto}>Produto</Tag>
                  <Tag active={campaign.anexoCliente}>Cliente</Tag>
                </div>
              </div>
            </div>
          )}
 
          {activeTab === "produtos" && (
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 10 }}>
              {campaign.produtos.map((p, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#1A2130", borderRadius: 6, border: "1px solid #1E2733" }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#E8B84B", flexShrink: 0 }} />
                  <span style={{ fontSize: "0.82rem", color: "#CBD5E0", fontFamily: "'Inter', sans-serif" }}>{p}</span>
                </div>
              ))}
            </div>
          )}
 
          {activeTab === "clientes" && (
            <div style={{ padding: "20px", textAlign: "center" }}>
              <span style={{ fontSize: "0.8rem", color: "#4A5568", fontFamily: "'Inter', sans-serif", fontStyle: "italic" }}>
                Nenhum cliente vinculado
              </span>
            </div>
          )}
 
          {/* Footer */}
          <div
            style={{
              padding: "10px 20px",
              borderTop: "1px solid #1E2733",
              background: "#13191F",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "0.65rem", color: "#2D3748", fontFamily: "'JetBrains Mono', monospace" }}>
              GS300GP · Farma
            </span>
            <span style={{ fontSize: "0.65rem", color: "#2D3748", fontFamily: "'JetBrains Mono', monospace" }}>
              Jun 2026
            </span>
          </div>
        </div>
      </div>
    </div>
    )
}