import { IconType } from 'react-icons'  // ← importa o tipo
import { LogoApp } from './logoApp'
import { ReactNode } from 'react'
import {FiActivity, FiArchive} from 'react-icons/fi'
import { NavLink } from 'react-router-dom'
export interface OptionSide{
    key:string | number,
    value: string,
    icon: IconType
    onClick?: (item:OptionSide) =>void
}

export interface SideBarProps{
    options: OptionSide[],
    optionActive:number,
    switchCampaign:(type:number)=>void,
    isMenuDefault:boolean,
    className?:string,
    children?: ReactNode
}

export function SideBar({options,className,isMenuDefault,children,switchCampaign,optionActive }:SideBarProps){
    function handleSelectOption(e:number){
        switchCampaign(e)
    }
    return(        
         <div className={`${className}`}>                        
            {
                isMenuDefault  == true ? (
                    <>
                    <div className='mt-4 w-full'>                        
                        <div className={'text-github-text-muted flex flex-col gap-4 pl-4'}>                            
                            <NavLink 
                               className={({ isActive }) =>
                                    `flex items-center gap-5 cursor-pointer
                                     bg-transparent p-2 rounded-md w-5/6
                                    hover:text-github-btn-green-hover transition duration-500
                                    ${isActive ? 'bg-other-badge p-2 rounded-md w-5/6 text-github-bg-focus' : 'text-gray-400'}`
                                }                            
                                to={"campaigns"}
                            >
                                <FiArchive />
                                Campanhas Rodando
                                
                            </NavLink>
                            <NavLink 
                                className={({ isActive }) =>
                                    `flex items-center gap-5 cursor-pointer
                                     bg-transparent p-2 rounded-md w-5/6
                                    hover:text-github-btn-green-hover transition duration-500
                                    ${isActive ? 'bg-other-badge p-2 rounded-md w-5/6 text-github-bg-focus' : 'text-gray-400'}`
                                }    
                                to={"/"}                                
                            >
                                <FiActivity />
                                Campanhas Recebidas
                            </NavLink>
                        </div>
                    </div>
                    <LogoApp/>
                        <div className="flex flex-col  items-center">
                            <ul className="flex flex-col gap-3 w-full items-center">
                                {options.map((e)=> 
                                    (
                                    <li 
                                    key={e.key} 
                                    onClick={()=> handleSelectOption(e.key as number)}
                                    className={`text-[#8A8A9A] flex gap-4 items-center text-sm 
                                        bg-github-border w-4/5 py-3 rounded-xl px-3 mb-4 cursor-pointer
                                        hover:text-github-text hover:bg-github-btn-green-hover transition-all duration-200
                                        ${optionActive === e.key && 'bg-github-btn-green-hover text-github-text'}
                                    `}>
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