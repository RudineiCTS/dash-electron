import { CardItem, CardItemProps, TCampaing } from "./CardItem"


type Item =  Omit<CardItemProps, "handleClick">

interface CarouselProps{
    cardItemList: Item[],
    handleCheckCampaign: (value:TCampaing)=>void,
    className?:string
}

export function Carousel({cardItemList,handleCheckCampaign,className}:CarouselProps){
    return(
        <div className={`relative flex-1 overflow-hidden ${className}`}>        
            <div className='pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-github-bg to-transparent z-10' />        
            <div className='flex flex-col gap-4 w-full items-center overflow-y-auto h-full' >
                {cardItemList.map((item)=> (
                    <CardItem
                        title={item.title}
                        description={item.description} 
                        dateAccuracy={item.dateAccuracy}
                        dateBegin={item.dateBegin}
                        dateEnd={item.dateEnd}
                        idCampaign={item.idCampaign}                               
                        handleClick={handleCheckCampaign}
                    /> 
                ))}
            </div>
        </div>
    )
}