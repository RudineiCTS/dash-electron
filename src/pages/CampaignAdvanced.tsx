import { FiArrowLeft, FiTrash } from "react-icons/fi";
import { Navigate } from "react-router-dom";
import { StatCard } from "../components/CampaignDetail/StatCard";
import { CampaignFiltersPanel, TabView } from "../components/ContainerFilter/ContainerFilter";
import { useState } from "react";
import { CampaignCardTotal } from "../components/CampaignCardTotal/CampaingCardTotal";

export default function CampaignsAdvanced() {
    const [activeTab, setActiveTab] = useState<TabView>("totais");
    const [name, setName] = useState("");
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);    

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
                onClick={() => {}}
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

              <CampaignFiltersPanel 
                onSearch={()=>{}} 
                startDate={startDate}
                endDate={endDate}
                onChangeStartDate={HandleChangeStartDate}
                onChangeEndDate={HandleChangeEndDate}
                name={name}
                activeTab={activeTab}
                onChangeActiveTab={HandleChangeActiveTab}
                onChangeName={HandleChangeName}
                />
            </div>
        
                <div className="flex gap-4 px-6 mt-4">
                  <StatCard label="Objetivo" value={'1000'} />
                  <StatCard label="Valor Apurado" value={'2000'} />
                  <StatCard label="% Realizado" value={'300'} />
                  <StatCard label="Premiação Total" value={'8585'} highlight />
                </div>
        
                <div className="flex px-6 mt-4 border-b border-github-border gap-5  text-github-text">
                </div>
              </header>
              <main className="flex flex-col gap-4 mx-4 mt-4 ">
               <CampaignCardTotal 
                  key={1}
                  idCampaign={1}
                  awardsValue={200}
                  dateCompetency="31/07/2026"
                  goalValue={3500}
                  name="Ache"
                  percentRealizedValue={100}
                  realizedValue={300}
                  typeCampaign={"Valor"}
               />
                 <CampaignCardTotal 
                  key={1}
                  idCampaign={1}
                  awardsValue={200}
                  dateCompetency="31/07/2026"
                  goalValue={3500}
                  name="Ache"
                  percentRealizedValue={100}
                  realizedValue={300}
                  typeCampaign={"Valor"}
               />
                 <CampaignCardTotal 
                  key={1}
                  idCampaign={1}
                  awardsValue={200}
                  dateCompetency="31/07/2026"
                  goalValue={3500}
                  name="Ache"
                  percentRealizedValue={100}
                  realizedValue={300}
                  typeCampaign={"Valor"}
               />
                 <CampaignCardTotal 
                  key={1}
                  idCampaign={1}
                  awardsValue={200}
                  dateCompetency="31/07/2026"
                  goalValue={3500}
                  name="Ache"
                  percentRealizedValue={100}
                  realizedValue={300}
                  typeCampaign={"Valor"}
               />
                 <CampaignCardTotal 
                  key={1}
                  idCampaign={1}
                  awardsValue={200}
                  dateCompetency="31/07/2026"
                  goalValue={3500}
                  name="Ache"
                  percentRealizedValue={100}
                  realizedValue={300}
                  typeCampaign={"Valor"}
               />
                 <CampaignCardTotal 
                  key={1}
                  idCampaign={1}
                  awardsValue={200}
                  dateCompetency="31/07/2026"
                  goalValue={3500}
                  name="Ache"
                  percentRealizedValue={100}
                  realizedValue={300}
                  typeCampaign={"Valor"}
               />
                 <CampaignCardTotal 
                  key={1}
                  idCampaign={1}
                  awardsValue={200}
                  dateCompetency="31/07/2026"
                  goalValue={3500}
                  name="Ache"
                  percentRealizedValue={100}
                  realizedValue={300}
                  typeCampaign={"Valor"}
               />
              </main>
        </>
    )
}