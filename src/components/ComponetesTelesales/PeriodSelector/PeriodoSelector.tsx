import React from 'react';
import { ChevronDown } from 'lucide-react'; // troque pela sua lib de ícones, se for outra
import Input from '../../GlobalComponents/InputComponent';

export type PeriodoVariant = 'primaria' | 'secundaria';

export interface PeriodoSeletorProps {
  /** Título exibido ao lado da bolinha colorida (ex: "Período A · Base") */
  titulo?: string;
  mes: string;
  ano: string;
  onMesChange: (mes: string) => void;
  onAnoChange: (ano: string) => void;
  /** 'primaria' = azul (Período A) | 'secundaria' = laranja (Período B) */
  variant?: PeriodoVariant;
  listaMeses?: string[];
  listaAnos?: string[];
  className?: string;
}

const MESES_PADRAO = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const gerarAnosPadrao = () => {
  const anoAtual = new Date().getFullYear();
  return Array.from({ length: 6 }, (_, i) => String(anoAtual - 4 + i));
};

const tituloPadrao: Record<PeriodoVariant, string> = {
  primaria: 'Período A · Base',
  secundaria: 'Período B · Comparação',
};

const corBolinha: Record<PeriodoVariant, string> = {
  primaria: 'bg-blue-500',
  secundaria: 'bg-[#dd8100]',
};

const selectClasses =
  'h-11 w-full appearance-none rounded-lg border border-gray-200 bg-white pl-3 pr-8 ' +
  'text-sm font-semibold text-[#32307b] outline-none transition-colors cursor-pointer ' +
  'focus:border-[#32307b] focus:ring-2 focus:ring-[#32307b]/10';

const PeriodoSeletor: React.FC<PeriodoSeletorProps> = ({
  titulo,
  mes,
  ano,
  onMesChange,
  onAnoChange,
  variant = 'primaria',
  listaMeses = MESES_PADRAO,
  listaAnos = gerarAnosPadrao(),
  className = '',
}) => {
  return (
    <div
      className={`rounded-2xl bg-white p-6 shadow-sm font-poppins ${className}`.trim()}
    >
      {/* Cabeçalho */}
      <div className="mb-5 flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${corBolinha[variant]}`} />
        <span className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
          {titulo ?? tituloPadrao[variant]}
        </span>
      </div>
      <div className='flex mb-10 gap-4'>
        {/* <div className="flex flex-col">
          <label className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
              Fabricante
          </label>
          <input 
            type="text" 
            name="" 
            id="" 
            className={selectClasses}/>
        </div>
         */}
        
      </div>

      {/* Campos Mês / Ano */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
            Mês
          </label>
          <div className="relative">
            <select
              value={mes}
              onChange={(e) => onMesChange(e.target.value)}
              className={selectClasses}
            >
              {listaMeses.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
            Ano
          </label>
          <div className="relative">
            <select
              value={ano}
              onChange={(e) => onAnoChange(e.target.value)}
              className={selectClasses}
            >
              {listaAnos.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeriodoSeletor;