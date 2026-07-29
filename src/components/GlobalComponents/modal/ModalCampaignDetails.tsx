import { useState } from "react";
import { FiX } from "react-icons/fi";
import { Identification } from "../IdentificacionComponent/Identificacion";
import { PublicTarget } from "../PublicTargetComponent/PublicTarget";
import { TargetControl } from "../TargetControlComponent/TargetControl";
import { ItensProps, ListCardItem } from "../ListCardItemComponent/ListCardItem";
import { ItemManyProp, ListManyItens } from "../ListManyItensComponente/ListManyItens";
import { CampaignSummary } from "../../../interfaces/CampaignSummary";
import dayjs from "dayjs";
import { useParamsCampaign } from "../../../hook/useParamsCampaign";
import { exportProductsToCsv } from "../../../utils/csvExport";


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
  data: CampaignSummary;
  onSaveAndReprocess?: (data: CampaignSummary) => void;
  onCloseModal:()=>void

}


const statusStyles: Record<CampaignConfigData["status"], string> = {
  ATIVA: "bg-emerald-100 text-emerald-700",
  INATIVA: "bg-other-badge text-other-muted",
  ENCERRADA: "bg-red-100 text-red-600",
};



export function CampaignConfigModal({
  data,  
  onSaveAndReprocess,
  onCloseModal
}: CampaignConfigModalProps) {
  const [activeTab, setActiveTab] = useState<CampaignConfigTab>("informacoes");
  const [form, setForm] = useState<CampaignSummary>(data);
  const {
    clientList,
    client,
    manufactures,
    lineProducts,
    products,
    goToClientsPage,
    setClientsPageSize,
    goToProductsPage,
    setProductsPageSize,
    productsList,
    paginationClients,
    paginationProducts,
    loading
  } = useParamsCampaign(form.idCampaign);
  
  function VerifyStatusCampaign(earlyEndDate: string | null, endDate: string): "ATIVA" | "ENCERRADA" | "INATIVA" {
    const hoje = dayjs();

    if (earlyEndDate && !dayjs(earlyEndDate).isAfter(hoje, 'day')) {
      return "ENCERRADA";
    }

    if (!dayjs(endDate).isAfter(hoje, 'day')) {
      return "ENCERRADA";
    }

    return "ATIVA";
  }  
  function ShowValuesInLineString<T>(value: T[], field:keyof T, separator = ', '):string {
    return value.map((i)=> String(i[field])).join(separator)
  }
  //MAPEIA LISTA DE ITENS
  function mapManufacturesToItens():ItensProps[] {
    const mapManufactures:ItensProps[] = manufactures.map((m)=> {
        return {
          id: m.idCampaign,
          idItem: m.idManufacturer,
          nomeItem: m.name,
          isValido: m.isValid          
        }
    })
    return mapManufactures;
  }
  function mapLineProductsToItens():ItensProps[] {
    const mapLineProducts:ItensProps[] = lineProducts.map((m)=> {
        return {
          id: m.idCampaign,
          idItem: m.idProductLine,
          nomeItem: m.name,
          isValido: m.isValid          
        }
    })
    return mapLineProducts;
  }
  //MAPEIA LISTA DE MUITOS ITENS
  function mapManyProductsToIten():ItemManyProp[]{
    return productsList.map((e)=>({
      id: e.idProduct,
      ativo: e.isValid,
      descricao:e.name      
    }))
  }
  
  function mapManyClientsToIten():ItemManyProp[]{
    return clientList.map((e)=>({
      id: e.idClients,
      ativo: e.isValid,
      descricao:e.clientName,
      cidadeUF: `${e.city}/ ${e.state}`      
    }))
  }

    function handleExportCsv() {
      exportProductsToCsv(
        productsList,
        `campanha-${ form.idCampaign + " - Produtos"}.csv`
      );
    }

    

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
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide ${statusStyles[VerifyStatusCampaign(form.earlyEndDate,form.endDate)]}`}
                >
                  {VerifyStatusCampaign(form.earlyEndDate,form.endDate)}
                </span>
              </div>
              <p className="text-sm text-other-muted uppercase">
                TIPO · {form.campaignTypeDescription} · vigência {dayjs(form.startDate).format('DD/MM/YYYY')} a{" "}
                {dayjs(form.endDate).format('DD/MM/YYYY')} · competência {dayjs(form.competenceDate).format('DD/MM/YYYY')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">            
            <button
              onClick={onCloseModal}
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
                {/* {tab.count !== undefined && (
                  <span className="rounded-md bg-other-badge px-1.5 py-0.5 text-[11px] font-semibold text-other-muted">
                    {tab.count.toLocaleString("pt-BR")}
                  </span>
                )} */}
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 bg-other-bgAlternative">
          {activeTab === "informacoes" ? (
            <div className="flex flex-col gap-6 bg-other-bgAlternative">
              {/* Identificação */}
                <Identification
                    nome={form.campaignDescription}
                    dataCompetencia={form.competenceDate}
                    dataInicio={form.startDate}
                    dataFim={form.endDate}
                    fornecedor={ShowValuesInLineString(manufactures,'name')}
                    tipo={form.campaignTypeDescription}
                />

              {/* Público e abrangência / Objetivo e controle */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <PublicTarget 
                    premiados={['televendas']}
                />
                <TargetControl
                    objetivo={form.goalValue}
                    periodicidadeApuracao="Mensal"
                    prioridade={1}
                    tetoPremiacao={form.totalPot}
                />

              </div>
            </div>
          ) : activeTab === "escopo" ? (
            <div className="flex flex-col gap-6 ">
              <div className="flex gap-4 justify-between">
                  <ListCardItem
                    NomeItens="Fabricantes"
                    itens={mapManufacturesToItens()}
                    />
                  <ListCardItem
                    NomeItens="Linha Produto"
                    itens={mapLineProductsToItens()}
                  />
                </div>
                {/* lista de produtos */}
                <ListManyItens
                  headerTable={['ID','DESCRIÇÃO','CODBARRAS', 'FABRICANTES', 'AÇÃO']}
                  itens={mapManyProductsToIten()}
                  nomeList="Produtos"
                  onBuscar={()=>console.log('teste')}              
                  totalAtivos={paginationProducts.totalCount}
                  totalItens={paginationProducts.totalCount}  
                  pagination={paginationProducts}  
                  onChangePage={goToProductsPage}   
                  onExportarLista={handleExportCsv}    
                />
                {/* lista de clientes */}
                <ListManyItens
                  headerTable={['ID','NOME','CIDADE/UF', 'AÇÃO']}
                  itens={mapManyClientsToIten()}
                  nomeList="Clientes"
                  onBuscar={()=>console.log('teste')}              
                  totalAtivos={paginationClients.totalCount}
                  totalItens={paginationClients.totalCount}            
                  pagination={paginationClients} 
                  onChangePage={goToClientsPage}          
                />
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