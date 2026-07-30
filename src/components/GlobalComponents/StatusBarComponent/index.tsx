interface StatusBarProps  {
    colorValue:string,
    labelValue:string,
    conditionCampaign:string,
    valuePercent:number,
    valueTargetPercent:number

}

export default function StatusBar(props:StatusBarProps){

    return (
        <div className="rounded-xl p-4 border  border-other-border ">
            <p className="text-xs font-semibold tracking-wide text-slate-500">
                {/* SITUAÇÃO DA CONDICIONANTE HOJE */}
                {props.labelValue}
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span
                className={`text-2xl font-bold ${
                   props.valuePercent < props.valueTargetPercent  ? 'text-red-600' : 'text-emerald-600'
                }`}
              >
                {props.valuePercent.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                %
              </span>
              <span className="text-sm text-slate-500 ">
                de {props.valuePercent.toLocaleString('pt-BR')}% exigidos ·{' '}
                { props.conditionCampaign}
              </span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-other-border">
              <div
                className={`h-full rounded-full transition-all ${
                  props.valuePercent < props.valueTargetPercent ? 'bg-red-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(props.valuePercent, 100)}%` }}
              />
              </div>
        </div>
    )
}