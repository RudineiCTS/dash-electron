import { useMemo, useState } from "react";
import { Menu } from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import MetaSelectionHeader from "../components/FieldSelectComponent";
import { HeaderComponent } from "../components/Header";
import { CenarioCopyPanel, Cenario, CopiaCenarioForm } from "../components/ContentGeneral/CopiaCenarios";
import { CommissionScenarioProvider, useCommissionScenario } from "../context/CommissionScenarioContext";
import { useResumoMetaTotalizador } from "../hook/useResumoMetaTotalizador";
import { ImportarValores } from "../components/ContentGeneral/ImportarValores";
import { calcularTotaisLote, LinhaPreview } from "../components/ContentGeneral/SharedGeneral/PreviewTableImportacao";
import { RodapeMetas } from "../components/ContentGeneral/SharedGeneral/RodapeMetas";
import { ConsultaMetasKpi } from "../components/ContentGeneral/ConsultaMetasKpi";
import { capturaMesEscolhido } from "../utils/gerarMeses";
import { ResumoMetasTelevendas } from "../interfaces/ResumoMetaTotalizador";
import { SideBar } from "../components/SideBar";
import { KpiItem, KpiSideBarPanel } from "../components/ContentGeneral/SharedGeneral/KpiSideBarPanel";
import { ParametrosMetaKpi } from "../components/ContentGeneral/ParametrosMetaKpi";
import { ModalDetalheKpi, SIDEBAR_PARA_SECAO_KPI } from "../components/ContentGeneral/SharedGeneral/ModalDetalheKpi";
import { usePermissoes } from "../hook/usePermissoes";

dayjs.locale("pt-br");

interface TabItem {
  id: number;
  label: string;
}
export const META_TABS: TabItem[] = [
  { id: 1, label: "Copiar cenário" },
  { id: 2, label: "Importar valores" },
  { id: 3, label: "Visualizar metas" },
  { id: 4, label: "Comissão KPI" },
  { id: 5, label: "Prospecção" },
  { id: 6, label: "Supervisor / Gerente" },
  { id: 7, label: "Histórico" },
];

export function General(){
    return (
        <CommissionScenarioProvider>
            <GeneralContent />
        </CommissionScenarioProvider>
    )
}

