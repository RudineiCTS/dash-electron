import { IconType } from 'react-icons'  // ← importa o tipo
import { LogoApp } from './logoApp'
import { ReactNode } from 'react'
import {FiActivity, FiArchive, FiBarChart2} from 'react-icons/fi'
import { NavLink } from 'react-router-dom'
import { ButtonSideBar } from './ButtonSideBar'
import { ThemeToggle } from './ThemeToggle'
import {Lock} from "lucide-react";

export interface OptionSide{
    key:string | number,
    value: string,
    icon: IconType
    onClick?: (item:OptionSide) =>void,
    status: 'active' | 'inactive' | 'locked'
}

export interface SideBarProps{
    options: OptionSide[],
    optionActive:number,
    switchCampaign:(type:number)=>void,
    isMenuDefault:boolean,
    className?:string,
    children?: ReactNode
}
const styleButton = 'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#5c5c74] cursor-pointer transition-colors hover:bg-[#f7f7fb]';
const styleButtonActive = 'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-azul bg-azul-tint '
export function SideBar({options,className,isMenuDefault,children,switchCampaign,optionActive }:SideBarProps){
    function handleSelectOption(e:number){
        switchCampaign(e)
    }
    return(        
         <div className={`${className}`}>                        
            {
                isMenuDefault  == true ? (
                    <>
                    <div className='mt-4 w-full '>                        
                        <div className={'text-github-text-muted flex flex-col gap-2 pl-4'}>    
                           <h1 className='px-3 text-sm font-medium' >
                                <strong className='text-base'>
                                     Geral -
                                </strong>  Fn Analise 
                            </h1>
                            <div className='border-b mb-3 pb-2'>
                                <NavLink 
                                    className={({ isActive }) =>`${styleButton}${isActive ?  styleButtonActive : ''}`}                            
                                    to={"campaigns"}
                                >
                                    <FiActivity className="w-[17px] h-[17px] shrink-0 opacity-70 group-[.active]:opacity-100 group-[.active]:text-azul"/>
                                        Campanhas Rodando                                                                
                                </NavLink>
                                <NavLink 
                               className={({ isActive }) =>
                                    `${styleButton}
                                ${isActive ?  styleButtonActive : ''}`
                                    }                            
                                    to={"campaigns-advanced"}
                                >
                                    <FiBarChart2/>
                                    Relatório avançado                                                                                                            
                                </NavLink>
                            </div>                        
                            <div>
                                <h1 className='px-3 text-sm font-medium' >
                                    <strong className="text-base">
                                         Arquivos -
                                    </strong>  Fn Arquivos 
                                </h1>
                                <NavLink 
                                    className={({ isActive }) => `${styleButton} ${isActive ?  styleButtonActive : ''}`}    
                                    to={"/"}                                
                                    >
                                    <FiArchive />
                                    Campanhas Recebidas
                                </NavLink>
                            </div>    
                        </div>
                    </div>
                    <LogoApp/>
                        <div className="flex flex-col  items-center">
                            <ul className="flex flex-col gap-3 w-full items-center">
                                {options.map((e)=> 
                                    (
                                    <li>
                                        <ButtonSideBar title={e.value} typeButton={e.status} active={optionActive === e.key} onClick={()=> handleSelectOption(e.key as number)}>
                                            {
                                                e.status === 'locked' ?( <Lock size={20} color="#21262d"/>) :
                                                e.status === 'active' ?  ( <e.icon size={20} color="#fff"/>) : ""
                                            }                                        
                                        </ButtonSideBar>
                                        
                                    </li>                
                                    ))}
                            </ul>    
                        </div>
                        <div className="mt-auto mb-4 w-full flex flex-col items-center gap-3">
                            <ThemeToggle />
                            <span className='text-github-bg-hover text-sm'>@Created by rudineicts</span>
                        </div>
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