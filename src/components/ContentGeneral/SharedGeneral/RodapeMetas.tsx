import { RotateCcw, Save } from "lucide-react";
import { ResumoMetaTotalizador } from "../../../interfaces/ResumoMetaTotalizador";
import { useState } from "react";

interface RodapeMetasProps {
    competencia: string;
    totalMetas: number;
    onReprocessarPeriodo: () => void;
    onGravarMetas: () => void;
    gravando?: boolean;
    resumo?: ResumoMetaTotalizador[]
}

function formatarMoeda(valor: number): string {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

function CampoResumo({ label, valor, hasFunction ,destaque = false }: { label: string; valor: string; hasFunction?:()=>void ;destaque?: boolean }) {
    return (
        <div className={`flex flex-col gap-1 `}
            onClick={hasFunction}>
            <span className="text-[11px] font-bold uppercase tracking-wide text-general-labelText">
                {label}
            </span>
            <span className={`text-sm font-bold ${destaque ? "text-general-orange" : "text-general-textStrong"}`}>
                {valor}
            </span>
        </div>
    );
}

export function  RodapeMetas({
    competencia,
    totalMetas,
    onReprocessarPeriodo,
    onGravarMetas,
    gravando = false,
    resumo
}: RodapeMetasProps) {
    const [hidden,setHidden] = useState(true);
    return (
        <div className={`${!hidden ? 'hidden' : '' }sticky bottom-0 mt-auto flex flex-wrap items-center justify-between gap-4 rounded-t-xl border border-general-cardBorder bg-white px-6 py-4 shadow-[0_-4px_12px_rgba(0,0,0,0.04)] `}>
            <div className="flex flex-wrap items-center gap-8">
                <CampoResumo label="Competência" valor={competencia}  hasFunction={()=>setHidden(!hidden)}/>
                <div className="hidden h-8 w-px bg-general-divider sm:block" />
                {
                    !resumo  ? <CampoResumo label="sem meta" valor={formatarMoeda(totalMetas)} destaque />
                    :                    
                    resumo.map((row)=>{
                        return (
                            <>
                                <CampoResumo key={row.descricaoMetaTipo!+row.valorTotal} label={row.descricaoMetaTipo!} valor={formatarMoeda(row.valorTotal)} destaque /> 
                            </>
                        )
                    })
                }
                
                
            </div>

            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={onReprocessarPeriodo}
                    className="flex items-center gap-2 rounded-lg border border-general-buttonBorder bg-white px-4 py-2.5 text-sm font-semibold text-general-buttonText hover:bg-gray-50 cursor-pointer"
                >
                    <RotateCcw size={14} strokeWidth={2} />
                   
                </button>

                <button
                    type="button"
                    onClick={onGravarMetas}
                    disabled={gravando}
                    className="flex items-center gap-2 rounded-lg bg-general-indigo px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                >
                    <Save size={14} strokeWidth={2} />
                    {gravando ? "Gravando..." : "Gravar Metas"}
                </button>
            </div>
        </div>
    );
}
