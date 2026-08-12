import React from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react'; // troque pela sua lib de ícones, se for outra

export interface LinhaEvolucaoMensal {
  /** Ex: "Maio" */
  mes: string;
  /** Ex: "2026 · 05" */
  anoMes: string;
  /** Ex: "R$ 1.284.930,50" */
  valorVendido: string;
  positivacao: number;
  /** % de crescimento do valor vendido vs. mês anterior. null = sem mês anterior (N/A) */
  crescValor: number | null;
  /** % de crescimento da positivação vs. mês anterior. null = sem mês anterior (N/A) */
  crescPosit: number | null;
}

export interface EvolucaoMensalSequencialProps {
  dados: LinhaEvolucaoMensal[];
  /** Texto do rodapé à esquerda, ex: "3 meses · canais Televendas + Bees" */
  rodapeEsquerda?: string;
  /** Texto do rodapé à direita, ex: "Grandes Contas: NÃO" */
  rodapeDireita?: string;
  className?: string;
}

const Crescimento: React.FC<{ valor: number | null }> = ({ valor }) => {
  if (valor === null) {
    return (
      <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 text-sm font-semibold text-gray-400">
        N/A
      </span>
    );
  }

  const isNegativo = valor < 0;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-sm font-semibold ${
        isNegativo ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
      }`}
    >
      {isNegativo ? <ArrowDown size={13} /> : <ArrowUp size={13} />}
      {valor > 0 ? '+' : ''}
      {valor.toFixed(2).replace('.', ',')}%
    </span>
  );
};

const EvolucaoMensalSequencial: React.FC<EvolucaoMensalSequencialProps> = ({
  dados,
  rodapeEsquerda,
  rodapeDireita,
  className = '',
}) => {
  return (
    <div
      className={`overflow-hidden rounded-2xl bg-white shadow-sm font-poppins ${className}`.trim()}
    >
      {/* Cabeçalho da tabela */}
      <div className="grid grid-cols-[1.2fr_1.4fr_1fr_1fr_1fr] items-center bg-[#32307b] px-6 py-4">
        <span className="text-xs font-bold uppercase tracking-wide text-white">Mês</span>
        <span className="text-center text-xs font-bold uppercase tracking-wide text-white">
          Valor 
        </span>
        <span className="text-center text-xs font-bold uppercase tracking-wide text-white">
          Positivação
        </span>
        <span className="text-center text-xs font-bold uppercase tracking-wide text-white">
          Cresc. valor
        </span>
        <span className="text-center text-xs font-bold uppercase tracking-wide text-white">
          Cresc. posit.
        </span>
      </div>

      {/* Linhas */}
      <div>
        {dados.map((linha, i) => (
          <div
            key={`${linha.mes}-${linha.anoMes}`}
            className={`grid grid-cols-[1.2fr_1.4fr_1fr_1fr_1fr] items-center px-6 py-5 ${
              i !== dados.length - 1 ? 'border-b border-gray-100' : ''
            }`}
          >
            <div>
              <p className="text-base font-bold text-[#1f2433]">{linha.mes}</p>
              <p className="text-sm text-gray-400">{linha.anoMes}</p>
            </div>
            <p className="text-center text-lg font-bold text-[#1f2433]">
              {linha.valorVendido}
            </p>
            <p className="text-center text-lg font-bold text-[#1f2433]">
              {linha.positivacao}
            </p>
            <div className="flex justify-center">
              <Crescimento valor={linha.crescValor} />
            </div>
            <div className="flex justify-center">
              <Crescimento valor={linha.crescPosit} />
            </div>
          </div>
        ))}
      </div>

      {/* Rodapé */}
      {(rodapeEsquerda || rodapeDireita) && (
        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4 text-sm text-gray-400">
          <span>{rodapeEsquerda}</span>
          <span>
            {rodapeDireita?.includes(':') ? (
              <>
                {rodapeDireita.split(':')[0]}:{' '}
                <strong className="font-bold text-[#1f2433]">
                  {rodapeDireita.split(':')[1].trim()}
                </strong>
              </>
            ) : (
              rodapeDireita
            )}
          </span>
        </div>
      )}
    </div>
  );
};

export default EvolucaoMensalSequencial;