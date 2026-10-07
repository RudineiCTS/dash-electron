import React, { useId, useMemo, useState } from 'react';
import { LineChart as LineChartIcon, BarChart3, Eye, EyeOff } from 'lucide-react';

export interface PontoMediaMensal {
  mes: string;
  valor: number;
}

export interface GraficoMediaMensalProps {
  titulo: string;
  /** Nome da série na legenda, ex: "Vendas" */
  nomeSerie: string;
  dados: PontoMediaMensal[];
  /** Rótulo curto (pontos, barras e eixo), ex: "R$ 1.285" */
  formatValor: (valor: number) => string;
  /** Texto completo (tooltip e média), ex: "R$ 1.284.930,50" */
  formatValorCompleto?: (valor: number) => string;
  cor?: string;
  corDestaque?: string;
  className?: string;
}

type TipoGrafico = 'linha' | 'barra';

const CORES = {
  grade: '#eef0f4',
  eixoTexto: '#8a92a6',
  media: '#6b7280',
};

const LARGURA = 1000;
const ALTURA = 460;
const PAD_ESQ = 100;
const PAD_DIR = 50;
const TOPO_PLOT = 70;
const BASE_PLOT = 300;
const QTD_LINHAS_GRADE = 4;
const LARGURA_BARRA = 46;

