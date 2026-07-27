import { useState } from "react";
import { formatDefaultValueReturn, TypeValue } from "../utils/formatDefaultValueReturn";

interface ICampaignCard{
    id:number;
    description:string;
    typeCampaign:string;
    status:string;
    goalValue:number;
    valueRealizado:number;
    premio:number;
    dinamic:boolean;
    typeGoal?: TypeValue,
    typeValue?: TypeValue,
    typeAwards?: TypeValue,
    onClick?: () => void;
}
export function CampaignCard(props:ICampaignCard) {

  function PercentAvaliable(){
    if(props.goalValue === 0) return 0;
      const valuePercent = (props.valueRealizado / props.goalValue) * 100;
      return Math.min(valuePercent, 100); // trava em 100% no máximo
    
  }
  return (
    <div
      onClick={props.onClick}
      className={`bg-other-card border border-white/[0.07] rounded-[9px] p-4 flex flex-col gap-4 cursor-pointer hover:border-white/[0.15] transition-colors `}
    >

      {/* Header */}
      <div className="flex  items-center gap-3 justify-between">
        <div className="flex gap-3 items-center">          
          <span className="bg-other-badge text-other-muted text-xs font-medium px-2 py-1 rounded-md">
            #{props.id}
          </span>
          <span className="text-other-text font-semibold text-base">
            {props.description}
          </span>
        </div>
        {
          props.goalValue > 0 && props.goalValue<= props.valueRealizado &&  (

            <div className="text-github-bg-card font bg-[#e3b341] px-2 rounded-md shadow-[0_0_10px_rgba(227,179,65,0.6)] ">
              Bateu
          </div>
          )
        }
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2">
        <span className="text-other-muted text-xs border border-other-border px-3 py-0.5 rounded-full">
            {props.goalValue}
        </span>
        <span className="text-github-bg-defaullt text-xs font-medium bg-other-green px-3 py-0.5 rounded-full">
            {props.typeCampaign}
        </span>
        {
            props.dinamic && (
                <span className="text-github-bg-default text-xs font-medium bg-github-lang-javascript px-3 py-0.5 rounded-full">
                    Dinâmica
                </span>
            )
        }
        
      </div>

      {/* Progress */}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between text-[10px] tracking-widest text-other-muted uppercase">
          <span>Percentual Realizado</span>
          <span>Meta livre</span>
        </div>
        <div className="h-1 bg-other-border rounded-full">
        <div className={`h-1  rounded-full ${PercentAvaliable() === 100 ? 'bg-[#e3b341]':'bg-github-text-linkAlt'}`}
         style={{ width: `${PercentAvaliable()}%` }}        
        />
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-8 pt-1">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] tracking-widest text-other-muted uppercase">Meta</span>
          <span className="text-other-text font-semibold text-sm">{formatDefaultValueReturn({ TypeValue: props.typeGoal, Value: props.goalValue })}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] tracking-widest text-other-muted uppercase">Realizado</span>
          <span className="text-other-text font-semibold text-sm">{formatDefaultValueReturn({ TypeValue: props.typeGoal, Value: props.valueRealizado })}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] tracking-widest text-other-muted uppercase">Ganhando</span>
          <span className="text-other-green font-semibold text-sm">{formatDefaultValueReturn({ TypeValue: props.typeAwards, Value: props.premio })}</span>
        </div>
      </div>

    </div>
  )
}