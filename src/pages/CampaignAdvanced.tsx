import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiCopy,FiDownload } from "react-icons/fi";
import { FiArrowLeft } from "react-icons/fi";
import dayjs from "dayjs";
import 'dayjs/locale/pt-br'

import FiltroBar, { FiltrosValues } from "../components/ComponetesTelesales/FilterCampanhaTelevendas/FilterComponent";
import Button from "../components/shared/Button/ButtonComponent";
import PeriodoSeletor from "../components/ComponetesTelesales/PeriodSelector/PeriodoSelector";
import CardIndicador from "../components/ComponetesTelesales/CardIndicador/CardIndicador";
import { SubTopicos } from "../components/ComponetesTelesales/SubTopicos/SubTopicos";
import EvolucaoMensalSequencial, {LinhaEvolucaoMensal} from "../components/ComponetesTelesales/SequentialMonthlyTrend/SequentialMonthlyTrend";
import EvolucaoGraficoMesAMes, {PontoEvolucaoMensal} from "../components/ComponetesTelesales/GraphicTrend/GraphicTrends";
import { SellOutSummaryInterface } from "../interfaces/sellOutSummaryType";
import { useCampaignPanelAdvanced } from "../hook/useCampaignPanelAdvanced";
import { MonthlyTrendSkeleton } from "../components/Skeleton/CampaignPanelAdvancedSkeleton/MonthlyTrendSkeleton";
import DynamicReportTab from "../components/ComponetesTelesales/DynamicReport_DISABLED/DynamicReportTab";

dayjs.locale('pt-br');

type CampaignAdvancedTab = "comparativo" | "dinamico";

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function parseCodigosList(valor?: string): number[] {
  if (!valor) return [];
  return valor
    .split(';')
    .map((codigo) => codigo.trim())
    .filter(Boolean)
    .map(Number)
    .filter((codigo) => !Number.isNaN(codigo));
}

function getYearMonthKey(ano: string, mes: string): string {
  const indiceMes = MESES.indexOf(mes);
  if (indiceMes === -1) return '';
  return `${ano}-${String(indiceMes + 1).padStart(2, '0')}`;
}

