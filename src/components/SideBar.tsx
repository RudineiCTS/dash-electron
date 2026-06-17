import { IconType } from 'react-icons'  // ← importa o tipo

export interface OptionSide{
    key:string | number,
    value: string,
    icon: IconType
    onClick?: (item:OptionSide) =>void
}

export interface SideBarProps{
    options: OptionSide[]
}

export function SideBar({options }:SideBarProps){
    return(
        <>
         <div className="flex flex-col bg-github-bg-card w-2/5 rounded-md h-screen">
            <div className="font-bold mx-auto py-6 text-xl text-github-text"> O que tem de novo? </div>
            <div className="flex flex-col ml-10">
              <ul className="flex flex-col gap-3">
                {options.map((e)=> 
                    (
                    <li 
                    key={e.key} 
                    onClick={()=> e.onClick ? e.onClick(e) : undefined}
                    className="text-[#8A8A9A] flex gap-4 items-center text-sm">
                        <e.icon/>
                        {e.value}
                    </li>                
                    ))}
              </ul>    
            </div>                            
            </div>
        </>
    )
}