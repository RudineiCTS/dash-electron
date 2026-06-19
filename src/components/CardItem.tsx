import { useState } from "react";
import { FaCalendar, FaClock,FaDoorClosed ,  FaDoorOpen} from "react-icons/fa";

export interface TCampaing {
  description: string
  dateAccuracy: string
  dateBegin: string
  dateEnd: string
  title: string
  idCampaign: number
}


export interface CardItemProps {
  description: string
  dateAccuracy: string
  dateBegin: string
  dateEnd: string
  title: string
  idCampaign: number
  handleClick: (item: Omit<CardItemProps, "handleClick">) => void
}
export function CardItem({handleClick, ...props}:CardItemProps){
  const [isHovered, setIsHovered] = useState(false)
    return(
         <div 
            key={props.idCampaign} 
            className='bg-github-bg-card p-7 rounded-md w-full relative flex flex-col gap-1 cursor-pointer' 
            onClick={()=>handleClick(props)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            >
          <div className='absolute top-3 right-5 px-2 bg-github-lang-javascript rounded-full text-github-btn-dark font-semibold'>Farma</div>
          <div className={`absolute bottom-0 right-1  px-2 py-2  text-github-text-muted font-semibold `}>
            {isHovered ? <FaDoorOpen color="#f1e05a" /> : <FaDoorClosed />}            
          </div>
          <div className='border-solid border-s-orange-400 border-l-2 px-3'>
            <h1 className='text-github-text font-medium text-lg mb-2'>{props.title}</h1>
              <span className='flex gap-4 items-center text-github-text-muted px-2 text-sm mb-2'>
                <div className='flex gap-2 items-center'> <FaCalendar/> Data Competencia: {props.dateAccuracy}</div>
                <div className='flex gap-2 items-center'> <FaClock/> Período de apuração: {props.dateBegin} - {props.dateEnd}</div>            
              </span>
          </div>
            <p className='mx-3 text-github-text-muted'>{props.description}</p>
        </div>
    )
}