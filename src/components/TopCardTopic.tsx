import { formatCurrency } from "../utils/formateCurrency";

type Accent = "navy" | "blue" | "orange" | "green";

interface ITopCardTopic{
    title:string;
    subtitles:string;
    value: number;
    focus?:boolean;
    /** 'moeda' (padrão) formata como R$; 'numero' exibe o valor puro (ex.: contagens) */
    format?: "moeda" | "numero";
    /** sobrepõe a formatação de "value" — usado para valores não numéricos, ex.: "10/18" */
    displayValue?: string;
    /** cor da barra no topo do card */
    accent?: Accent;
    /** quando true, o valor grande usa a cor do accent em vez da cor padrão */
    highlightValue?: boolean;
    subValor?:number;
}

const ACCENT_BORDER_HEX: Record<Accent, string> = {
    navy: "#32307b",
    blue: "#2f6fed",
    orange: "#dd8100",
    green: "#1BA672",
};

const ACCENT_TEXT_CLASS: Record<Accent, string> = {
    navy: "text-[#32307b]",
    blue: "text-[#2f6fed]",
    orange: "text-[#dd8100]",
    green: "text-[#1BA672]",
};

export function TopCardTopic({
    title,
    subtitles,
    value,
    focus = false,
    format = "moeda",
    displayValue,
    accent,
    subValor,
    highlightValue = false,
}:ITopCardTopic){
    const valorTexto = displayValue ?? (format === "numero" ? value.toLocaleString("pt-BR") : formatCurrency(value));
    const corValor = focus
        ? "text-github-btn-green"
        : highlightValue && accent
            ? ACCENT_TEXT_CLASS[accent]
            : "text-other-text";
        
    const valorBess =  formatCurrency(subValor)

    return(
    <div
        className="flex flex-col gap-1 bg-other-card border border-white/[0.07] rounded-[9px] p-4 w-full"
        style={accent ? { borderTopColor: ACCENT_BORDER_HEX[accent], borderTopWidth: 3 } : undefined}
    >
        <span className={`text-xs font-medium tracking-widest ${focus === true ? 'text-github-btn-green': 'text-other-text' } uppercase`}>
            {title}
        </span>
        <span className={`text-3xl font-semibold ${corValor}`}>
            {valorTexto}
        </span>
        <span className="text-sm text-other-text">
            {subtitles}
        </span>
        {subValor &&  
                <span className="text-sm text-other-green font-bold">
                    <p className="text-other-text">Valores do Bees</p> {valorBess}
                </span>
        }

    </div>
    )
}
