import { FiAlertTriangle } from "react-icons/fi";

export type ItensProps = {
  id: number;
  idItem:number;
  nomeItem: string;
  isValido:boolean | string;
  qtdItens?: number;
};


type ListCardItemProps = {
  NomeItens:string;
  itens?: ItensProps[];
  onAdicionar?: () => void;
  onRemover?: (id: number) => void;
  isEditable?: boolean;
};

export function ListCardItem({ NomeItens,itens, onAdicionar, onRemover,isEditable=false }: ListCardItemProps) {
  return (
    <div className="flex flex-1 flex-col gap-2 bg-github-bg-card p-5 rounded-lg">
      {!itens || itens.length <= 0 
        ? ( 
            <div className="flex flex-col  h-full">
              <h1>Não possui informação de {NomeItens}</h1>
              <div className="bg-red-100 p-2 rounded-lg text-sm mt-3 text-center flex items-center justify-around border border-red-800">
                <FiAlertTriangle className="text-red-500"/>
                Não foi vinculado nenhum item para essa campanha
              </div>
            </div>
          ) :
          (
          <>
          <div className="flex justify-between mb-3">
            <span>{NomeItens} · {itens.length}</span>
            <button  
              onClick={isEditable ? onAdicionar : undefined} 
              className="text-[--text-link] border-dashed border p-2 text-sm rounded-md 
                transition-colors duration-200
                hover:border-github-btn-green  hover:text-github-btn-green-hover">
                + Adicionar
            </button>
          </div>
          {itens.map((f) => (
            <div
              key={f.idItem}
              className="flex group  border border-other-border rounded-md px-4 py-3 justify-between items-center  text-xs  relative"
            >
            <div className="flex gap-4 items-center">
              <div className="bg-other-border px-3 py-1 rounded-md">{f.idItem}</div>
              <strong className="text-sm">{f.nomeItem}</strong> 
              <div  className={`
                      absolute top-[-20px] right-0 p-1 ${f.isValido === 'N' ?'bg-other-redflag' : 'bg-other-greenflag' } rounded-t-lg text-white
                      opacity-0 translate-y-1 pointer-events-none
                      transition-all duration-200 ease-out
                      group-hover:opacity-100 group-hover:translate-y-0
              `}>
                  {f.isValido === 'S' ? "Contém" : "Não Contém"}
              </div>             
            </div>
            <span className="flex gap-2 text-[--text-faint] items-center text-xs">
            
              {f.qtdItens} 
              <button
                onClick={isEditable ? () => onRemover!(f.id) : undefined}              
                className="cursor-pointer"
                aria-label={`Remover ${f.nomeItem}`}
              >
              x
            </button>
          </span>
        </div>
      ))}
      </>
          )
      }

    </div>
  );
}