import { FiArrowLeft } from "react-icons/fi";
import { Navigate } from "react-router-dom";
import { StatCard } from "../components/CampaignDetail/StatCard";
import { InputComponent } from "../components/InputComponent/Input";
import CompetenceDatePicker from "../components/CompetenceDatePicker/CompetenceDatePicker";
import { CampaignFiltersPanel } from "../components/ContainerFilter/ContainerFilter";

export default function CampaignsAdvanced() {

    return(
        <>
         <header className="flex flex-col shrink-0 border-b border-white/[0.07] pb-4">
            <div className="px-6 pt-4">
              <button
                onClick={() => {}}
                className="flex items-center gap-2 text-sm text-github-text-muted hover:text-github-text transition-colors cursor-pointer mb-4"
              >
                <FiArrowLeft /> Relatório Avançado
              </button>        
              
              <div className="flex w-full items-start justify-between mb-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <span className="bg-[#21262d] text-[#8b949e] text-xs font-medium px-2 py-1 rounded-md">
                      #
                    </span>
                    <span className="text-xs text-github-btn-green-hover tracking-[2.5px] font-medium uppercase">
                      Apuração · Painel de Controle
                    </span>
                  </div>                                           
                </div>                                                
              </div>

              <CampaignFiltersPanel onSearch={()=>{}}/>
            </div>
        
                <div className="flex gap-4 px-6 mt-4">
                  <StatCard label="Objetivo" value={'1000'} />
                  <StatCard label="Valor Apurado" value={'2000'} />
                  <StatCard label="% Realizado" value={'300'} />
                  <StatCard label="Premiação Total" value={'8585'} highlight />
                </div>
        
                <div className="flex px-6 mt-4 border-b border-white/[0.07] gap-5  text-github-text">
                  
                     
                </div>
              </header>
        </>
    )
}