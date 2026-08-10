import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { FiArrowLeft } from "react-icons/fi";
import { HiOutlineDocumentReport  } from "react-icons/hi";
import { StatCard } from "../components/ComponetesTelesales/CampaignDetail/StatCard";
import { FiltersBar, CampaignOption } from "../components/ComponetesTelesales/CampaignDetail/FiltersBar";
import {  PersonTableFilters } from "../components/ComponetesTelesales/CampaignDetail/PersonTable";
import { SalesFiltersBar } from "../components/ComponetesTelesales/CampaignDetail/SalesFiltersBar";
import { SalesTable, SalesTableFilters } from "../components/ComponetesTelesales/CampaignDetail/SalesTable";
import { CampaignSummary } from "../interfaces/CampaignSummary";
import { campaignSalesRowsMock } from "../mock/campaignSalesDetail";
import { formatCurrency } from "../utils/formateCurrency";
import { formatPercent } from "../utils/formatPercent";
import { exportCampaignPersonRowsToCsv, exportCampaignSalesRowsToCsv, exportCampaingTelesalesPersonRowsToCsv } from "../utils/csvExport";
import { useCampaignDetails } from "../hook/useCampaignDetails";
import { TelePersonTable } from "../components/ComponetesTelesales/CampaignDetail/TelePersonTable";
import { EmptyState } from "../components/ComponetesTelesales/EmptyCampaignSellOuts/EmptyResult";
import { AlertCircle } from "lucide-react";
import { CampaignConfigModal } from "../components/GlobalComponents/modal/ModalCampaignDetails";


interface CampaignDetailLocationState {
  summary?: CampaignSummary;
  allSummaries?: CampaignSummary[];
}

const defaultFilters: PersonTableFilters = {
  search: "",
  tipo: "todos",
  colocacao: "Todos",
  percentMin: 0,
  percentMax: 100,
};

const defaultSalesFilters: SalesTableFilters = {
  search: "",
  vendedor: "todos",
};

