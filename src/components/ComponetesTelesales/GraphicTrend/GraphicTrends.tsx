import React, { useMemo } from 'react';

export interface PontoEvolucaoMensal {
  mes: string;
  valorVendido: number;
  positivacao: number;
}

export interface EvolucaoGraficoMesAMesProps {
  dados: PontoEvolucaoMensal[];
  /** Formata o valor vendido exibido nos rótulos (default: "R$ 1.285k") */
  formatValor?: (valor: number) => string;
  /** Formata a positivação exibida nos rótulos (default: "412") */
  formatPositivacao?: (valor: number) => string;
  className?: string;
}

const CORES = {
  valor: '#2f6fed',
  positivacao: '#ea580c',
  grade: '#eef0f4',
  eixoTexto: '#8a92a6',
};

const formatValorPadrao = (valor: number) =>
  `R$ ${Math.round(valor / 1000).toLocaleString('pt-BR')}k`;

const formatPositivacaoPadrao = (valor: number) => valor.toLocaleString('pt-BR');

// Normaliza uma série de valores para coordenadas Y dentro da área do gráfico,
// de forma independente por série (por isso duas linhas com escalas bem
// diferentes — R$ e nº de clientes — conseguem se cruzar visualmente).
function escalarSerie(valores: number[], topo: number, base: number): number[] {
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  if (max === min) {
    return valores.map(() => (topo + base) / 2);
  }
  return valores.map((v) => base - ((v - min) / (max - min)) * (base - topo));
}

const LARGURA = 1000;
const ALTURA = 400;
const PAD_ESQ = 60;
const PAD_DIR = 60;
const TOPO_PLOT = 70;
const BASE_PLOT = 300;
const QTD_LINHAS_GRADE = 4;

const EvolucaoGraficoMesAMes: React.FC<EvolucaoGraficoMesAMesProps> = ({
  dados,
  formatValor = formatValorPadrao,
  formatPositivacao = formatPositivacaoPadrao,
  className = '',
}) => {
  const { pontosX, yValor, yPosit, linhasGrade } = useMemo(() => {
    const n = dados.length;
    const largurasUteis = LARGURA - PAD_ESQ - PAD_DIR;
    const pontosX =
      n === 1
        ? [LARGURA / 2]
        : dados.map((_, i) => PAD_ESQ + (i * largurasUteis) / (n - 1));

    const yValor = escalarSerie(dados.map((d) => d.valorVendido), TOPO_PLOT, BASE_PLOT);
    const yPosit = escalarSerie(dados.map((d) => d.positivacao), TOPO_PLOT, BASE_PLOT);

    const linhasGrade = Array.from({ length: QTD_LINHAS_GRADE }, (_, i) => {
      const t = i / (QTD_LINHAS_GRADE - 1);
      return TOPO_PLOT + t * (BASE_PLOT - TOPO_PLOT);
    });

    return { pontosX, yValor, yPosit, linhasGrade };
  }, [dados]);

  const pathValor = pontosX.map((x, i) => `${x},${yValor[i]}`).join(' ');
  const pathPosit = pontosX.map((x, i) => `${x},${yPosit[i]}`).join(' ');

  return (
    <div className={`rounded-2xl bg-white p-6 shadow-sm font-poppins ${className}`.trim()}>
      {/* Cabeçalho */}
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wide text-gray-400">
          Evolução mês a mês
        </span>
        <div className="flex items-center gap-5">
          <span className="flex items-center gap-2 text-sm text-gray-500">
            <span className="h-[3px] w-5 rounded-full" style={{ backgroundColor: CORES.valor }} />
            Valor Vendido
          </span>
          <span className="flex items-center gap-2 text-sm text-gray-500">
            <span
              className="h-[3px] w-5 rounded-full"
              style={{ backgroundColor: CORES.positivacao }}
            />
            Positivação
          </span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${LARGURA} ${ALTURA}`}
        className="h-auto w-full"
        role="img"
        aria-label="Gráfico de evolução mês a mês: valor vendido e positivação"
      >
        {/* Linhas de grade horizontais */}
        {linhasGrade.map((y, i) => (
          <line
            key={i}
            x1={PAD_ESQ - 20}
            x2={LARGURA - PAD_DIR + 20}
            y1={y}
            y2={y}
            stroke={CORES.grade}
            strokeWidth={1}
          />
        ))}

        {/* Linha extra de grade abaixo, separando os nomes dos meses */}
        <line
          x1={PAD_ESQ - 20}
          x2={LARGURA - PAD_DIR + 20}
          y1={BASE_PLOT + 70}
          y2={BASE_PLOT + 70}
          stroke={CORES.grade}
          strokeWidth={1}
        />

        {/* Linha Positivação (desenhada primeiro para o azul ficar por cima nos cruzamentos, como na imagem) */}
        <polyline
          points={pathPosit}
          fill="none"
          stroke={CORES.positivacao}
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Linha Valor Vendido */}
        <polyline
          points={pathValor}
          fill="none"
          stroke={CORES.valor}
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Pontos + rótulos */}
        {dados.map((d, i) => {
          const x = pontosX[i];
          const yv = yValor[i];
          const yp = yPosit[i];
          // Quem está visualmente mais acima (menor y) recebe o rótulo por cima do ponto;
          // o outro recebe o rótulo por baixo — evita sobreposição de texto.
          const valorPorCima = yv <= yp;

          return (
            <g key={d.mes}>
              {/* Positivação */}
              <circle cx={x} cy={yp} r={8} fill="#ffffff" stroke={CORES.positivacao} strokeWidth={4} />
              <text
                x={x}
                y={valorPorCima ? yp + 34 : yp - 22}
                textAnchor="middle"
                fontSize={20}
                fontWeight={700}
                fill={CORES.positivacao}
              >
                {formatPositivacao(d.positivacao)}
              </text>

              {/* Valor vendido */}
              <circle cx={x} cy={yv} r={8} fill="#ffffff" stroke={CORES.valor} strokeWidth={4} />
              <text
                x={x}
                y={valorPorCima ? yv - 22 : yv + 34}
                textAnchor="middle"
                fontSize={20}
                fontWeight={700}
                fill={CORES.valor}
              >
                {formatValor(d.valorVendido)}
              </text>

              {/* Nome do mês */}
              <text
                x={x}
                y={BASE_PLOT + 120}
                textAnchor="middle"
                fontSize={20}
                fontWeight={700}
                fill={CORES.eixoTexto}
              >
                {d.mes}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default EvolucaoGraficoMesAMes;