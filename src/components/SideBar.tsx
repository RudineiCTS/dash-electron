import { IconType } from 'react-icons'  // ← importa o tipo
import { LogoApp } from './logoApp'
import { ReactNode } from 'react'

export interface OptionSide{
    key:string | number,
    value: string,
    icon: IconType
    onClick?: (item:OptionSide) =>void
}

export interface SideBarProps{
    options: OptionSide[],
    className?:string,
    isMenuDefault:boolean,
    children?: ReactNode
}

export function SideBar({options,className,isMenuDefault,children }:SideBarProps){
    return(
        
         <div className={`${className}`}>
            
            
            {
                isMenuDefault  == true ? (
                    <>
                    <LogoApp/>
                        <div className="flex flex-col  items-center">
                            <ul className="flex flex-col gap-3 w-full items-center">
                                {options.map((e)=> 
                                    (
                                    <li 
                                    key={e.key} 
                                    onClick={()=> e.onClick ? e.onClick(e) : undefined}
                                    className="text-[#8A8A9A] flex gap-4 items-center text-sm bg-github-border w-4/5 py-3 rounded-xl px-3 mb-4 cursor-pointer
                                        hover:text-github-text hover:bg-github-btn-green-hover transition-all duration-200
                                    ">
                                        <e.icon size={20} color="#21262d"/>
                                        {e.value}
                                    </li>                
                                    ))}
                            </ul>    
                        </div>
                        <span className='text-github-bg-hover text-sm mt-8'>@Created by rudineicts</span>
                    </>
                ):(
                    <>
                     {children}
                    </>
                )
            
            
            }

        </div>
        
    )
}