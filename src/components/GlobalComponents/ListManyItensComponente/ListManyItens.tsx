import { PaginationType } from "../../../interfaces/TParamsCampaign";
import { Pagination } from "../../PaginationComponent/Pagination";

export type ItemManyProp = {
  id: number;
  descricao: string;
  codBarras?: string;
  fabricante?: string;
  cidadeUF?:string;
  rede?:string;
  ativo: boolean;
};


type ListManyItensProps = {
  nomeList:string;
  itens: ItemManyProp[];
  headerTable:string[];
  totalItens: number;
  totalAtivos: number;  
  selecionados?: number[];
  pagination?:PaginationType;
  onToggleSelecionado?: (id: number) => void;
  onRemover?: (id: number) => void;
  onBuscar: (termo: string) => void;
  onImportarCsv?: () => void;
  onAdicionarProduto?: () => void;
  onExportarLista?: () => void;
  onLimparTodos?: () => void;
};

export function ListManyItens({
  nomeList,
  itens,
  totalItens,
  totalAtivos,
  headerTable,
  selecionados,
  pagination,
  onBuscar,  
  onExportarLista,
  onLimparTodos,
}: ListManyItensProps) {
  return (
    <div className="flex flex-col gap-4 bg-github-bg-card p-4 rounded-lg">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <span className="text-[--text-strong] font-semibold text-sm tracking-wide uppercase">
            {nomeList} Vinculados
          </span>
          <span className="text-sm text-[--text-faint]">
            {totalItens.toLocaleString("pt-BR")} {nomeList} ·{" "}
            <span className="text-[--accent]">
              {totalAtivos.toLocaleString("pt-BR")} ativos
            </span>{" "}
            {/* · {totalSemEstoque} sem estoque */}
          </span>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Buscar por ID, descrição ou EAN"
            onChange={(e) => onBuscar(e.target.value)}
            className="bg-[--input-bg] border border-[--input-border] text-[--input-text] placeholder-[--input-placeholder] 
                    rounded-md px-3 py-2 text-sm w-72 focus:outline-none focus:border-[--input-border-focus]"
          />        
          {/* <button
            // onClick={onImportarCsv}
            className="border border-[--other-border] text-[--text-strong] rounded-md px-3 py-2 text-sm hover:bg-[--gh-bg-hover] transition-colors"
          >
            Importar CSV
          </button> */}
          <button
            // onClick={onAdicionarProduto}
            disabled
            className="bg-[--gh-btn-green] text-[--gh-text] rounded-md px-4 py-2 text-sm font-medium hover:bg-[--gh-btn-green-hover] transition-colors cursor-not-allowed opacity-60"
          >
            + {nomeList}
          </button>
        </div>
      </div>

      {/* Tabela */}
      <div className="flex flex-col border border-[--other-border] rounded-md overflow-hidden">
        <div className="grid grid-cols-[40px_100px_1fr_160px_200px_100px] bg-[--other-surface] px-4 py-2 text-xs font-medium text-[--text-faint] uppercase">
          
          <span>✓</span>
          {headerTable.map((e)=> (
            <span>{e}</span>
          )
          )}
         
        </div>

        <div className="flex flex-col max-h-[200px] overflow-y-auto">
          {itens.map((iten) => {
            // const isSelecionado = selecionados.includes(iten.id);

            return (
              <div
                key={iten.id}
                className="grid grid-cols-[40px_100px_1fr_160px_200px_100px] items-center px-4 py-3 border-t border-[--other-border] text-sm"
              >
                <input
                  type="checkbox"
                  checked={true}
                //   onChange={() => onToggleSelecionado(iten.id)}
                  className="accent-[--accent] cursor-pointer"
                />
                <span className="text-github-text font-medium">{iten.id}</span>
                <strong className="text-[--text-strong]">{iten.descricao}</strong>
                <span className="text-[--text-faint]">{iten.codBarras || iten.cidadeUF}</span>
                <span className="text-[--text-faint]">{iten.fabricante || iten.rede}</span>
                <button
                //   onClick={() => onRemover(iten.id)}
                  className="text-[--text-faint] text-left hover:text-red-500 transition-colors"
                >
                  N/A
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center">
        <span className="text-sm text-[--text-faint]">
          Mostrando {itens.length} de {totalItens.toLocaleString("pt-BR")} · rolagem virtualizada
        </span>

        <div className="flex gap-2">
          { pagination && (
            <div>              
              <Pagination
                pagination={pagination}
                onPageChange={()=>{}}
              />
            </div>
          )}
         
          <button
            onClick={onExportarLista}
            className="border border-[--btn-secondary-border] text-[--btn-secondary-text] rounded-md px-4 py-2 text-sm hover:bg-[--btn-secondary-hover-bg] transition-colors"
          >
            Exportar lista
          </button>
          <button
            onClick={onLimparTodos}
            className="border border-red-200 text-red-500 rounded-md px-4 py-2 text-sm hover:bg-red-50 transition-colors"
          >
            Limpar todos
          </button>
        </div>
      </div>
    </div>
  );
}