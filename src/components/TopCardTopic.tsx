interface ITopCardTopic{
    title:string;
    subtitles:string;
    value:string;
    
}
export function TopCardTopic({title,subtitles,value}:ITopCardTopic){
    return(
    <div className="flex flex-col gap-1 bg-[#10171f] border border-white/[0.07] rounded-[9px] p-4 w-full">
        <span className="text-xs font-medium tracking-widest text-white/40 uppercase">
            {title}
        </span>
        <span className="text-3xl font-semibold text-white">
            {value}
        </span>
        <span className="text-sm text-[#4ade80]/80">
            {subtitles}
        </span>
    </div>
    )
}