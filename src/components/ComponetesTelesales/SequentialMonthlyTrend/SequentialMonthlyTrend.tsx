import React from 'react';

export interface LinhaEvolucaoMensal {
  /** Ex: "Maio" */
  mes: string;
  /** Ex: "2026 · 05" */
  anoMes: string;
  /** Ex: "R$ 1.284.930,50" */
  valorVendido: string;
  positivacao: number;
}

export interface EvolucaoMensalSequencialProps {
  dados: LinhaEvolucaoMensal[];
  /** Ex: "R$ 453.541,99": média mensal das vendas, mostrada abaixo das linhas */
  mediaValor?: string;
  /** Ex: "680": média mensal da positivação, mostrada abaixo da média de valor */
  mediaPositivacao?: string;
  /** Texto do rodapé à esquerda, ex: "3 meses · canais Televendas + Bees" */
  rodapeEsquerda?: string;
  /** Texto do rodapé à direita, ex: "Grandes Contas: NÃO" */
  rodapeDireita?: string;
  className?: string;
}

const EvolucaoMensalSequencial: React.FC<EvolucaoMensalSequencialProps> = ({
  dados,
  mediaValor,
  mediaPositivacao,
  rodapeEsquerda,
  rodapeDireita,
  className = '',
}) => {
  return (
    <div
      className={`overflow-hidden rounded-2xl bg-white shadow-sm font-poppins ${className}`.trim()}
    >
      {/* Cabeçalho da tabela */}
      <div className="grid grid-cols-[1.2fr_1.4fr_1fr] items-center bg-[#32307b] px-6 py-4">
        <span className="text-xs font-bold uppercase tracking-wide text-white">Mês</span>
        <span className="text-center text-xs font-bold uppercase tracking-wide text-white">
          Valor 
        </span>
        <span className="text-center text-xs font-bold uppercase tracking-wide text-white">
          Positivação
        </span>
      </div>

      {/* Linhas */}
      <div>
        {dados.map((linha, i) => (
          <div
            key={`${linha.mes}-${linha.anoMes}`}
            className={`grid grid-cols-[1.2fr_1.4fr_1fr] items-center px-6 py-5 ${
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
          </div>
        ))}
      </div>

      {/* Médias do período, uma embaixo da outra */}
      {(mediaValor || mediaPositivacao) && (
        <div className="border-t-2 border-gray-100 bg-gray-50">
          {mediaValor && (
            <div className="grid grid-cols-[1.2fr_1.4fr_1fr] items-center px-6 py-4">
              <p className="text-sm font-bold uppercase tracking-wide text-gray-500">Média de vendas</p>
              <p className="text-center text-lg font-bold text-[#1f2433]">{mediaValor}</p>
              <span />
            </div>
          )}
          {mediaPositivacao && (
            <div className="grid grid-cols-[1.2fr_1.4fr_1fr] items-center border-t border-gray-100 px-6 py-4">
              <p className="text-sm font-bold uppercase tracking-wide text-gray-500">Média de positivação</p>
              <span />
              <p className="text-center text-lg font-bold text-[#1f2433]">{mediaPositivacao}</p>
            </div>
          )}
        </div>
      )}

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