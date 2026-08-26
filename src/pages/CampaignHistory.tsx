import { FiArrowLeft, FiCopy, FiDownload } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Button from "../components/shared/Button/ButtonComponent";
import FilterBar from "../components/ComponetesTelesales/FilterComponents/FilterCampaignHistory/FilterHistory";
import { TopCardTopic } from "../components/TopCardTopic";
import { SubTopicos } from "../components/ComponetesTelesales/SubTopicos/SubTopicos";

export function CampaignHistory(){
    const navigate = useNavigate();
    return (
        <>
         <header className="flex flex-col shrink-0 border-b border-github-border pb-4">                    
            <div className="px-6 pt-4">                         
              <div className="flex w-full items-start justify-between mb-4">
                <div className="flex flex-col gap-2">
                  <div className="flex gap-4">
                    <h1 className="font-poppins text-other-secondaryBlue font-semibold text-lg">Solfarma<span className="text-other-orange text-lg">.</span></h1> 
                    <div className="text-other-muted">|</div>
                    <h1 className='text-other-muted'>Histórico de campanhas televendas</h1>
                  </div>
                  <div className="flex items-center gap-3">

                    <span className="bg-github-btn-dark text-github-text-muted text-xs font-medium px-2 py-1 rounded-md">
                      #
                    </span>
                    <span className="text-lg text-github-btn-green-hover tracking-[2.5px] font-medium uppercase">
                      Histórico e evolução de campanhas
                    </span>
                  </div>  
                  <div className="ml-4 text-other-muted text-sm">Histórico de valores de venda e positivação em campanhas televendas</div>
                  <div className="flex gap-4">
                    <Button
                      label="Copiar Dados"
                      icon={<FiDownload/>}
                      variant={'primario'}
                      onClick={()=>{}}
                    ></Button>
                  </div>
                </div>
              </div>
            </div>                    
         </header>
         <section className=" flex flex-col items-center mt-4">
          <div className=" px-10 w-full ">      
              <FilterBar
                  competencias={[{value:"",label:""}]}
                  onApply={()=>{}}
                  tiposCampanha={[{value:"",label:""}]}                 

                  />
            </div>
            <div className="flex gap-10 mt-4 px-10 w-full ">
              <TopCardTopic
                title="Campanhas" 
                value={100}
                subtitles="14 vendas"
              />
              <TopCardTopic
                title="Campanhas" 
                value={100}
                subtitles="14 vendas"
              />
              <TopCardTopic
                title="Campanhas" 
                value={100}
                subtitles="14 vendas"
              />
              <TopCardTopic
                title="Campanhas" 
                value={100}
                subtitles="14 vendas"                
              />
            </div>
            <div className=" px-10 w-full mt-10">
              <SubTopicos
                title="Campanhas apuradas"
                valueTopic={1}
              />
            </div>
         </section>
        </>
    )
}