import { FiArrowLeft, FiTrash } from "react-icons/fi";
import { Navigate, useNavigate } from "react-router-dom";
import { StatCard } from "../components/CampaignDetail/StatCard";
import { CampaignFiltersPanel, TabView } from "../components/ContainerFilter/ContainerFilter";
import { useState } from "react";
import { CampaignCardTotal } from "../components/CampaignCardTotal/CampaingCardTotal";

export default function CampaignsAdvanced() {
    const [activeTab, setActiveTab] = useState<TabView>("totais");
    const [name, setName] = useState("");
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);    
    const navigate = useNavigate();
    function HandleChangeStartDate(valueDate:Date| undefined){
      setStartDate(valueDate)
    }
    function HandleChangeEndDate(valueDate:Date|undefined){
      setEndDate(valueDate);
    }
    function HandleChangeActiveTab(value:TabView){
      setActiveTab(value)
    }
    function HandleChangeName(value:string){
      setName(value)
    }
    return(
        <>
         <header className="flex flex-col shrink-0 border-b border-github-border pb-4">
            <div className="px-6 pt-4">             
              <button
                  onClick={() => navigate("/")}
                className="flex items-center gap-2 text-sm text-github-text-muted hover:text-github-text transition-colors cursor-pointer mb-4"
              >
                <FiArrowLeft /> Relatório Avançado
              </button>

              <div className="flex w-full items-start justify-between mb-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <span className="bg-github-btn-dark text-github-text-muted text-xs font-medium px-2 py-1 rounded-md">
                      #
                    </span>
                    <span className="text-xs text-github-btn-green-hover tracking-[2.5px] font-medium uppercase">
                      Apuração · Painel de Controle
                    </span>
                  </div>                                           
                </div>                                                
              </div>

            </div>
        
              
               
              </header>
              <main className="flex flex-col gap-4 mx-4 mt-4 ">
           
              </main>
        </>
    )
}