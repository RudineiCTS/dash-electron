import React, { useState } from 'react';
import dayjs from 'dayjs';
import { isValidPeriod } from '../../../../utils/IsValidPeriod';
import { ChevronDown } from 'lucide-react';

export interface FiltrosValues {
  dataInicio: string;
  dataFim: string;
  incluirGrandesContas: boolean;
  linhaProduto?: string;
  fabricante:string
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
    valoresIniciais?.linhaProduto ?? linhasProduto[0]
  );
  const [fabricante, setFabricante] = useState('');
  const [erro, setErro] = useState('');

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
    onAplicarFiltros({ dataInicio, dataFim, incluirGrandesContas, linhaProduto, fabricante });
  };

  return (
    <div className="flex flex-wrap items-center gap-7 bg-white rounded-2xl px-6 py-4 shadow-sm font-poppins">
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
      </div>

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

      {/* Fabricante */}
      <div className="flex flex-col gap-1.5 min-w-[150px]">
        <label
          htmlFor="filtro-Fabricante"
          className="text-[11px] font-bold uppercase tracking-wide text-gray-400"
        >
          Fabricante
        </label>
        <input
          type="text"
          id="filtro-Fabricante"
          placeholder="Ex: 101;205"
          className={`${inputClasses}`}
          value={fabricante}
          onChange={(e)=> setFabricante(e.target.value)}
          />
      </div>
      {/* Linha de Produto */}
       
      <div className="flex flex-col gap-1.5 min-w-[150px]">
        <label
          htmlFor="filtro-linhaProduto"
          className="text-[11px] font-bold uppercase tracking-wide text-gray-400"
        >
          Linha Produto
        </label>
        <input
          type="text"
          id="filtro-linhaProduto"
          placeholder="Ex: 10;20"
          className={`${inputClasses}`}
          value={linhaProduto}
          onChange={(e)=> setLinhaProduto(e.target.value)}
          />
      </div>

      {erro && (
        <span className="w-full text-xs font-medium text-red-500">{erro}</span>
      )}

      {/* Botão aplicar */}
      <button
        type="button"
        onClick={handleAplicar}
        className="ml-auto h-10 rounded-lg bg-gradient-to-b from-[#ea9a2d] to-[#dd8100] px-5 text-sm font-semibold text-white transition-[filter] hover:brightness-105 active:brightness-95"
      >
        Aplicar filtros
      </button>
    </div>
  );
};

export default FiltroBar;