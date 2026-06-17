import { FaArchive } from 'react-icons/fa'
import { OptionSide, SideBar } from '../components/SideBar'

const items: OptionSide[] = [
  { key: 1, value: 'Campanha Televendas', icon: FaArchive },
  { key: 2, value: 'Campanha Comercial', icon: FaArchive },
]
export default function Home() {
  return (
    <div className='flex h-screen w-screen overflow-hidden'>
      <SideBar
        options={items}        
      />


      <section className='flex flex-col justify-center items-center gap-3'>
      <h1 className='text-2xl font-bold text-github-text'>Campanhas que chegaram!</h1>
      <div className='mb-4'>
        <ul className='flex gap-3 text-sm text-github-text-muted'>
          <li className='bg-github-btn-green rounded-full px-2 text-github-text'>Abril</li>
          <li className='bg-github-btn-green rounded-full px-2 text-github-text'>Maio</li>
          <li className='bg-github-btn-green-hover rounded-full px-2 scale-125 text-github-text'>junho</li>
          <li className='bg-github-btn-green rounded-full px-2 text-github-text'>Julho</li>
          <li className='bg-github-btn-green rounded-full px-2 text-github-text'>Agosto</li>
        </ul>
      </div>
        <div className='bg-github-bg-card '>
          <h1>Campanha Cremer</h1>
          <span>
            <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Accusamus mollitia aliquid dolore sint, delectus enim! Inventore autem iste nihil delectus. Qui voluptas ea esse reiciendis tempore aliquid nihil hic accusamus?</p>
          </span>
        </div>

      </section>

        
      
    </div>
  )
} 
