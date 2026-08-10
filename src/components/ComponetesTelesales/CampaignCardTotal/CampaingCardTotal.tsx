import { FiTrash } from "react-icons/fi"

interface CampaignCardTotalProps {
    goalValue:number,
    realizedValue:number,
    percentRealizedValue:number,
    awardsValue:number,
    name:string,
    dateCompetency:string,
    idCampaign:number,
    typeCampaign:string
}

export function CampaignCardTotal(props:CampaignCardTotalProps){
    return(
       <div className="flex flex-col gap-2 bg-other-card border border-other-border rounded-[9px] flex-1 " key={props.idCampaign}>
            <div className="flex relative">
              <div className="flex flex-col p-4">
                <span className="text-[10px] font-medium tracking-widest text-[var(--text-faint)] uppercase">Campanha</span>
                <p className="text-2xl font-semibold text-github-text ">{props.name}</p>
                <span className="text-[10px] font-medium tracking-widest text-[var(--text-faint)] uppercase text-nowrap">Data Competencia</span>
                <p className="text-xl font-semibold text-github-text ">{props.dateCompetency}</p>
              </div>

              <div className="flex w-full justify-around py-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-medium tracking-widest text-[var(--text-faint)] uppercase">Objetivo</span>
                     <span className={`text-3xl font-semibold ${'1'==='' ? "text-[var(--accent)]" : "text-github-text"}`}>{props.goalValue}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-medium tracking-widest text-[var(--text-faint)] uppercase">Valor Apurado</span>
                   <span className={`text-3xl font-semibold ${'1'==='' ? "text-[var(--accent)]" : "text-github-text"}`}>{props.realizedValue}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-medium tracking-widest text-[var(--text-faint)] uppercase">% Realizado</span>
                    <span className={`text-3xl font-semibold ${'1'==='' ? "text-[var(--accent)]" : "text-github-text"}`}>{props.percentRealizedValue}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-medium tracking-widest text-[var(--text-faint)] uppercase">Premiação Total</span>
                    <span className={`text-3xl font-semibold ${'1'===''? "text-[var(--accent)]" : "text-github-text"}`}>{props.awardsValue}</span>
                  </div>
              </div>
              <div className="absolute -top-3 -left-2 bg-github-btn-green px-2 rounded-md text-white text-sm">
                {props.typeCampaign}
              </div>

              <div className="flex bg-red-900 rounded-md px-3 transition-colors duration-200 hover:bg-red-700 cursor-pointer">
                <FiTrash className="m-auto"/>
              </div>
            </div>
                  
        </div>          
    )
}