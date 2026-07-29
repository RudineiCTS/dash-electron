const fabricantesMock = [
    {id: 1, nome:'Teste', qtdItens:612},
    {id: 2, nome:'kimberly', qtdItens:120},
    {id: 3, nome:'CCM', qtdItens:62}
]

type ItensProps = {
  id: number;
  nome: string;
  qtdItens?: number;
};

type ListCardItemProps = {
  NomeItens:string;
  itens?: ItensProps[];
  onAdicionar?: () => void;
  onRemover?: (id: number) => void;
  isEditable?: boolean;
};

export function ListCardItem({ NomeItens,itens = fabricantesMock, onAdicionar, onRemover,isEditable=false }: ListCardItemProps) {
  return (
    <div className="flex flex-1 flex-col gap-2 bg-github-bg-card p-5 rounded-lg">
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
          key={f.id}
          className="flex border border-other-border rounded-md px-4 py-3 justify-between items-center  text-xs"
        >
          <div className="flex gap-4 items-center">
            <div className="bg-other-border px-3 py-1 rounded-md">{f.id}</div>
            <strong className="text-sm">{f.nome}</strong>
          </div>
          <span className="flex gap-2 text-[--text-faint] items-center text-xs">
            {f.qtdItens} itens
            <button
              onClick={isEditable ? () => onRemover!(f.id) : undefined}              
              className="cursor-pointer"
              aria-label={`Remover ${f.nome}`}
            >
              x
            </button>
          </span>
        </div>
      ))}
    </div>
  );
}