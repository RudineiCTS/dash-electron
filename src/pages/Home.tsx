import dayjs from 'dayjs'
import {MdCampaign} from 'react-icons/md'
import { OptionSide } from '../components/SideBar'
import { useState } from 'react';
import { useCampaign } from '../hook/useCampaign';
import {getUltimoDiaDoMes} from '../utils/getLastDayInMonth'
import InBuildingComponent from '../components/InBuildingComponent/InBuildingComponent';


export const items: OptionSide[] = [
  { key: 1, value: 'Campanha Televendas', icon: MdCampaign,status:'active'  },
  { key: 2, value: 'Campanha Comercial', icon: MdCampaign,status:'locked'  },
]

const dataReferencia = dayjs()
  .subtract(1, 'month')   // volta um mês
  .endOf('month')         // vai pro último dia desse mês
  .format('YYYY-MM-DD');
export default function Home() {
  const meses = ["Abril", "Maio", "Junho", "Julho", "setembto"];
  const [ativo, setAtivo] = useState("Junho");
  const [date, setDate] = useState(dayjs(dataReferencia).format('YYYY-MM-DD'))
  const { campaigns, loading, error } = useCampaign({dateCompetency:date});

  function handleCheckCampaign(e:any){
    console.log(e)
  }
  function handleChangeMonthCampaign(e:string){
    const year = dayjs().year();
    const data = getUltimoDiaDoMes(e, year)
    setDate(data);
  }
  return (
    <div className='flex h-screen overflow-hidden'>
      
      {/* <SideBar
        isMenuDefault={true}
        options={items}     
        className={`flex flex-col bg-github-bg-card w-80 max-w-80 rounded-md h-screen`}
        className='flex h-screen w-screen overflow-hidden max-h-screen justify-between'
      /> */}

      <section className='flex flex-col flex-1 mx-36  h-screen overflow-y-auto py-8'>
        <div className='flex flex-col gap-6 mb-8 '>
          <h1 className='text-2xl font-bold text-github-text text-center'>Campanhas que chegaram!</h1>
          <div className='self-center'>
            <ul className="flex gap-2 text-sm">
              {meses.map((mes) => (
                <li
                key={mes}
                onClick={() => handleChangeMonthCampaign(mes)}
                className={`rounded-full px-4 py-1 border border-other-border text-sm font-medium transition-all cursor-pointer
                  ${ativo === mes ? "bg-github-text-linkAlt text-white" : "text-other-green hover:bg-green-50"}`}      
                  >
                  {mes}
                </li>
              ))}
            </ul>
          </div>
        </div>
        {/* <Carousel
          key={1}
          cardItemList={campaigns}
          handleCheckCampaign={handleCheckCampaign}
          
        /> */}
        <InBuildingComponent 
          titulo='Construção'
          descricao='Esta pagina será um hub, onde mostrara todas as campanhas recebidas do mês, com seus respectivos status, metas e premiações. Em breve estará disponível.'
          key={'Building'}
          progresso={50}
        
        />
      </section>         
         {/* <SideBarShowDetailsIten campaign={campanhaDetalhe}/> */}
      
    </div>
  )
} 
