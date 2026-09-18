import { FiActivity, FiArchive, FiBarChart2, FiBook, FiGrid, FiSettings } from "react-icons/fi";
import { NavCard } from "../components/shared/CardNavigation";


export function MenuHub() {
    return (
        <div className='flex flex-col items-center  w-full h-full p-10 gap-10'>
            <div className="flex flex-col gap-2 w-full">
                <h1 className='text-xl text-nowrap mr-4 font-bold text-github-text'>Menu incial</h1>
                <p className='text-gray-600 text-sm'>Compass sistema</p>
                <p className='text-gray-600 text-sm'>Escolha uma opção abaixo para navegar entre os menus ou escolha na barra lateral de acesso rápido.</p>
            </div>
            <div className="flex flex-col gap-10 w-full h-full">
                <div className="flex w-full">
                    <h1 className='text-xl text-nowrap mr-4 font-bold text-github-text'>Analise de Campanhas</h1>
                    <div className="h-0.5 w-full bg-other-border rounded-full mt-2"></div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                    
                    <NavCard to="/campaigns" icon={FiActivity} titulo="Campanhas" categoria="Campanhas" descricao="Acesse as campanhas ativas do mês" rodape="Acesse agora" />
                    <NavCard to="/campaigns-advanced" icon={FiBarChart2} titulo="Relatório Avançado" categoria="Campanhas" descricao="Acesse o menu de relatórios avançados" rodape="Acesse agora" />
                    <NavCard to="/campaigns-history" icon={FiBook} titulo="Histórico de campanhas" categoria="Campanhas" descricao="Acesse o histórico de campanhas" rodape="Acesse agora" />
                    <NavCard to="#" icon={FiArchive} titulo="Campanhas Recebidas" categoria="Campanhas" descricao="Acesse o menu de campanhas recebidas" rodape="Indisponível" />                
                </div>
            </div>
             <div className="flex flex-col gap-10 w-full h-full">
                <div className="flex w-full">
                    <h1 className='text-xl text-nowrap mr-4 font-bold text-github-text'>Configurações de metas e comissão</h1>
                    <div className="h-0.5 w-full bg-other-border rounded-full mt-2"></div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                    <NavCard to="#" icon={FiSettings} titulo="Importação de metas/comissão" categoria="Comissão" descricao="Acesse o menu de importação de metas e comissão" rodape="Indisponível" />    
                </div>

            </div>
        </div>
    )
}