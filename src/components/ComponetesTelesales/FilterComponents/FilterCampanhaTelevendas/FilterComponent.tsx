import React, { useState } from 'react';
import dayjs from 'dayjs';
import { isValidPeriod } from '../../../../utils/IsValidPeriod';
import { ChevronDown } from 'lucide-react';
import ParametroMultiSelect from './ParametroMultiSelect';

export interface FiltrosValues {
  dataInicio: string;
  dataFim: string;
  incluirGrandesContas: boolean;
  linhaProduto?: string;
  fabricante:string
  tipoData: string;
}

interface FiltroBarProps {
  /** Opções do select "Linha de Produto" */
  linhasProduto?: string[];
  /** Valores iniciais (útil para restaurar filtros salvos) */
  valoresIniciais?: Partial<FiltrosValues>;
  /** Disparado ao clicar em "Aplicar filtros" */
  onAplicarFiltros: (filtros: FiltrosValues) => void;
}

// Cores da Solfarma não existem no tailwind.config.js, então usamos valores
// arbitrários ([#dd8100]) em vez de classes nomeadas.
const inputClasses =
  'h-10 px-3 border border-gray-200 rounded-lg bg-white text-sm text-gray-800 ' +
  'outline-none transition-colors focus:border-[#dd8100] focus:ring-2 focus:ring-[#dd8100]/15';

const FiltroBar: React.FC<FiltroBarProps> = ({
  linhasProduto = ['Todas as linhas'],
  valoresIniciais,
  onAplicarFiltros,
}) => {
  const [dataInicio, setDataInicio] = useState(valoresIniciais?.dataInicio ?? '');
  const [dataFim, setDataFim] = useState(valoresIniciais?.dataFim ?? '');
  const [incluirGrandesContas, setIncluirGrandesContas] = useState(
    valoresIniciais?.incluirGrandesContas ?? false
  );
  const [linhaProduto, setLinhaProduto] = useState(
    valoresIniciais?.linhaProduto ?? ''
  );
  const [fabricante, setFabricante] = useState('');
  const [erro, setErro] = useState('');
  const [tipoData,setTipoData] = useState(valoresIniciais?.tipoData ?? 'dataFaturamento')

  const handleAplicar = () => {
    const periodoValido = isValidPeriod(dayjs(dataInicio).toDate(), dayjs(dataFim).toDate());
    if (!periodoValido) {
      setErro('Selecione um período válido: a data início deve ser anterior ou igual à data fim.');
      return;
    }

    const fabricantesInformados = fabricante
      .split(';')
      .map((codigo) => codigo.trim())
      .filter(Boolean);

    if (fabricantesInformados.length === 0) {
      setErro('Informe ao menos um código de fabricante.');
      return;
    }

    setErro('');
    onAplicarFiltros({ dataInicio, dataFim, incluirGrandesContas, linhaProduto, fabricante, tipoData });
  };

  return (
    <>
    <div className="flex  justify-between bg-white rounded-2xl px-8 py-4 shadow-sm font-poppins">
      {/* DATA DE APURAÇÃO */}       
      <div className="flex flex-col gap-1.5  ">
          <label
            htmlFor="filtro-tipoData"
            className="text-[11px] font-bold uppercase tracking-wide text-gray-400"
          >
            Tipo de data
          </label>
          <select           
            id="filtro-tipoData"          
            className={`${inputClasses}`}
            value={tipoData}
            onChange={(e)=> {setTipoData(e.target.value)}}          
            >
              <option value="dataFaturamento" className=''>Data Faturamento</option>
              <option value="dataPedido" className=''>Data Pedido</option>
          </select>

          {/* Toggle Grandes Contas */}
          <div className="flex flex-col gap-1.5 min-w-[150px]">
            <label className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
              Grandes Contas
            </label>
            <button
              type="button"
              role="switch"
              aria-checked={incluirGrandesContas}
              onClick={() => setIncluirGrandesContas((v) => !v)}
              className="flex h-10 items-center gap-2.5 rounded-lg border border-gray-200 bg-white px-3.5 cursor-pointer"
            >
              <span
                className={`relative h-[18px] w-[34px] shrink-0 rounded-full transition-colors ${
                  incluirGrandesContas ? 'bg-[#dd8100]' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute left-0.5 top-0.5 h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                    incluirGrandesContas ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </span>
              <span className="whitespace-nowrap text-sm text-gray-800">
                Incluir Grandes Contas{' '}
                <strong className={incluirGrandesContas ? 'text-[#dd8100]' : 'text-gray-400'}>
                  {incluirGrandesContas ? 'SIM' : 'NÃO'}
                </strong>
              </span>
            </button>
          </div>
        </div>
        {/* Data Início */}
        <div className="flex flex-col gap-1.5 min-w-[150px]">
          <label
            htmlFor="filtro-data-inicio"
            className="text-[11px] font-bold uppercase tracking-wide text-gray-400"
          >
            Data Início
          </label>
          <input
            id="filtro-data-inicio"
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className={inputClasses}
          />
              {/* Data Fim */}
          <div className="flex flex-col gap-1.5 min-w-[150px]">
            <label
              htmlFor="filtro-data-fim"
              className="text-[11px] font-bold uppercase tracking-wide text-gray-400"
            >
              Data Fim
            </label>
            <input
              id="filtro-data-fim"
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className={inputClasses}
            />
          </div>
      </div> 

      <div className="flex flex-col gap-1.5 min-w-[220px] max-w-[300px]">
        {/* Fabricante */}
        <ParametroMultiSelect
          tipoParametro="Fabricante"
          label="Fabricante"
          placeholder="Buscar por nome ou id..."
          value={fabricante}
          onChange={setFabricante}
        />
        {/* Linha de Produto */}
        <ParametroMultiSelect
          tipoParametro="Linha"
          label="Linha Produto"
          placeholder="Buscar por nome ou id..."
          value={linhaProduto}
          onChange={setLinhaProduto}
        />
      </div>

      {erro && (
        <span className="w-full text-xs font-medium text-red-500">{erro}</span>
      )}



      {/* Botão aplicar */}
      <button
        type="button"
        onClick={handleAplicar}
        className="self-end h-10 rounded-lg bg-other-orange px-5 text-sm font-semibold text-white transition-[filter] hover:brightness-105 active:brightness-95"
      >
        Aplicar filtros
      </button>

    </div>
    </>
  );
};

export default FiltroBar;