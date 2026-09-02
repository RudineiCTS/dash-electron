import { TopCardTopic } from "../components/TopCardTopic";
import { ToggleTab } from "../components/ToggleTab";
import { CampaignCard } from "../components/CardItemCampaign";
import { TopCardTopicSkeleton } from "../components/Skeleton/TopCardTopicSkeleton";
import { CampaignCardSkeleton } from "../components/Skeleton/CampaignCardSkeleton";
import { useCampaign } from "../hook/useCampaign";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import CompetenceDatePicker from "../components/ComponetesTelesales/CompetenceDatePicker/CompetenceDatePicker";
import { campaignSummaryMock } from "../mock/campaignSummary";
import { DarkSelect } from "../components/shared/SelectOptionComponent/SelectOption";
import { useCampaignsFilter } from "../context/CampaignsFilterContext";

const teste = 2  as number
export default function CampaignsActive() {
    const {
        dateCompetency, setDateCompetency,
        activeTab, setActiveTab,
        filterActive, setFilterActive,
        onlyAchieved, setOnlyAchieved,
    } = useCampaignsFilter();
    const {summary,totalCard,loadingSummary }= useCampaign({dateSummary:dateCompetency});

    const navigate = useNavigate();

    function handleOpenCampaign(idCampaign:number){
        navigate(`/campaigns/details/${idCampaign}`, { state: { summary: summary.find(s => s.idCampaign === idCampaign), allSummaries: summary } });
    }

    function HandleSetDateCompetency(date:Date){
        const formattedDate = dayjs(date).format('YYYY-MM-DD');
        setDateCompetency(formattedDate);
    }
    function GetOptionDash(){
        const optionSummary = [...new Set(summary.map((e)=> e.campaignTypeDescription))]
            .map((desc) => ({value:desc, label:desc}))

        optionSummary.push({value: 'SemFiltro', label:'Sem Filtro'})
        return optionSummary
    }
    function GetAllTypeCampaign(){
        const types = [...new Set (summary.map((e)=> e.typeCampaign))]
        console.log(types)
        return types;
    }
    function HandleSetFilter(value:string){
        if(value === 'SemFiltro'){
            setFilterActive('')
        }else{
            setFilterActive(value)
        }

    }

    const optionsSummary = GetOptionDash();
    const typesCampaign = GetAllTypeCampaign(); //para a proxima atualização

    return(
        <div className="flex flex-col h-screen">
        <header className="flex flex-col shrink-0">
            <div className='gap-5 flex flex-col justify-start mt-6 '>                
                <div className="text-sm text-github-btn-green-hover tracking-[2.5px] px-6 font-medium">
                    APURAÇÃO
                </div>

                <div className=" border-other-badge border-b pb-3">
                    <div className="px-6">

                    <h1 className="text-xl font-extrabold text-github-text mb-2">
                        Campanhas Rodando
                    </h1>
                    <div className=" text-github-text-muted flex w-full justify-between  text-sm" >
                        {summary.length} campanhas - acompanhamento de meta, realizado e premiação
                        <div className="flex gap-4 ">
                            <div className="flex flex-col-reverse">
                                
                                <DarkSelect
                                    options={optionsSummary}
                                    value={filterActive}
                                    onChange={(e)=> { HandleSetFilter(e)}}
                                    placeholder="Tipo de campanha"
                                    />
                            </div>
                            <div className="flex flex-col">
                                <div className="flex ">
                                    <CompetenceDatePicker
                                        initialDate={dayjs(dateCompetency).toDate()}
                                        key={"datacompetency"}
                                        onApply={HandleSetDateCompetency}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col-reverse">
                                <button
                                    type="button"
                                    onClick={() => setOnlyAchieved((v) => !v)}
                                    className={`h-10 px-4 rounded-lg border text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                                        onlyAchieved
                                            ? "bg-github-btn-green border-github-btn-green text-white"
                                            : "border-other-border text-github-text-muted hover:text-github-text"
                                    }`}
                                >
                                    Somente bateram
                                </button>
                            </div>

                            <div>
                               <ToggleTab onChange={(tab) => setActiveTab(tab)} />
                            </div>
                                                    
                        </div>
                    </div>
                    </div>
                </div>

            </div>
            <section className="flex  justify-around px-7 gap-7 mt-2 ">
                {loadingSummary ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <TopCardTopicSkeleton key={i} />
                    ))
                ) : (
                    <>
                        <TopCardTopic
                            title="Meta Total"
                            subtitles="Objetivo das campanhas"
                            value={totalCard.totalMeta}
                            focus={false}
                        />
                        <TopCardTopic
                                title="Realizado Total"
                                subtitles="Realizado total das campanhas"
                                value={totalCard.totalValor}
                                focus={false}
                                />
                        <TopCardTopic
                                title="Percentual total"
                                subtitles="Percentual total referente ao objetivo total"
                                value={totalCard.percentTotal}
                                focus={false}
                                />
                        <TopCardTopic
                                title="Premiação Total"
                                subtitles="Premiação total de todas as campanhas do mês"
                                value={totalCard.premiacaoTotal}
                                focus={true}
                                />
                    </>
                )}
            </section>
        </header>
        <main className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4 overflow-y-auto flex-1 min-h-0 ">
            {loadingSummary ? (
                Array.from({ length: 6 }).map((_, i) => (
                    <CampaignCardSkeleton key={i} />
                ))
            ) : (
                teste === 1 ? (
                    campaignSummaryMock
                    .map((e) => (
                        <CampaignCard
                            key={e.idCampaign}
                            description={e.campaignDescription}
                            id={e.idCampaign}
                            dinamic={false}
                            premio={e.totalAward}
                            status={"OK"}
                            goalValue={e.goalValue}
                            typeCampaign={e.campaignTypeDescription}
                            valueRealizado={e.assessedValue}
                            onClick={() => handleOpenCampaign(e.idCampaign)}
                        />
                    ))
                ):
                (
                    summary
                        .filter((e) => e.typeCampaign === activeTab)
                        .filter((e)=> !filterActive || e.campaignTypeDescription === filterActive)
                        .filter((e) => !onlyAchieved || e.percentageAchieved >= 100)
                        .map((e) => (
                        <CampaignCard
                            key={e.idCampaign}
                            description={e.campaignDescription}
                            id={e.idCampaign}
                            dinamic={false}
                            premio={e.totalAward}
                            status={"OK"}
                            typeGoal={e.campaignTypeDescription === 'VENDAS'? 'Value': 'Others'}
                            goalValue={e.goalValue}
                            typeCampaign={e.campaignTypeDescription}
                            valueRealizado={e.assessedValue}
                            onClick={() => handleOpenCampaign(e.idCampaign)}
                        />
                    ))
                )
            )}
        </main>
    </div>
    )
}