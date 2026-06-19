import { FaArchive} from 'react-icons/fa'
import {MdCampaign} from 'react-icons/md'
import { OptionSide, SideBar } from '../components/SideBar'
import { useState } from 'react';
import {campanhas} from '../mock/campaign'
import { Carousel } from '../components/Carousel';
import { TCampaing } from '../components/CardItem';


const items: OptionSide[] = [
  { key: 1, value: 'Campanha Televendas', icon: MdCampaign },
  { key: 2, value: 'Campanha Comercial', icon: MdCampaign },
]


export default function Home() {
  const meses = ["Abril", "Maio", "Junho", "Julho", "setembto"];
  const [ativo, setAtivo] = useState("Junho");
  
  function handleCheckCampaign(e:TCampaing){
    console.log(e)
  }
  return (
    <div className='flex h-screen w-screen overflow-hidden max-h-screen justify-between'>
      
      <SideBar
        isMenuDefault={true}
        options={items}     
        className={`flex flex-col bg-github-bg-card w-80 max-w-80 rounded-md h-screen`}
      />

      <section className='flex flex-col  mx-36  h-screen overflow-y-auto py-8'>
        <div className='flex flex-col gap-6 mb-8 '>
          <h1 className='text-2xl font-bold text-github-text text-center'>Campanhas que chegaram!</h1>
          <div className='self-center'>
            <ul className="flex gap-2 text-sm">
              {meses.map((mes) => (
                <li
                key={mes}
                onClick={() => setAtivo(mes)}
                className={`rounded-full px-4 py-1 border border-green-600 text-sm font-medium transition-all cursor-pointer
                  ${ativo === mes ? "bg-green-600 text-white" : "text-green-600 hover:bg-green-50"}`}      
                  >
                  {mes}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <Carousel
          cardItemList={campanhas}
          handleCheckCampaign={handleCheckCampaign}
          
        />
      </section>

      <SideBar
        isMenuDefault={true}
        options={items}     
        className={`flex flex-col bg-github-bg-card w-80 max-w-80 rounded-md h-screen`}
      />
      
    </div>
  )
} 
