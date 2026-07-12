import { CampaignCompetencePeriod } from "../interfaces/CampaignResume"
import { CardItem } from "./CardItem"



interface CarouselProps{
    cardItemList: CampaignCompetencePeriod[],
    handleCheckCampaign: (value:CampaignCompetencePeriod)=>void,
    className?:string
}

export function Carousel({cardItemList,handleCheckCampaign,className}:CarouselProps){
    return(
        <div className={`relative flex-1 overflow-hidden ${className}`}>        
            <div className='pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-github-bg to-transparent z-10' />        
            <div className='flex flex-col gap-4 w-full items-center overflow-y-auto h-full' >
                {cardItemList.map((item)=> (
                    <CardItem                        
                        description={item.description} 
                        competenceDate={item.competenceDate}
                        startDate={item.startDate}
                        endDate={item.endDate}
                        idCampaign={item.idCampaign}                               
                        handleClick={handleCheckCampaign}
                        campaignType={item.campaignType}
                        considersExclusives={item.considersExclusives}
                        earlyEndDate={item.earlyEndDate}
                        idAssessmentType={item.idAssessmentType}
                        idCalculationMethod={item.idCalculationMethod}
                        idCompetencePeriodStatus={item.idCompetencePeriodStatus}
                        notes={item.notes}
                        totalRanking={item.totalRanking}
                        validationRule={item.validationRule}
                        valueType={item.valueType}
                        key={item.idCampaign}

                    /> 
                ))}
            </div>
        </div>
    )
}