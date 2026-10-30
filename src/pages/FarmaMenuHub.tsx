import { FiPlusSquare } from "react-icons/fi";
import { NavCard } from "../components/shared/CardNavigation";

export function FarmaMenuHub() {
    return (
        <div className='flex flex-col items-center w-full h-full p-10 gap-10'>
            <div className="flex flex-col gap-2 w-full">
                <h1 className='text-xl text-nowrap mr-4 font-bold text-github-text'>Menu inicial</h1>
                <p className='text-gray-600 text-sm'>Compass sistema · Campanha Farma</p>
                <p className='text-gray-600 text-sm'>Escolha uma opção abaixo para navegar entre os menus ou escolha na barra lateral de acesso rápido.</p>
            </div>
            <div className="flex flex-col gap-10 w-full h-full">
                <div className="flex w-full">
                    <h1 className='text-xl text-nowrap mr-4 font-bold text-github-text'>Campanha Farma</h1>
                    <div className="h-0.5 w-full bg-other-border rounded-full mt-2"></div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                    <NavCard to="/farma/inserir-campanha-dinamica" icon={FiPlusSquare} titulo="Inserir campanha dinâmica" categoria="Campanha Farma" descricao="Execute o script de apuração, confira o retorno e gere o INSERT do resultado" rodape="Acesse agora" />
                </div>
            </div>
        </div>
    )
}
