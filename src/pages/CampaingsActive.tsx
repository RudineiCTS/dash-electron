
export default function CampaignsActive() 
{
    return(
        <div className="flex flex-col flex-1 h-screen overflow-hidden">

            <div className='h-14 pl-6 py-8 pr-5 gap-7 flex flex-col justify-start'>
                
                <div className="text-sm text-github-btn-green-hover tracking-[2.5px]">
                    APURAÇÃO
                </div>

                <div className="">
                    <h1 className="text-xl font-extrabold text-github-text mb-2">
                        Campanhas Rodando
                    </h1>
                    <div className=" text-github-text-muted flex w-full justify-between  text-sm">
                        9 campanhas - acompanhamento de meta, realizado e premiação
                        <div className="flex gap-4">
                            <div className="flex flex-col">
                                <p className=" tracking-[2.5px] uppercase text-xs">data Competência</p>
                                <strong className="text-github-text text-right">30/06/2026</strong>                        
                            </div>
                            <div className="flex border-[1px solid rgba(255,255,255,.07)] rounded-sm p-1 gap-1">
                                <span className="bg-github-bg-focus text-github-text p-1 rounded-md">Pontos</span> 
                                <span>Valor</span> 
                            </div>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    )
}