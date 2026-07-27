import { useState } from "react";
import { FiX } from "react-icons/fi";
import { Identification } from "../IdentificacionComponent/Identificacion";
import { PublicTarget } from "../PublicTargetComponent/PublicTarget";
import { TargetControl } from "../TargetControlComponent/TargetControl";

type CampaignConfigTab =
  | "informacoes"
  | "escopo"
  | "calculo"
  | "faixas"
  | "regras";

interface CampaignConfigTabDef {
  key: CampaignConfigTab;
  label: string;
  count?: number;
}

const TABS: CampaignConfigTabDef[] = [
  { key: "informacoes", label: "Informações gerais" },
  { key: "escopo", label: "Escopo", count: 2363 },
  { key: "calculo", label: "Cálculo e apuração" },
  { key: "faixas", label: "Faixas de premiação", count: 5 },
  { key: "regras", label: "Regras e validações", count: 2 },
];


interface CampaignConfigData {
  idCampaign: number;
  status: "ATIVA" | "INATIVA" | "ENCERRADA";
  nome: string;  
  tipo: string;  
  inicioVigencia: string; // dd/mm/yyyy
  fimVigencia: string; // dd/mm/yyyy
  dataCompetencia: string; // dd/mm/yyyy    
}

interface CampaignConfigModalProps {
  data: CampaignConfigData;

  onSaveAndReprocess?: (data: CampaignConfigData) => void;

}


const statusStyles: Record<CampaignConfigData["status"], string> = {
  ATIVA: "bg-emerald-100 text-emerald-700",
  INATIVA: "bg-other-badge text-other-muted",
  ENCERRADA: "bg-red-100 text-red-600",
};



export function CampaignConfigModal({
  data,  
  onSaveAndReprocess,
}: CampaignConfigModalProps) {
  const [activeTab, setActiveTab] = useState<CampaignConfigTab>("informacoes");
  const [form, setForm] = useState<CampaignConfigData>(data);



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="flex w-full max-w-5xl max-h-[92vh] flex-col overflow-hidden rounded-xl bg-other-card shadow-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between border-b border-other-border px-6 pt-5 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--accent-strong)] text-xs font-bold text-[var(--accent-strong-text)]">
              {form.idCampaign}
            </span>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-other-text">
                  Configuração da campanha
                </h2>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide ${statusStyles[form.status]}`}
                >
                  {form.status}
                </span>
              </div>
              <p className="text-sm text-other-muted">
                texte · {form.tipo} · vigência {form.inicioVigencia} a{" "}
                {form.fimVigencia} · competência {form.dataCompetencia}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">            
            <button
              onClick={()=>console.log()}
              aria-label="Fechar"
              className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--btn-secondary-border)] text-other-muted transition-colors hover:bg-[var(--btn-secondary-hover-bg)] cursor-pointer"
            >
              <FiX size={16} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex shrink-0 gap-6 border-b border-other-border px-6">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 border-b-2 py-3 text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? "border-[var(--gh-btn-green)] text-[var(--gh-btn-green)]"
                    : "border-transparent text-other-muted hover:text-other-text"
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className="rounded-md bg-other-badge px-1.5 py-0.5 text-[11px] font-semibold text-other-muted">
                    {tab.count.toLocaleString("pt-BR")}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {activeTab === "informacoes" ? (
            <div className="flex flex-col gap-6">
              {/* Identificação */}
                <Identification
                    nome="kimberly"
                    dataCompetencia="2026-06-30"
                    dataInicio="2026-01-01"
                    dataFim="2026-06-30"
                    fornecedor="Kimberly faber"
                    tipo="Vendas"                    
                />

              {/* Público e abrangência / Objetivo e controle */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <PublicTarget 
                    premiados={['Vendedor']}
                />
                <TargetControl
                    objetivo={220000}
                    periodicidadeApuracao="Mensal"
                    prioridade={1}
                    tetoPremiacao={18000}
                />

              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center py-16 text-sm text-other-muted">
              Conteúdo da aba "{TABS.find((t) => t.key === activeTab)?.label}"
              ainda não implementado.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between border-t border-other-border px-6 py-4">
          

          <div className="flex items-center gap-3">
        
            <button
            //   onClick={() => onSaveAndReprocess(form)}
              className="rounded-md bg-[var(--gh-btn-green)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--gh-btn-green-hover)] cursor-pointer"
            >
              Salvar e reapurar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}