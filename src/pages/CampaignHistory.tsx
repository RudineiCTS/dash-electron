import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { FiDownload } from "react-icons/fi";
import Button from "../components/shared/Button/ButtonComponent";
import FilterBar, { CampaignFilters } from "../components/ComponetesTelesales/FilterComponents/FilterCampaignHistory/FilterHistory";
import { TopCardTopic } from "../components/TopCardTopic";
import { SubTopicos } from "../components/ComponetesTelesales/SubTopicos/SubTopicos";
import CampanhasApuradasTable, { CampanhaApurada, TipoCampanha } from "../components/ComponetesTelesales/TableComponent/CampanhasApuradasTable";
import { useCampaignResultGoalReport } from "../hook/useCampaignResultGoalReport";
import { CampaignResultGoalReportFilter } from "../interfaces/CampaignResultGoalReport";
import { formatCurrency } from "../utils/formateCurrency";

const TIPOS_CAMPANHA = [
  { value: "vendas", label: "Vendas" },
  { value: "positivacao", label: "Positivação" },
];

function gerarCompetencias(qtdMeses = 12) {
  const hoje = dayjs();
  return Array.from({ length: qtdMeses }, (_, i) => {
    const data = hoje.subtract(i, "month").startOf("month");
    return { value: data.format("YYYY-MM-DD"), label: data.format("MMMM/YYYY") };
  });
}

export function CampaignHistory(){
    const [filtros, setFiltros] = useState<CampaignFilters | null>(null);
    const competencias = useMemo(() => gerarCompetencias(), []);

    const filtroApi: CampaignResultGoalReportFilter | null = useMemo(() => {
      if (!filtros) return null;
      return {
        competenceMonth: filtros.competencia || undefined,
        campaignName: filtros.nomeCampanha || undefined,
      };
    }, [filtros]);

    const { campaignResultGoalReport, error, setError } = useCampaignResultGoalReport(filtroApi);

    const campanhasFiltradas = useMemo(() => {
      if (!filtros?.tipoCampanha) return campaignResultGoalReport;
      const tipoAlvo = filtros.tipoCampanha === "vendas" ? "VENDAS" : "POSITIVAÇÃO";
      return campaignResultGoalReport.filter((c) => c.campaignTypeDescription === tipoAlvo);
    }, [campaignResultGoalReport, filtros]);

    const campanhas: CampanhaApurada[] = useMemo(() =>
      campanhasFiltradas.map((c) => ({
        id: c.idCampaign ?? 0,
        descricao: c.campaignDescription ?? "",
        tipo: (c.campaignTypeDescription === "POSITIVAÇÃO" ? "positivacao" : "vendas") as TipoCampanha,
        valorApurado: c.assessedValue ?? 0,
        meta: c.goalValue,
        formato: c.campaignTypeDescription === "POSITIVAÇÃO" ? "numero" : "moeda",
      })),
      [campanhasFiltradas]
    );

    const resumo = useMemo(() => {
      const vendas = campanhasFiltradas.filter((c) => c.campaignTypeDescription === "VENDAS");
      const positivacao = campanhasFiltradas.filter((c) => c.campaignTypeDescription === "POSITIVAÇÃO");
      const somar = (rows: typeof campanhasFiltradas, campo: "assessedValue" | "goalValue") =>
        rows.reduce((total, row) => total + (row[campo] ?? 0), 0);

      const comMeta = campanhasFiltradas.filter((c) => (c.goalValue ?? 0) > 0);
      const semMeta = campanhasFiltradas.length - comMeta.length;
      const metasBatidas = comMeta.filter((c) => (c.assessedValue ?? 0) >= (c.goalValue ?? 0)).length;

      return {
        totalCampanhas: campanhasFiltradas.length,
        valorApuradoVendas: somar(vendas, "assessedValue"),
        metaVendas: somar(vendas, "goalValue"),
        apuradoPositivacao: somar(positivacao, "assessedValue"),
        qtdVendas: vendas.length,
        qtdPositivacao: positivacao.length,
        comMeta: comMeta.length,
        semMeta,
        metasBatidas,
      };
    }, [campanhasFiltradas]);

    return (
        <>
          {error && (
            <div className="absolute w-full">
              <div className="flex gap-10 items-center justify-center bg-red-300/50 backdrop-blur-sm rounded-b-md p-1 mx-4 relative text-sm">
                <h1>Erro</h1>
                <p>{error}</p>
                <div className="absolute right-4 text-xs cursor-pointer" onClick={() => setError("")}>
                  x
                </div>
              </div>
            </div>
          )}
         <header className="flex flex-col shrink-0 border-b border-github-border pb-4">
            <div className="px-6 pt-4">
              <div className="flex w-full items-start justify-between mb-4">
                <div className="flex flex-col gap-2">
                  <div className="flex gap-4">
                    <h1 className="font-poppins text-other-secondaryBlue font-semibold text-lg">Solfarma<span className="text-other-orange text-lg">.</span></h1>
                    <div className="text-other-muted">|</div>
                    <h1 className='text-other-muted'>Histórico de campanhas televendas</h1>
                  </div>
                  <div className="flex items-center gap-3">

                    <span className="bg-github-btn-dark text-github-text-muted text-xs font-medium px-2 py-1 rounded-md">
                      #
                    </span>
                    <span className="text-lg text-github-btn-green-hover tracking-[2.5px] font-medium uppercase">
                      Histórico e evolução de campanhas
                    </span>
                  </div>
                  <div className="ml-4 text-other-muted text-sm">Histórico de valores de venda e positivação em campanhas televendas</div>
                  <div className="flex gap-4">
                    <Button
                      label="Copiar Dados"
                      icon={<FiDownload/>}
                      variant={'primario'}
                      onClick={()=>{}}
                    ></Button>
                  </div>
                </div>
              </div>
            </div>
         </header>
         <section className=" flex flex-col items-center mt-4 pb-10">
          <div className=" px-10 w-full ">
              <FilterBar
                  competencias={competencias}
                  onApply={(filtrosAplicados) => setFiltros(filtrosAplicados)}
                  onClear={() => setFiltros(null)}
                  tiposCampanha={TIPOS_CAMPANHA}
                  />
            </div>
            <div className="flex gap-10 mt-4 px-10 w-full ">
              <TopCardTopic
                title="Campanhas"
                value={resumo.totalCampanhas}
                format="numero"
                accent="navy"
                subtitles={`${resumo.qtdVendas} vendas · ${resumo.qtdPositivacao} positivação`}
              />
              <TopCardTopic
                title="Valor Apurado"
                value={resumo.valorApuradoVendas}
                accent="blue"
                subtitles={`meta ${formatCurrency(resumo.metaVendas)}`}
              />
              <TopCardTopic
                title="Positivação"
                value={resumo.apuradoPositivacao}
                format="numero"
                accent="orange"
                highlightValue
                subtitles="clientes positivados no período"
              />
              <TopCardTopic
                title="Metas Batidas"
                value={resumo.metasBatidas}
                displayValue={`${resumo.metasBatidas}/${resumo.comMeta}`}
                accent="green"
                highlightValue
                subtitles={`${resumo.semMeta} campanha(s) sem meta definida`}
              />
            </div>
            <div className=" px-10 w-full mt-10 flex flex-col gap-5">
              <SubTopicos
                title="Campanhas apuradas"
                valueTopic={1}
              />
              <CampanhasApuradasTable
                campanhas={campanhas}
              />
            </div>
         </section>
        </>
    )
}
