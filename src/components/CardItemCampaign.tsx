import { formatDefaultValueReturn, TypeValue } from "../utils/formatDefaultValueReturn";

interface ICampaignCard{
    id:number;
    description:string;
    typeCampaign:string;
    status:string;
    typeMeta:number;
    valueRealizado:number;
    premio:number;
    dinamic:boolean;
    typeGoal?: TypeValue,
    typeValue?: TypeValue,
    typeAwards?: TypeValue,
    onClick?: () => void;
}
export function CampaignCard(props:ICampaignCard) {
  return (
    <div
      onClick={props.onClick}
      className="bg-[#10171f] border border-white/[0.07] rounded-[9px] p-4 flex flex-col gap-4 cursor-pointer hover:border-white/[0.15] transition-colors"
    >

      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="bg-[#21262d] text-[#8b949e] text-xs font-medium px-2 py-1 rounded-md">
          {props.id}
        </span>
        <span className="text-white font-semibold text-base">
          {props.description}
        </span>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2">
        <span className="text-[#8b949e] text-xs border border-white/[0.07] px-3 py-0.5 rounded-full">
            {props.typeMeta}
        </span>
        <span className="text-[#0d1117] text-xs font-medium bg-[#3fb950] px-3 py-0.5 rounded-full">
            {props.typeCampaign}
        </span>
        {
            props.dinamic && (
                <span className="text-[#0d1117] text-xs font-medium bg-github-lang-javascript px-3 py-0.5 rounded-full">
                    Dinâmica
                </span>
            )
        }
        
      </div>

      {/* Progress */}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between text-[10px] tracking-widest text-[#8b949e] uppercase">
          <span>Percentual Realizado</span>
          <span>Meta livre</span>
        </div>
        <div className="h-1 bg-white/10 rounded-full">
          <div className="h-1 bg-[#3fb950] rounded-full w-[12%]" />
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-8 pt-1">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] tracking-widest text-[#8b949e] uppercase">Meta</span>
          <span className="text-white font-semibold text-sm">{formatDefaultValueReturn({ TypeValue: props.typeGoal, Value: props.typeMeta })}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] tracking-widest text-[#8b949e] uppercase">Realizado</span>
          <span className="text-white font-semibold text-sm">{formatDefaultValueReturn({ TypeValue: props.typeValue, Value: props.valueRealizado })}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] tracking-widest text-[#8b949e] uppercase">Ganhando</span>
          <span className="text-[#3fb950] font-semibold text-sm">{formatDefaultValueReturn({ TypeValue: props.typeAwards, Value: props.premio })}</span>
        </div>
      </div>

    </div>
  )
}