export default function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state as CampaignDetailLocationState) ?? {};

  const [filters, setFilters] = useState<PersonTableFilters>(defaultFilters);
  const [salesFilters, setSalesFilters] = useState<SalesTableFilters>(defaultSalesFilters);
  const [isActiveTab, setIsActiveTab] = useState<"informacoes" | "resumo">("informacoes");

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  
  const summary = state.summary;
  const allSummaries = state.allSummaries ?? (summary ? [summary] : []);

  const { campaignsDetails, campaignResumeSellOut, loadingSellOut, errorSellOut } = useCampaignDetails(Number(id), summary?.isDynamic === null || false? false: true);
  //CASE PARA FARMA--------------------------------------------------------------------
  // const allPersonRows = flattenCampaignPersonRows(campaignPersonRowsMock);
  // const tipoOptions = Array.from(new Set(campaignsDetails .map((row) => row.tipo)));
  //-----------------------------------------------------------------------------------
  const colocacaoOptions = Array.from(
    new Set(campaignsDetails.map((row) => row.ranking).filter((c): c is number => !!c))
  );

  const vendedorOptions = Array.from(
    new Set(campaignsDetails.map((row) => row.operatorName))
  );

  const campaignOptions: CampaignOption[] = allSummaries.map((s) => ({
    id: s.idCampaign,
    label: `#${s.idCampaign} · ${s.campaignDescription}`,
  }));

  function handleCampaignChange(newId: number) {
    const target = allSummaries.find((s) => s.idCampaign === newId);
    navigate(`/campaigns/details/${newId}`, { state: { summary: target, allSummaries } });
  }

  function handleClearFilters() {
    setFilters(defaultFilters);
  }

  function handleClearSalesFilters() {
    setSalesFilters(defaultSalesFilters);
  }

  function handleExportCsv() {
    exportCampaingTelesalesPersonRowsToCsv(
      campaignsDetails,
      `campanha-${id ?? summary?.idCampaign ?? "detalhe"}.csv`
    );
  }

  function handleExportSalesCsv() {
    exportCampaignSalesRowsToCsv(
      campaignResumeSellOut,
      `campanha-${id ?? summary?.idCampaign ?? "detalhe"}-vendas.csv`
    );
  }

  const handleOpenDetailsCampaign = (idCampaign: number) => {
    setSelectedCampaignId(idCampaign);
    setIsDetailsModalOpen(true);
  };

  if (!summary) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 text-github-text-muted">
        <p>Não encontramos os dados dessa campanha. Volte e selecione um card na lista.</p>
        <button
          onClick={() => navigate("/campaigns")}
          className="flex items-center gap-2 text-github-btn-green-hover hover:underline cursor-pointer"
        >
          <FiArrowLeft /> Campanhas Rodando
        </button>
      </div>
    );
  }

  const isPremiado = summary.totalAward > 0;
  
  return (
    <div className="flex flex-col h-screen">
      <header className="flex flex-col shrink-0 border-b border-other-border pb-4">
        <div className="px-6 pt-4">
          <button
            onClick={() => navigate("/campaigns")}
            className="flex items-center gap-2 text-sm text-github-text-muted hover:text-github-text transition-colors cursor-pointer mb-4"
          >
            <FiArrowLeft /> Campanhas Rodando
          </button>

          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <span className="bg-github-btn-dark text-other-muted text-xs font-medium px-2 py-1 rounded-md">
                  #{summary.idCampaign}
                </span>
                <span className="text-xs text-github-btn-green-hover tracking-[2.5px] font-medium uppercase">
                  Apuração · Informações
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-github-text">
                {summary.campaignDescription}
              </h1>
              <div className="flex items-center gap-2 text-sm text-github-text-muted">
                <span>{summary.campaignTypeDescription}</span>
                <span>·</span>
                <span>Apuração de {dayjs(summary.competenceDate).format("DD/MM/YYYY")}</span>
                <span
                  className={`text-xs font-medium px-3 py-0.5 rounded-full ${
                    isPremiado
                      ? "bg-other-green text-[#0d1117]"
                      : "border border-other-muted text-other-muted"
                  }`}
                >
                  {isPremiado ? "Premiado" : "Sem premiação"}
                  
                </span>
                <HiOutlineDocumentReport 
                  size={24} 
                  className="cursor-pointer hover:text-other-accent"
                  onClick={()=>handleOpenDetailsCampaign(summary.idCampaign)}  
                />
              </div>
            </div>

            <div className="flex flex-col items-end bg-other-card border border-white/[0.07] rounded-md px-4 py-2">
              <span className="text-[10px] tracking-widest text-other-muted uppercase">
                Data Competência
              </span>
              <strong className="text-github-text">
                {dayjs(summary.competenceDate).format("DD/MM/YYYY")}
              </strong>
            </div>
          </div>
        </div>

        <div className="flex gap-4 px-6 mt-4">
          <StatCard label="Objetivo" value={formatCurrency(summary.goalValue)} />
          <StatCard label="Valor Apurado" value={formatCurrency(summary.assessedValue)} />
          <StatCard label="% Realizado" value={formatPercent(summary.percentageAchieved)} />
          <StatCard label="Premiação Total" value={formatCurrency(summary.totalAward)} highlight />
        </div>

        <div className="flex px-6 mt-4 border-b border-white/[0.07] gap-5  text-github-text">
          <span className={
            `text-sm font-medium  border-b-2 border-github-btn-green-hover pb-2 cursor-pointer 
            ${isActiveTab === "resumo" ? "border-github-btn-green-hover text-github-btn-green-hover" : "border-transparent"}`
            }
            onClick={() => setIsActiveTab('resumo')} 
            >
            Resumo de vendas
          </span>
          <span className={
            `text-sm font-medium  border-b-2 border-github-btn-green-hover pb-2  cursor-pointer
            ${isActiveTab === "informacoes" ? "border-github-btn-green-hover text-github-btn-green-hover" : "border-transparent"}`
            }
            onClick={() => setIsActiveTab('informacoes')}
            >
              Informações detalhadas
            
          </span>
             
        </div>
      </header>

      {isActiveTab === "resumo" ? (
        <>
          <FiltersBar
            search={filters.search}
            onSearchChange={(search) => setFilters((f) => ({ ...f, search }))}
            campaignOptions={campaignOptions}
            campaignValue={summary.idCampaign}
            onCampaignChange={handleCampaignChange}            
            tipo={filters.tipo}
            onTipoChange={(tipo) => setFilters((f) => ({ ...f, tipo }))}
            colocacaoOptions={colocacaoOptions}
            colocacao={filters.colocacao}
            onColocacaoChange={(colocacao) => setFilters((f) => ({ ...f, colocacao }))}
            percentMin={filters.percentMin}
            percentMax={filters.percentMax}
            onPercentMinChange={(percentMin) => setFilters((f) => ({ ...f, percentMin }))}
            onPercentMaxChange={(percentMax) => setFilters((f) => ({ ...f, percentMax }))}
            onClearFilters={handleClearFilters}
            onExportCsv={handleExportCsv}
          />
          <TelePersonTable rows={campaignsDetails} filters={filters} />
        </>
      ) : (
        <>
          <SalesFiltersBar
            search={salesFilters.search}
            onSearchChange={(search) => setSalesFilters((f) => ({ ...f, search }))}
            campaignOptions={campaignOptions}
            campaignValue={summary.idCampaign}
            onCampaignChange={handleCampaignChange}
            vendedorOptions={vendedorOptions}
            vendedor={salesFilters.vendedor}
            onVendedorChange={(vendedor) => setSalesFilters((f) => ({ ...f, vendedor }))}
            onClearFilters={handleClearSalesFilters}
            onExportCsv={handleExportSalesCsv}
          />
          {summary?.isDynamic ? (
            <EmptyState
              icon={<AlertCircle size={32} />}
              title="Não é possível pegar informação de campanha dinâmica"
              description="Campanhas dinâmicas não possuem detalhamento de vendas disponível no momento."
            />
          ) : (
            <SalesTable rows={campaignResumeSellOut} filters={salesFilters} />
          )}
         
        </>
      )}
       {isDetailsModalOpen && (
            <CampaignConfigModal              
              data={summary}
               onCloseModal={() => setIsDetailsModalOpen(false)}
            />
          )}
    </div>
  );
}
