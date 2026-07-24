import { formatCurrency } from "../utils/formateCurrency";

interface ITopCardTopic{
    title:string;
    subtitles:string;
    value: number;
    focus:boolean;
    
}
export function TopCardTopic({title,subtitles,value, focus= false}:ITopCardTopic){
    return(
    <div className="flex flex-col gap-1 bg-other-card border border-white/[0.07] rounded-[9px] p-4 w-full">
        <span className={`text-xs font-medium tracking-widest ${focus === true ? 'text-github-btn-green': 'text-other-text' } uppercase`}>
            {title}
        </span>
        <span className={`text-3xl font-semibold  ${focus === true ? 'text-github-btn-green': 'text-other-text' }`}>
            {formatCurrency(value)}
        </span>
        <span className="text-sm text-other-text">
            {subtitles}
        </span>
    </div>
    )
}