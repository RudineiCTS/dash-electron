import { FaArchive } from 'react-icons/fa'

export default function Home() {
  return (
    <div>
      <div className="flex flex-col bg-white w-2/5 rounded-md h-screen">
        <div className="font-bold mx-auto py-6 text-xl"> Simple PDF </div>
        <div className="flex flex-col ml-10">
          <ul className="flex flex-col gap-3">
            <li className="text-[#8A8A9A] flex gap-4 items-center">
               <FaArchive />
               Opção 1
            </li>
            <li className="text-[#8A8A9A] flex gap-4 items-center">
               <FaArchive />
               Opção 2
            </li>
                        <li className="text-[#8A8A9A] flex gap-4 items-center">
               <FaArchive />
               Opção 3
            </li>
          </ul>

        </div>
        <div className='bg-slate-600 mt-auto h-1/5 flex flex-col py-3 mx-2 rounded-md'>
          
          <div className='flex flex-col  mx-6 mt-auto  gap-2'>
          <p className='text-rose-50'>Diga o que precisa:</p>
            <input type="text" className='bg-[#E8E8EC] rounded-md'  />
          </div>
        </div>
      </div>
    </div>
  )
} 