import React from 'react';
import { DollarSign, Users, ArrowDown, ArrowUp } from 'lucide-react'; // troque pela sua lib de ícones, se for outra

export type CardVariant = 'primaria' | 'secundaria';
export type CardTipo = 'valor-vendido' | 'positivacao';

export interface CardPeriodoValor {
  /** Ex: "Período A · Jun/2025" */
  label: string;
  /** Ex: "R$ 1.284.930,50" ou "465 clientes" */
  valor: string;
}

export interface CardIndicadorProps {
  tipo: CardTipo;
  /** 'primaria' = azul (acompanha Período A) | 'secundaria' = laranja (acompanha Período B) */
  variant?: CardVariant;
  /** Título customizado (default depende do "tipo") */
  titulo?: string;
  /** Descrição customizada (default depende do "tipo") */
  descricao?: string;
  periodoA: CardPeriodoValor;
  periodoB: CardPeriodoValor;
  /** Ex: -18.09 (negativo = queda, positivo = alta) */
  variacaoPercentual: number;
  /** Ex: "-R$ 232.459,70" ou "-77 clientes" */
  variacaoAbsoluta: string;
  className?: string;
}

const configTipo: Record<CardTipo, { titulo: string; descricao: string; Icone: React.ElementType }> = {
  'valor-vendido': {
    titulo: 'Valor vendido',
    descricao: 'Soma total das vendas no período',
    Icone: DollarSign,
  },
  positivacao: {
    titulo: 'Positivação',
    descricao: 'Clientes distintos que compraram',
    Icone: Users,
  },
};

const corVariant: Record<CardVariant, { barra: string; iconeBg: string; iconeCor: string }> = {
  primaria: {
    barra: 'bg-blue-500',
    iconeBg: 'bg-blue-50',
    iconeCor: 'text-blue-500',
  },
  secundaria: {
    barra: 'bg-[#dd8100]',
    iconeBg: 'bg-orange-50',
    iconeCor: 'text-[#dd8100]',
  },
};

const CardIndicador: React.FC<CardIndicadorProps> = ({
  tipo,
  variant = 'primaria',
  titulo,
  descricao,
  periodoA,
  periodoB,
  variacaoPercentual,
  variacaoAbsoluta,
  className = '',
}) => {
  const { titulo: tituloPadrao, descricao: descricaoPadrao, Icone } = configTipo[tipo];
  const cores = corVariant[variant];
  const isNegativo = variacaoPercentual < 0;

  return (
    <div
      className={`overflow-hidden rounded-2xl bg-white shadow-sm font-poppins ${className}`.trim()}
    >
      {/* Barra superior colorida */}
      <div className={`h-1 w-full ${cores.barra}`} />

      <div className="p-6">
        {/* Cabeçalho: ícone + título/descrição + badge de variação */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${cores.iconeBg}`}>
              <Icone size={18} className={cores.iconeCor} />
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">
                {titulo ?? tituloPadrao}
              </p>
              <p className="text-sm text-gray-400">{descricao ?? descricaoPadrao}</p>
            </div>
          </div>

          <span
            className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold ${
              isNegativo ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
            }`}
          >
            {isNegativo ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
            {Math.abs(variacaoPercentual).toFixed(2).replace('.', ',')}%
          </span>
        </div>

        {/* Valores dos dois períodos */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              {periodoA.label}
            </p>
            <p className="mt-1 text-2xl font-bold text-[#32307b]">{periodoA.valor}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              {periodoB.label}
            </p>
            <p className="mt-1 text-2xl font-bold text-[#32307b]">{periodoB.valor}</p>
          </div>
        </div>

        {/* Variação absoluta */}
        <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
          <span className="text-sm text-gray-400">Variação absoluta</span>
          <span className={`text-sm font-semibold ${isNegativo ? 'text-red-600' : 'text-green-600'}`}>
            {variacaoAbsoluta}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CardIndicador;