const GraficoMediaMensal: React.FC<GraficoMediaMensalProps> = ({
  titulo,
  nomeSerie,
  dados,
  formatValor,
  formatValorCompleto,
  cor = '#1e2a78',
  corDestaque = '#4c6fff',
  className = '',
}) => {
  const [tipoGrafico, setTipoGrafico] = useState<TipoGrafico>('barra');
  const [mostrarValores, setMostrarValores] = useState(true);
  const [hover, setHover] = useState<number | null>(null);
  const idSombra = `sombra-media-${useId().replace(/:/g, '')}`;
  const completo = formatValorCompleto ?? formatValor;

  const pontosX = useMemo(() => {
    const n = dados.length;
    const largurasUteis = LARGURA - PAD_ESQ - PAD_DIR;
    return n === 1 ? [LARGURA / 2] : dados.map((_, i) => PAD_ESQ + (i * largurasUteis) / (n - 1));
  }, [dados]);

  const linhasGrade = useMemo(
    () =>
      Array.from({ length: QTD_LINHAS_GRADE }, (_, i) => {
        const t = i / (QTD_LINHAS_GRADE - 1);
        return TOPO_PLOT + t * (BASE_PLOT - TOPO_PLOT);
      }),
    []
  );

  const { maxValor, ys, media, yMedia } = useMemo(() => {
    const max = Math.max(...dados.map((d) => d.valor), 1) * 1.15;
    const paraY = (v: number) => BASE_PLOT - (v / max) * (BASE_PLOT - TOPO_PLOT);
    const mediaPeriodo = dados.length ? dados.reduce((soma, d) => soma + d.valor, 0) / dados.length : 0;
    return {
      maxValor: max,
      ys: dados.map((d) => paraY(d.valor)),
      media: mediaPeriodo,
      yMedia: paraY(mediaPeriodo),
    };
  }, [dados]);

  const rotuloVisivel = (indice: number) => mostrarValores || hover === indice;
  const pathLinha = pontosX.map((x, i) => `${x},${ys[i]}`).join(' ');

  return (
    <div className={`rounded-2xl bg-white p-6 shadow-sm font-poppins ${className}`.trim()}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-wide text-gray-400">{titulo}</span>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1">
            <button
              type="button"
              title="Linha"
              onClick={() => setTipoGrafico('linha')}
              className={`rounded-md p-1.5 transition-colors cursor-pointer ${
                tipoGrafico === 'linha' ? 'bg-white text-[#32307b] shadow-sm' : 'text-gray-500 hover:text-[#32307b]'
              }`}
            >
              <LineChartIcon size={16} />
            </button>
            <button
              type="button"
              title="Barras"
              onClick={() => setTipoGrafico('barra')}
              className={`rounded-md p-1.5 transition-colors cursor-pointer ${
                tipoGrafico === 'barra' ? 'bg-white text-[#32307b] shadow-sm' : 'text-gray-500 hover:text-[#32307b]'
              }`}
            >
              <BarChart3 size={16} />
            </button>
          </div>

          <button
            type="button"
            title={mostrarValores ? 'Ocultar valores' : 'Mostrar valores (passe o mouse para ver)'}
            onClick={() => setMostrarValores((v) => !v)}
            className="rounded-md p-2 text-gray-500 transition-colors cursor-pointer hover:bg-gray-100 hover:text-[#32307b]"
          >
            {mostrarValores ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        </div>
      </div>

      <div className="mb-2 flex items-center justify-center gap-5 text-sm text-gray-500">
        <span className="flex items-center gap-2">
          <span className="h-[3px] w-5 rounded-full" style={{ backgroundColor: cor }} />
          {nomeSerie}
        </span>
        {dados.length > 0 && (
          <span className="flex items-center gap-2">
            <span className="w-5 border-t-[3px] border-dashed" style={{ borderColor: CORES.media }} />
            Média: <strong className="text-[#1f2433]">{completo(media)}</strong>
          </span>
        )}
      </div>

      {dados.length === 0 ? (
        <div className="flex h-[260px] items-center justify-center text-sm text-gray-400">
          Sem dados para exibir o gráfico.
        </div>
      ) : (
        <svg
          viewBox={`0 0 ${LARGURA} ${ALTURA}`}
          className="h-auto w-full"
          role="img"
          aria-label={`${titulo}: ${nomeSerie} mês a mês e média do período`}
        >
          <defs>
            <filter id={idSombra} x="-60%" y="-60%" width="220%" height="220%">
              <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#1f2433" floodOpacity="0.35" />
            </filter>
          </defs>

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
          <line
            x1={PAD_ESQ - 20}
            x2={LARGURA - PAD_DIR + 20}
            y1={BASE_PLOT + 70}
            y2={BASE_PLOT + 70}
            stroke={CORES.grade}
            strokeWidth={1}
          />

          {linhasGrade.map((y, i) => (
            <text key={i} x={PAD_ESQ - 30} y={y + 5} textAnchor="end" fontSize={16} fill={CORES.eixoTexto}>
              {formatValor(maxValor * (1 - i / (QTD_LINHAS_GRADE - 1)))}
            </text>
          ))}

          {tipoGrafico === 'linha' && (
            <polyline
              points={pathLinha}
              fill="none"
              stroke={cor}
              strokeWidth={4}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {dados.map((d, i) => {
            const x = pontosX[i];
            const y = ys[i];
            const emDestaque = hover === i;

            return (
              <g
                key={d.mes}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                className="cursor-pointer"
              >
                <title>{`${d.mes}: ${completo(d.valor)}`}</title>

                {tipoGrafico === 'barra' ? (
                  <rect
                    x={x - LARGURA_BARRA / 2}
                    y={y}
                    width={LARGURA_BARRA}
                    height={BASE_PLOT - y}
                    rx={6}
                    fill={cor}
                    opacity={emDestaque ? 1 : 0.85}
                    filter={emDestaque ? `url(#${idSombra})` : undefined}
                    style={{
                      transformBox: 'fill-box',
                      transformOrigin: 'bottom',
                      transform: emDestaque ? 'scale(1.08)' : 'scale(1)',
                      transition: 'transform 150ms ease, filter 150ms ease, opacity 150ms ease',
                    }}
                  />
                ) : (
                  <>
                    <circle cx={x} cy={y} r={14} fill="transparent" />
                    <circle
                      cx={x}
                      cy={y}
                      r={emDestaque ? 11 : 8}
                      fill={emDestaque ? corDestaque : '#ffffff'}
                      stroke={emDestaque ? corDestaque : cor}
                      strokeWidth={4}
                      style={{ transition: 'r 150ms ease, fill 150ms ease, stroke 150ms ease' }}
                    />
                  </>
                )}

                {rotuloVisivel(i) && (
                  <text
                    x={x}
                    y={y - (tipoGrafico === 'barra' ? 12 : 22)}
                    textAnchor="middle"
                    fontSize={emDestaque ? 20 : 17}
                    fontWeight={700}
                    fill={emDestaque ? corDestaque : cor}
                    style={{ transition: 'fill 150ms ease, font-size 150ms ease' }}
                  >
                    {formatValor(d.valor)}
                  </text>
                )}

                <text
                  x={x}
                  y={BASE_PLOT + 120}
                  textAnchor="middle"
                  fontSize={emDestaque ? 18 : 16}
                  fontWeight={700}
                  fill={emDestaque ? corDestaque : CORES.eixoTexto}
                  style={{ transition: 'fill 150ms ease, font-size 150ms ease' }}
                >
                  {d.mes}
                </text>
              </g>
            );
          })}

          {/* Média do período (linha tracejada por cima das séries) */}
          <line
            x1={PAD_ESQ - 20}
            x2={LARGURA - PAD_DIR + 20}
            y1={yMedia}
            y2={yMedia}
            stroke={CORES.media}
            strokeWidth={2.5}
            strokeDasharray="8 6"
            pointerEvents="none"
          />
        </svg>
      )}
    </div>
  );
};

export default GraficoMediaMensal;
