import { FiArrowLeft } from "react-icons/fi";
import Button from "../shared/Button/ButtonComponent";
import { useNavigate } from "react-router-dom";
import { ReactNode } from "react";

interface HeaderComponentProps{
    children?:ReactNode,
    title:string,
    subTitle:string,
    legends:string,
    observation:string
}

export function HeaderComponent(props:HeaderComponentProps){
    const navigate = useNavigate();
    return (
        <header className="flex flex-col shrink-0 border-b border-github-border pb-4">
            <div className="px-6 pt-4">             
              <button
                  onClick={() => navigate("/")}
                className="flex items-center gap-2 text-sm text-github-text-muted hover:text-github-text transition-colors cursor-pointer mb-4"
              >
                <FiArrowLeft /> {props.title}
              </button>

              <div className="flex w-full items-start justify-between mb-4">
                <div className="flex flex-col gap-2">
                  <div className="flex gap-4">
                    <h1 className="font-poppins text-other-secondaryBlue font-semibold text-lg">Solfarma<span className="text-other-orange text-lg">.</span></h1> 
                    <div className="text-other-muted">|</div>
                    <h1 className='text-other-muted'>{props.subTitle}</h1>
                  </div>
                  <div className="flex items-center gap-3">
                    
                    <span className="bg-github-btn-dark text-github-text-muted text-xs font-medium px-2 py-1 rounded-md">
                      #
                    </span>
                    <span className="text-lg text-github-btn-green-hover tracking-[2.5px] font-medium uppercase">
                      {props.legends}
                    </span>
                  </div>  
                  <div className="ml-4 text-other-muted text-sm">{props.observation}</div>
                  <div className="flex gap-4">
                    {
                        props?.children
                    }
                  </div>
                </div>                 
              </div>
            </div>            
        </header>
    )
}