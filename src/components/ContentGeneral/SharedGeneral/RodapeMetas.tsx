import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import dayjs from "dayjs";
import { CommissionScenario } from "../../../interfaces/CommissionScenario";
import { useTotaisMetas } from "../../../hook/useTotaisMetas";
import { PainelMetasExclusivas } from "./PainelMetasExclusivas";

interface RodapeMetasProps {
    cenarios: CommissionScenario[];
    /** Período do cenário selecionado na aba "Copiar cenário": ponto de partida do rodapé. */
    periodoSugeridoId: number | null;
    /** Cenário (ID) do cenário selecionado na aba "Copiar cenário". */
    cenarioSugeridoId: number | null;
    /** Chamado depois que as metas exclusivas foram gravadas (recarrega a lista de cenários). */
    onMetasImportadas: () => void;
}

function formatarMoeda(valor: number): string {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

function CampoResumo({ label, valor, destaque = false }: { label: string; valor: string; destaque?: boolean }) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold uppercase tracking-wide text-general-labelText">
                {label}
            </span>
            <span className={`text-sm font-bold ${destaque ? "text-general-orange" : "text-general-textStrong"}`}>
                {valor}
            </span>
        </div>
    );
}

function rotuloCompetencia(cenario: CommissionScenario | null, periodoId: number | null): string {
    const inicio = cenario?.startDate ? dayjs(cenario.startDate) : null;
    if (inicio?.isValid()) {
        const texto = inicio.format("MMMM / YYYY");
        return texto.charAt(0).toUpperCase() + texto.slice(1);
    }
    return periodoId ? `Período #${periodoId}` : "-";
}

/**
 * Rodapé da tela de metas. Fechado mostra a competência e os totais de meta; clicando nele expande para cima com
 * o período e o cenário (editáveis), os totais e a importação de metas exclusivas.
 */
export function RodapeMetas({ cenarios, periodoSugeridoId, cenarioSugeridoId, onMetasImportadas }: RodapeMetasProps) {
    const [expandido, setExpandido] = useState(false);

    const inicial = useMemo(
        () => cenarios.find((c) => c.idPeriodCompetence === periodoSugeridoId) ?? null,
        [cenarios, periodoSugeridoId]
    );
    const [periodoId, setPeriodoId] = useState<number | null>(periodoSugeridoId ?? cenarios[0]?.idPeriodCompetence ?? null);
    const [cenarioId, setCenarioId] = useState<number | null>(cenarioSugeridoId ?? cenarios[0]?.idScenario ?? null);

    // escolher outro cenário na aba "Copiar cenário" muda o ponto de partida do rodapé
    useEffect(() => {
        if (periodoSugeridoId != null) setPeriodoId(periodoSugeridoId);
        if (cenarioSugeridoId != null) setCenarioId(cenarioSugeridoId);
    }, [periodoSugeridoId, cenarioSugeridoId]);

    // a lista de cenários chega depois do primeiro desenho
    useEffect(() => {
        if (periodoId == null && cenarios.length > 0) {
            setPeriodoId(cenarios[0].idPeriodCompetence);
            setCenarioId(cenarios[0].idScenario);
        }
    }, [cenarios, periodoId]);

    const cenarioDoPeriodo = cenarios.find((c) => c.idPeriodCompetence === periodoId) ?? inicial;
    const { totais, carregando, erro, recarregar } = useTotaisMetas(periodoId);

    function escolherDaLista(cenario: CommissionScenario) {
        setPeriodoId(cenario.idPeriodCompetence);
        setCenarioId(cenario.idScenario);
    }

    function aposImportar() {
        recarregar();
        onMetasImportadas();
    }

    return (
        <div className="sticky bottom-0 z-30 mt-auto">
            {expandido && (
                <div className="absolute bottom-full left-0 right-0 max-h-[78vh] overflow-auto rounded-t-xl border border-b-0 border-general-cardBorder bg-white px-6 py-5 shadow-[0_-8px_24px_rgba(0,0,0,0.10)]">
                    <PainelMetasExclusivas
                        cenarios={cenarios}
                        periodoId={periodoId}
                        cenarioId={cenarioId}
                        onPeriodoChange={setPeriodoId}
                        onCenarioChange={setCenarioId}
                        onEscolherDaLista={escolherDaLista}
                        totais={totais}
                        carregandoTotais={carregando}
                        erroTotais={erro}
                        onImportado={aposImportar}
                    />
                </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4 rounded-t-xl border border-general-cardBorder bg-white px-6 py-4 shadow-[0_-4px_12px_rgba(0,0,0,0.04)]">
                <div className="flex flex-wrap items-center gap-8">
                    <button
                        type="button"
                        onClick={() => setExpandido((v) => !v)}
                        title={expandido ? "Recolher" : "Expandir: período, cenário e metas exclusivas"}
                        className="flex items-center gap-3 text-left cursor-pointer"
                    >
                        <CampoResumo label="Competência" valor={rotuloCompetencia(cenarioDoPeriodo, periodoId)} />
                        {expandido ? <ChevronDown size={18} className="text-general-labelText" /> : <ChevronUp size={18} className="text-general-labelText" />}
                    </button>

                    <div className="hidden h-8 w-px bg-general-divider sm:block" />

                    {totais && totais.temMetas ? (
                        <>
                            <CampoResumo label="Loja virtual" valor={formatarMoeda(totais.lojaVirtual)} destaque />
                            <CampoResumo label="Setor" valor={formatarMoeda(totais.setor)} destaque />
                            <CampoResumo label="Cobertura" valor={totais.coberturaCarteira.toLocaleString("pt-BR")} destaque />
                        </>
                    ) : (
                        <CampoResumo
                            label="Totais de meta"
                            valor={carregando ? "Carregando..." : erro ? "Erro ao carregar" : "Sem metas no período"}
                        />
                    )}
                </div>

                <button
                    type="button"
                    onClick={recarregar}
                    title="Recarregar os totais"
                    className="flex items-center gap-2 rounded-lg border border-general-buttonBorder bg-white px-4 py-2.5 text-sm font-semibold text-general-buttonText hover:bg-gray-50 cursor-pointer"
                >
                    <RotateCcw size={14} strokeWidth={2} />
                </button>
            </div>
        </div>
    );
}