export default function CampaignsAdvanced() {
    const [filtros, setFiltros] = useState<FiltrosValues>()
    const [activeTab, setActiveTab] = useState<CampaignAdvancedTab>("comparativo");
    const navigate = useNavigate();

    const anoAtual = String(dayjs().year());
    const [periodoA, setPeriodoA] = useState({ ano: anoAtual, mes: MESES[dayjs().month()] });
    const [periodoB, setPeriodoB] = useState({ ano: anoAtual, mes: MESES[dayjs().subtract(1, 'month').month()] });

    const filterData:SellOutSummaryInterface | null= useMemo(()=>{
      if(!filtros) return null
      return {
        startDate: dayjs(filtros?.dataInicio).toDate(),
        endDate: dayjs(filtros?.dataFim).toDate(),
        idManufacturer: parseCodigosList(filtros?.fabricante),
        products: [],
        productLine: parseCodigosList(filtros?.linhaProduto),
        idComissionScenario: 102,
        clients: [],
        consideraGrandesContas: filtros?.incluirGrandesContas ?? false,
    }
  },[filtros])

    const {sellOutSummary, loading, error, setError} = useCampaignPanelAdvanced(filterData ?? null);
    useEffect(() => {
      if (!error) return;

      const timer = setTimeout(() => {
        setError("");
      }, 5000); // 5 segundos, ajuste como quiser

      return () => clearTimeout(timer); // limpa o timer se error mudar antes de disparar
    }, [error]);

    function formatarMoeda(valor: number): string {
      return valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });
    }

    function calcularCrescimento(atual: number, anterior: number | undefined): number | null {
      if (anterior === undefined || anterior === 0) return null;
      return ((atual - anterior) / anterior) * 100;
    }

    const dadosSequenciaTrend: LinhaEvolucaoMensal[] = useMemo(() => {
        if (!sellOutSummary || sellOutSummary.length === 0) {
          return [];
        }

        const items = sellOutSummary ?? []

        return items.map((item, index) => {
          const dataMes = dayjs(item.yearMonth, 'YYYY-MM');
          const anterior = items[index - 1];

          return {
            mes: dataMes.format('MMMM'),
            anoMes: dataMes.format('YYYY · MM'),
            valorVendido: formatarMoeda(item.soldValue),
            positivacao: item.clientCount,
            crescValor: calcularCrescimento(item.soldValue, anterior?.soldValue),
            crescPosit: calcularCrescimento(item.clientCount, anterior?.clientCount),
          };
        });
      }, [sellOutSummary]);

    const dadosPeriodoA = useMemo(() => {
      const chave = getYearMonthKey(periodoA.ano, periodoA.mes);
      return sellOutSummary?.find((item) => item.yearMonth === chave);
    }, [sellOutSummary, periodoA]);

    const dadosPeriodoB = useMemo(() => {
      const chave = getYearMonthKey(periodoB.ano, periodoB.mes);
      return sellOutSummary?.find((item) => item.yearMonth === chave);
    }, [sellOutSummary, periodoB]);

    const comparativoValorVendido = useMemo(() => {
      const valorA = dadosPeriodoA?.soldValue ?? 0;
      const valorB = dadosPeriodoB?.soldValue ?? 0;
      const variacaoAbsoluta = valorB - valorA;
      return {
        valorA,
        valorB,
        variacaoAbsoluta,
        variacaoPercentual: calcularCrescimento(valorB, valorA) ?? 0,
      };
    }, [dadosPeriodoA, dadosPeriodoB]);

    const comparativoPositivacao = useMemo(() => {
      const clientesA = dadosPeriodoA?.clientCount ?? 0;
      const clientesB = dadosPeriodoB?.clientCount ?? 0;
      const variacaoAbsoluta = clientesB - clientesA;
      return {
        clientesA,
        clientesB,
        variacaoAbsoluta,
        variacaoPercentual: calcularCrescimento(clientesB, clientesA) ?? 0,
      };
    }, [dadosPeriodoA, dadosPeriodoB]);

    const dadosGraficoEvolucao: PontoEvolucaoMensal[] = useMemo(() => {
      if (!sellOutSummary || sellOutSummary.length === 0) {
        return [];
      }

      const items = sellOutSummary ?? [];

      return items.map((item) => {
        const dataMes = dayjs(item.yearMonth, 'YYYY-MM');
        return {
          mes: dataMes.format('YYYY MM'),
          valorVendido: item.soldValue,
          positivacao: item.clientCount,
        };
      });
    }, [sellOutSummary]);
    return(
      
        <>
          {error &&
            <div className="absolute w-full">
              <div className=" flex gap-10 items-center  justify-center bg-red-300/50 backdrop-blur-sm rounded-b-md p-1 mx-4 relative text-sm">
                <h1>Erro</h1>
                <p>{error}</p>
                <div className='absolute right-4 text-xs cursor-pointer'
                     onClick={() => setError("")}>
                    x
                </div>
              </div>
            </div>
          }
         <header className="flex flex-col shrink-0 border-b border-github-border pb-4">
            <div className="px-6 pt-4">             
              <button
                  onClick={() => navigate("/")}
                className="flex items-center gap-2 text-sm text-github-text-muted hover:text-github-text transition-colors cursor-pointer mb-4"
              >
                <FiArrowLeft /> Relatório Avançado
              </button>

              <div className="flex w-full items-start justify-between mb-4">
                <div className="flex flex-col gap-2">
                  <div className="flex gap-4">
                    <h1 className="font-poppins text-other-secondaryBlue font-semibold text-lg">Solfarma<span className="text-other-orange text-lg">.</span></h1> 
                    <div className="text-other-muted">|</div>
                    <h1 className='text-other-muted'>Painel de avançado</h1>
                  </div>
                  <div className="flex items-center gap-3">
                    
                    <span className="bg-github-btn-dark text-github-text-muted text-xs font-medium px-2 py-1 rounded-md">
                      #
                    </span>
                    <span className="text-lg text-github-btn-green-hover tracking-[2.5px] font-medium uppercase">
                      Comparativo de Vendas e Positivação
                    </span>
                  </div>  
                  <div className="ml-4 text-other-muted text-sm">Desempenho consolidado dos canais Televendas e Bees</div>
                  <div className="flex gap-4">
                    <Button 
                      label="Copiar Dados"
                      icon={<FiCopy/>}
                      variant={'secundario'}
                      onClick={()=>{}}
                    ></Button>
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

          <div className="flex gap-2 mx-4 mt-4 bg-gray-100 rounded-xl p-1.5 w-fit">
            <button
              type="button"
              onClick={() => setActiveTab("comparativo")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                activeTab === "comparativo"
                  ? "bg-white text-other-secondaryBlue shadow-sm"
                  : "text-gray-500 hover:text-other-secondaryBlue"
              }`}
            >
              Comparativo de Vendas
            </button>
            {/* <button
              type="button"
              onClick={() => setActiveTab("dinamico")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                activeTab === "dinamico"
                  ? "bg-white text-other-secondaryBlue shadow-sm"
                  : "text-gray-500 hover:text-other-secondaryBlue"
              }`}
            >
              Relatório Dinâmico
            </button> */}
          </div>

          <main className="flex flex-col gap-4 mx-4 mt-4 mb-10">
            {activeTab === "comparativo" && (
              <>
                <FiltroBar
                  onAplicarFiltros={(e)=>{setFiltros(e)}}
                  linhasProduto={[]}
                  valoresIniciais={filtros}
                />

                <section className="flex flex-col gap-6">
                  <SubTopicos
                    title="Comparativo entre dois períodos"
                    valueTopic={1}
                  />

                  <div className="flex w-full gap-6 ">
                    <PeriodoSeletor
                      ano={periodoA.ano}
                      mes={periodoA.mes}
                      onAnoChange={(ano) => setPeriodoA((prev) => ({ ...prev, ano }))}
                      onMesChange={(mes) => setPeriodoA((prev) => ({ ...prev, mes }))}
                      className="w-full"
                      variant="primaria"

                    />
                    <PeriodoSeletor
                      ano={periodoB.ano}
                      mes={periodoB.mes}
                      onAnoChange={(ano) => setPeriodoB((prev) => ({ ...prev, ano }))}
                      onMesChange={(mes) => setPeriodoB((prev) => ({ ...prev, mes }))}
                      className="w-full"
                      variant="secundaria"
                    />
                  </div>

                  <div className="flex w-full gap-6">
                    <CardIndicador
                      periodoA={{label:`Período A · ${periodoA.mes}/${periodoA.ano}`, valor: formatarMoeda(comparativoValorVendido.valorA)}}
                      periodoB={{label:`Período B · ${periodoB.mes}/${periodoB.ano}`, valor: formatarMoeda(comparativoValorVendido.valorB)}}
                      tipo="valor-vendido"
                      variacaoAbsoluta={`${comparativoValorVendido.variacaoAbsoluta < 0 ? '-' : '+'}${formatarMoeda(Math.abs(comparativoValorVendido.variacaoAbsoluta))}`}
                      variacaoPercentual={comparativoValorVendido.variacaoPercentual}
                      variant="primaria"
                      className="w-full"
                    />
                    <CardIndicador
                      periodoA={{label:`Período A · ${periodoA.mes}/${periodoA.ano}`, valor: `${comparativoPositivacao.clientesA} clientes`}}
                      periodoB={{label:`Período B · ${periodoB.mes}/${periodoB.ano}`, valor: `${comparativoPositivacao.clientesB} clientes`}}
                      tipo="positivacao"
                      variacaoAbsoluta={`${comparativoPositivacao.variacaoAbsoluta < 0 ? '-' : '+'}${Math.abs(comparativoPositivacao.variacaoAbsoluta)} clientes`}
                      variacaoPercentual={comparativoPositivacao.variacaoPercentual}
                      variant="secundaria"
                      className="w-full"
                    />
                  </div>

                </section>

                <section className="flex flex-col gap-6">
                  <SubTopicos
                    title="Evolução mensal sequencial"
                    valueTopic={2}
                  />
                  <div className='flex gap-6'>

                  {loading ?
                    (
                    <MonthlyTrendSkeleton/>
                    )
                    :(
                      <>
                        <EvolucaoMensalSequencial
                          dados={dadosSequenciaTrend}
                          rodapeDireita=""
                          rodapeEsquerda=""
                          className="w-full"
                        />
                        <EvolucaoGraficoMesAMes
                          dados={dadosGraficoEvolucao}
                          className="w-full h-fit"
                        />
                    </>
                    )
                  }

                  </div>

                </section>
              </>
            )}

            {/* {activeTab === "dinamico" && <DynamicReportTab />} */}

          </main>
        </>
    )
}

