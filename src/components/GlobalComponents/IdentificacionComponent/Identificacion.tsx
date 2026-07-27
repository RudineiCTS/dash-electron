
const sectionLabel =
  "text-[10px] font-semibold tracking-widest text-other-muted uppercase";

const fieldLabel =
  "text-[10px] font-medium tracking-widest text-other-muted uppercase";

const fieldControl =
  "w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-md px-3 py-2.5 text-sm text-[var(--input-text)] outline-none transition-colors focus:border-[var(--input-border-focus)]";

interface IdentificationProps{
  nome:string,
  tipo:string,
  fornecedor:string,
  dataInicio:string,
  dataFim:string,
  dataCompetencia:string
}

export function Identification(props:IdentificationProps){
    return(
      <>
      <section className="rounded-lg border border-other-border p-5">
           <h3 className={`${sectionLabel} mb-4`}>Identificação</h3>
           <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
             <div className="flex flex-col gap-1.5">
               <label className={fieldLabel}>Nome da campanha</label>
               <input
                 className={fieldControl}
                 value={props.nome}
               />
             </div>
             <div className="flex flex-col gap-1.5">
               <label className={fieldLabel}>Tipo</label>
               <select
                 className={fieldControl}
                 value={props.tipo}            
               >
                 <option value="VENDAS">VENDAS</option>
                 <option value="POSITIVACAO">POSITIVAÇÃO</option>
                 <option value="MIX">MIX DE PRODUTOS</option>
               </select>
             </div>
             <div className="flex flex-col gap-1.5">
               <label className={fieldLabel}>Fornecedor / patrocinador</label>
               <input
                 className={fieldControl}
                 value={'teste forncedor'}    
               />
             </div>
             <div className="flex flex-col gap-1.5">
               <label className={fieldLabel}>Início da vigência</label>
               <input
                 className={fieldControl}
                 value={'2026-06-01'}
               />
             </div>
             <div className="flex flex-col gap-1.5">
               <label className={fieldLabel}>Fim da vigência</label>
               <input
                 className={fieldControl}
                 value={'2026-06-30'}
               />
             </div>
             <div className="flex flex-col gap-1.5">
               <label className={fieldLabel}>Data de competência</label>
               <input
                 className={fieldControl}
                 value={'2026-06-30'}
               />
             </div>
           </div>
         </section>
    </>
    
    )
}