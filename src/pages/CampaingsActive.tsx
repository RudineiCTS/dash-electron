import { TopCardTopic } from "../components/TopCardTopic";
import { ToggleTab } from "../components/ToggleTab";
import { CampaignCard } from "../components/CardItemCampaign";
import { useCampaign } from "../hook/useCampaign";
import dayjs from "dayjs";
import { useState } from "react";


const dataReferencia = dayjs()
  .subtract(1, 'month')   // volta um mês
  .endOf('month')         // vai pro último dia desse mês
  .format('YYYY-MM-DD');
export default function CampaignsActive() {
    // const [metaTotal, setMetaTotal] = useState();
    // const [realizadoTotal, setRealizadoTotal] = useState();
    // const [percentageTotal, setpercentageTotal] = useState();
    // const [prizeAccumulated, setprizeAccumulated] = useState();

    const {summary,totalCard }= useCampaign({dateSummary:dataReferencia});

    
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
                    value={totalCard.totalMeta}
                />
                <TopCardTopic
                        title="Realizado Total"
                        subtitles="Objetivo das campanhas"
                        value={totalCard.totalValor}
                        />
                <TopCardTopic
                        title="Percentual total"
                        subtitles="Objetivo das campanhas"
                        value={totalCard.percentTotal}
                        />
                <TopCardTopic
                        title="Premiação Total"
                        subtitles="Objetivo das campanhas"
                        value={totalCard.premiacaoTotal}
                        />            
            </section>            
        </header>
        <main className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4 overflow-y-auto flex-1 min-h-0 ">
            
           {summary.map((e) => (
            <CampaignCard
                key={e.idCampaign}
                description={e.campaignDescription}
                id={e.idCampaign}
                dinamic={false}
                premio={e.totalAward}
                status={"OK"}
                tipeMeta={e.goalValue}
                typeCampaign={e.campaignTypeDescription}
                valueRealizado={e.assessedValue}
            />
            ))}
          
                  

        </main>
    </div>
    )
}