function GeneralContent(){
    const { podeUsarAba } = usePermissoes();
    // abre na primeira aba liberada para o perfil (perfil 2 só enxerga Importar valores e Visualizar metas)
    const [tabSelect, setTabSelect] = useState<TabItem>(
        () => META_TABS.find((tab) => podeUsarAba(tab.id)) ?? META_TABS[0]
    )
    const [competencia, setCompetencia] = useState<string>("Setembro / 2026");
    const [dataCometencia, setDataCompetencia] = useState<string | null>(null);
    const [tipoPessoa, setTipoPessoa] = useState<string>("SAC");
    const [linhasImportadas, setLinhasImportadas] = useState<LinhaPreview[]>([]);
    const [cenarioSelecionado, setCenarioSelecionado] = useState<Cenario | null>(null);
    const [kpiSelecionadoId, setKpiSelecionadoId] = useState<number | null>(null);
    const [buscaKpi, setBuscaKpi] = useState<string>("");
    const [reloadTokenKpi, setReloadTokenKpi] = useState(0);
    const [modalKpiAberto, setModalKpiAberto] = useState(false);
    const [secaoModalKpi, setSecaoModalKpi] = useState<string | null>(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { scenarios, loading, error, copying, copyError, copyScenario } = useCommissionScenario();
    const { resumo: resumoTotalizador } = useResumoMetaTotalizador(dataCometencia);



    const totaisLote = useMemo(() => calcularTotaisLote(linhasImportadas), [linhasImportadas]);

    const cenarios: Cenario[] = useMemo(
        () =>
            scenarios.map((s) => ({
                id: s.idScenario,
                descricao: s.scenarioDescription ?? `Cenário #${s.idScenario}`,
                dataInicio: s.startDate ?? "",
                dataFim: s.endDate ?? "",
                situacao: s.periodCompetenceStatusDescription ?? "-",
                vendedores: s.sellerCount,
                idPeridoCompetencia: s.idPeriodCompetence,
            })),
        [scenarios]
    );

    const competenciaCenarioSelecionado = useMemo(() => {
        if (!cenarioSelecionado) return "-";
        const inicio = dayjs(cenarioSelecionado.dataInicio);
        if (!inicio.isValid()) return cenarioSelecionado.descricao;
        const label = inicio.format("MMMM / YYYY");
        return label.charAt(0).toUpperCase() + label.slice(1);
    }, [cenarioSelecionado]);

    async function handleCopiar(form: CopiaCenarioForm) {
        await copyScenario({
            sourceScenarioId: form.sourceScenarioId,
            newScenarioId: form.newScenarioId,
            newPeriodCompetenceId: form.newPeriodCompetenceId,
            description: form.description,
            startDate: form.startDate,
            endDate: form.endDate,
        });
    }
    const handleAlteraCompetencia =(e:string)=>{
        setCompetencia(e);
        const data = capturaMesEscolhido(e);
        setDataCompetencia(data?.dataFim ?? null);
    }
    const handleRecarregarKpi = () => {
        console.log(cenarioSelecionado)
        setDataCompetencia(cenarioSelecionado?.dataFim ?? null)
    };
    const handleSelecionarKpiSidebar = (item: KpiItem) => {
        if (kpiSelecionadoId == null) return;
        setSecaoModalKpi(SIDEBAR_PARA_SECAO_KPI[item.label] ?? null);
        setModalKpiAberto(true);
    };

    return (
        <>
        <div className="flex w-full h-full ">
        {mobileOpen && (
            <div
                className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                onClick={() => setMobileOpen(false)}
            />
        )}
        <SideBar
         isMenuDefault={false}
         switchCampaign={()=>{}}
         className={`flex flex-col bg-other-card w-72 h-screen lg:h-auto fixed lg:static z-50 transition-transform duration-200 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
         }`}
        >
            <KpiSideBarPanel
                subtitulo={`Campanha ${tipoPessoa} · ${competencia}`}
                buscaHabilitada={tabSelect.id === 4}
                onSelecionarKpi={handleSelecionarKpiSidebar}
            />
        </SideBar>
        <div className="flex flex-col w-full min-w-0">
            <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-3 text-general-textStrong"
                aria-label="Abrir menu"
            >
                <Menu size={22} />
            </button>
            <HeaderComponent
                title="Parametrização "
                subTitle="Cadastro de metas Televendas"
                legends="Metas de Televendas"
                observation="Configuração e gravação de metas de comissão por competência e tipo de pessoa · substitui o script manual"
            />
            <div className="mx-3 flex flex-col gap-4 h-full min-w-0">
                <div className="bg-white flex flex-col gap-6 min-w-0">
                    <MetaSelectionHeader
                        competencia={competencia}
                        tipoPessoa={tipoPessoa}
                        onCompetenciaChange={(e)=>handleAlteraCompetencia(e)}
                        buscaKpi={buscaKpi}
                        onBuscaKpiChange={setBuscaKpi}
                        buscaHabilitada={tabSelect.id === 4}
                        onRecarregar={handleRecarregarKpi}
                    />
                    <nav className="flex flex-nowrap items-center gap-2 border-b border-general-border px-6 py-2.5 justify-between min-w-0 overflow-x-auto [&>*]:shrink-0 [&::-webkit-scrollbar]:h-1">
                        {META_TABS.map((tab) => {
                            const isActive = tab.id === tabSelect?.id;
                            const liberada = podeUsarAba(tab.id);
                            return (
                            <button
                                key={tab.id}
                                onClick={() => liberada && setTabSelect(tab)}
                                disabled={!liberada}
                                title={liberada ? undefined : "Sem permissão para esta aba"}
                                className={`flex items-center gap-2 border-b-2 px-2.5 py-2 ${
                                isActive ? "border-general-orange" : "border-transparent"
                                } ${liberada ? "" : "opacity-40 cursor-not-allowed"}`}
                            >
                                <span
                                className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
                                    isActive
                                    ? "bg-general-indigo text-white"
                                    : "bg-general-badgeBg text-general-textMuted"
                                }`}
                                >
                                {tab.id}
                                </span>
                                <span
                                className={`text-sm ${
                                    isActive ? "font-bold text-general-textStrong" : "font-medium text-general-textMuted"
                                }`}
                                >
                                {tab.label}
                                </span>
                            </button>
                            );
                        })}
                    </nav>
                </div>
                {
                    tabSelect.id === 1 ? (
                        loading ? (
                            <p className="text-sm text-general-textMuted py-6 text-center">Carregando cenários...</p>
                        ) : error ? (
                            <p className="text-sm text-red-500 py-6 text-center">{error}</p>
                        ) : (
                            <CenarioCopyPanel
                                cenarios={cenarios}
                                onCopiar={handleCopiar}
                                copiando={copying}
                                erroCopia={copyError}
                                onCenarioSelecionado={setCenarioSelecionado}
                            />
                        )
                    ): tabSelect.id === 2 ?(
                        <ImportarValores
                            linhas={linhasImportadas}
                            onLinhasChange={setLinhasImportadas}
                        />
                    ): tabSelect.id === 3?(
                        <ConsultaMetasKpi/>
                    ): tabSelect.id === 4 ?(
                        <ParametrosMetaKpi
                            dataFim={dataCometencia}
                            busca={buscaKpi}
                            reloadToken={reloadTokenKpi}
                            onSelecionarKpi={setKpiSelecionadoId}
                        />
                    ):(<></>)
                }

                <RodapeMetas
                    competencia={competenciaCenarioSelecionado}
                    totalMetas={totaisLote.total}
                    onReprocessarPeriodo={() => console.log("reprocessar período", cenarioSelecionado)}
                    onGravarMetas={() => console.log("gravar metas", linhasImportadas)}
                    resumo={resumoTotalizador}
                />
            </div>
            </div>
        </div>
        <ModalDetalheKpi
        // modalKpiAberto, kpiSelecionadoId
            aberto={modalKpiAberto}
            idComissaoVendasKpi={kpiSelecionadoId}
            secaoInicial={secaoModalKpi}
            onFechar={() => setModalKpiAberto(false)}
        />
        </>
    )
}
