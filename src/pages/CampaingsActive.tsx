import { TopCardTopic } from "../components/TopCardTopic";
import { ToggleTab } from "../components/ToggleTab";
import { CampaignCard } from "../components/CardItemCampaign";

export default function CampaignsActive() 
{
    return(
        <div className="flex flex-col h-screen">
        <header className="flex flex-col shrink-0">
            <div className='gap-5 flex flex-col justify-start mt-6 '>                
                <div className="text-sm text-github-btn-green-hover tracking-[2.5px] px-6 font-medium">
                    APURAÇÃO
                </div>

                <div className=" border-other-badge border-b pb-3">
                    <div className="px-6">

                    <h1 className="text-xl font-extrabold text-github-text mb-2">
                        Campanhas Rodando
                    </h1>
                    <div className=" text-github-text-muted flex w-full justify-between  text-sm" >
                        9 campanhas - acompanhamento de meta, realizado e premiação
                        <div className="flex gap-4 ">
                            <div className="flex flex-col">
                                <p className=" tracking-[2.5px] uppercase text-xs">data Competência</p>
                                <strong className="text-github-text text-right">30/06/2026</strong>                        
                            </div>
                               <ToggleTab/>
                                                    
                        </div>
                    </div>
                    </div>
                </div>

            </div>
            <section className="flex  justify-around px-7 gap-7 mt-2 ">                
                <TopCardTopic
                    title="Meta Total"
                    subtitles="Objetivo das campanhas"
                    value="R$ 10.704.000,00"
                />
                <TopCardTopic
                        title="Meta Total"
                        subtitles="Objetivo das campanhas"
                        value="R$ 10.704.000,00"
                        />
                <TopCardTopic
                        title="Meta Total"
                        subtitles="Objetivo das campanhas"
                        value="R$ 10.704.000,00"
                        />
                <TopCardTopic
                        title="Meta Total"
                        subtitles="Objetivo das campanhas"
                        value="R$ 10.704.000,00"
                        />            
            </section>            
        </header>
        <main className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4 overflow-y-auto flex-1 min-h-0 ">
            
            <CampaignCard 
                description="Pampers Supersec Mega" 
                id={627} 
                dinamic={false}
                premio="1000,00"
                status="Premiado"
                tipeMeta="Livre"
                typeCampaign="Valor"
                valueRealizado="1843,00"
                />
            <CampaignCard 
                description="Pampers Supersec Mega" 
                id={627} 
                dinamic={false}
                premio="1000,00"
                status="Premiado"
                tipeMeta="Livre"
                typeCampaign="Valor"
                valueRealizado="1843,00"
                />
            <CampaignCard 
                description="Pampers Supersec Mega" 
                id={627} 
                dinamic={false}
                premio="1000,00"
                status="Premiado"
                tipeMeta="Livre"
                typeCampaign="Valor"
                valueRealizado="1843,00"
                />
            <CampaignCard 
                description="Pampers Supersec Mega" 
                id={627} 
                dinamic={false}
                premio="1000,00"
                status="Premiado"
                tipeMeta="Livre"
                typeCampaign="Valor"
                valueRealizado="1843,00"
                />
            <CampaignCard 
                description="Pampers Supersec Mega" 
                id={627} 
                dinamic={false}
                premio="1000,00"
                status="Premiado"
                tipeMeta="Livre"
                typeCampaign="Valor"
                valueRealizado="1843,00"
                />
            <CampaignCard 
                description="Pampers Supersec Mega" 
                id={627} 
                dinamic={false}
                premio="1000,00"
                status="Premiado"
                tipeMeta="Livre"
                typeCampaign="Valor"
                valueRealizado="1843,00"
                />                                                         
            <CampaignCard 
                description="Pampers Supersec Mega" 
                id={627} 
                dinamic={false}
                premio="1000,00"
                status="Premiado"
                tipeMeta="Livre"
                typeCampaign="Valor"
                valueRealizado="1843,00"
                />  
            <CampaignCard 
                description="Pampers Supersec Mega" 
                id={627} 
                dinamic={false}
                premio="1000,00"
                status="Premiado"
                tipeMeta="Livre"
                typeCampaign="Valor"
                valueRealizado="1843,00"
                />  
            <CampaignCard 
                description="Pampers Supersec Mega" 
                id={627} 
                dinamic={false}
                premio="1000,00"
                status="Premiado"
                tipeMeta="Livre"
                typeCampaign="Valor"
                valueRealizado="1843,00"
                />                                                  
            <CampaignCard 
                description="Pampers Supersec Mega" 
                id={627} 
                dinamic={false}
                premio="1000,00"
                status="Premiado"
                tipeMeta="Livre"
                typeCampaign="Valor"
                valueRealizado="1843,00"
                />  
            <CampaignCard 
                description="Pampers Supersec Mega" 
                id={627} 
                dinamic={false}
                premio="1000,00"
                status="Premiado"
                tipeMeta="Livre"
                typeCampaign="Valor"
                valueRealizado="1843,00"
                />  
            <CampaignCard 
                description="Pampers Supersec Mega" 
                id={627} 
                dinamic={false}
                premio="1000,00"
                status="Premiado"
                tipeMeta="Livre"
                typeCampaign="Valor"
                valueRealizado="1843,00"
                />  
            <CampaignCard 
                description="Pampers Supersec Mega" 
                id={627} 
                dinamic={false}
                premio="1000,00"
                status="Premiado"
                tipeMeta="Livre"
                typeCampaign="Valor"
                valueRealizado="1843,00"
                />                                                                  

            <CampaignCard 
                description="Pampers Supersec Mega" 
                id={627} 
                dinamic={false}
                premio="1000,00"
                status="Premiado"
                tipeMeta="Livre"
                typeCampaign="Valor"
                valueRealizado="1843,00"
                />                  

        </main>
    </div>
    )
}