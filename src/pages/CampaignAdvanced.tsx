import { FiArrowLeft } from "react-icons/fi";
import { Navigate, useNavigate } from "react-router-dom";
import {TabView } from "../components/ContainerFilter/ContainerFilter";
import { useState } from "react";
import { FiCopy,FiDownload } from "react-icons/fi";

import FiltroBar, { FiltrosValues } from "../components/ComponetesTelesales/FilterCampanhaTelevendas/FilterComponent";
import Button from "../components/shared/Button/ButtonComponent";
import PeriodoSeletor from "../components/ComponetesTelesales/PeriodSelector/PeriodoSelector";
import CardIndicador from "../components/ComponetesTelesales/CardIndicador/CardIndicador";
import { SubTopicos } from "../components/ComponetesTelesales/SubTopicos/SubTopicos";
import EvolucaoMensalSequencial, {LinhaEvolucaoMensal} from "../components/ComponetesTelesales/SequentialMonthlyTrend/SequentialMonthlyTrend";
import EvolucaoGraficoMesAMes, {PontoEvolucaoMensal} from "../components/ComponetesTelesales/GraphicTrend/GraphicTrends";


export default function CampaignsAdvanced() {
    const [activeTab, setActiveTab] = useState<TabView>("totais");
    const [name, setName] = useState("");
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined); 
    const [filtros, setFiltros] = useState<FiltrosValues>({
      dataInicio:'',
      dataFim:'',
      incluirGrandesContas: false,
      linhaProduto: ''
    })   
    const [dadosSequenciaTrend, setDadosSequenciaTrend] = useState<LinhaEvolucaoMensal[]>([
      {
        mes: 'Maio',
        anoMes: '2026 · 05',
        valorVendido: 'R$ 1.284.930,50',
        positivacao: 412,
        crescValor: null,
        crescPosit: null,
      },
      {
        mes: 'Junho',
        anoMes: '2026 · 06',
        valorVendido: 'R$ 1.052.470,80',
        positivacao: 388,
        crescValor: -18.09,
        crescPosit: -5.83,
      },
      {
        mes: 'Julho',
        anoMes: '2026 · 07',
        valorVendido: 'R$ 1.198.640,25',
        positivacao: 431,
        crescValor: 13.89,
        crescPosit: 11.08,
      },
    ]);
    const [dadosGraficoEvolucao, setDadosGraficoEvolucao] = useState<PontoEvolucaoMensal[]>([
      { mes: 'Maio', valorVendido: 1284930.50, positivacao: 412 },
      { mes: 'Junho', valorVendido: 1052470.80, positivacao: 388 },
      { mes: 'Julho', valorVendido: 1198640.25, positivacao: 431 },
    ]);
    const navigate = useNavigate();
    function HandleChangeStartDate(valueDate:Date| undefined){
      setStartDate(valueDate)
    }
    function HandleChangeEndDate(valueDate:Date|undefined){
      setEndDate(valueDate);
    }
    function HandleChangeActiveTab(value:TabView){
      setActiveTab(value)
    }
    function HandleChangeName(value:string){
      setName(value)
    }
    return(
        <>
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
          <main className="flex flex-col gap-4 mx-4 mt-4 mb-10">
            <FiltroBar
              onAplicarFiltros={()=>{}}
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
                  ano="2025"
                  mes={"Janeiro"}
                  onAnoChange={()=>{}}
                  onMesChange={()=>{}}
                  className="w-full"
                  variant="primaria"

                />
                <PeriodoSeletor
                  ano="2025"
                  mes={"Janeiro"}
                  onAnoChange={()=>{}}
                  onMesChange={()=>{}}
                  className="w-full"
                  variant="secundaria"                  
                />
              </div>

              <div className="flex w-full gap-6">
                <CardIndicador
                  periodoA={{label:'Perido A', valor:'2.000,00',}}
                  periodoB={{label:'Periodo B', valor:'1.500,00',}}
                  tipo="valor-vendido"
                  variacaoAbsoluta="-200"
                  variacaoPercentual={-700}
                  variant="primaria"
                  className="w-full"
                />
                <CardIndicador
                  periodoA={{label:'Perido A', valor:'2.000,00',}}
                  periodoB={{label:'Periodo B', valor:'1.500,00',}}
                  tipo="positivacao"
                  variacaoAbsoluta="-200"
                  variacaoPercentual={-700}
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
              <EvolucaoMensalSequencial
                dados={dadosSequenciaTrend}
                rodapeDireita=""
                rodapeEsquerda=""
              />

            </section>
            <section className="flex w-full items-center justify-center">
              <EvolucaoGraficoMesAMes
                dados={dadosGraficoEvolucao}
                className="w-2/4"
              />
            </section>

          </main>
        </>
    )
}

