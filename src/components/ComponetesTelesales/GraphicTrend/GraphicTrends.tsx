import React, { useId, useMemo, useState } from 'react';
import { LineChart as LineChartIcon, BarChart3, Eye, EyeOff } from 'lucide-react';

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

type TipoGrafico = 'linha' | 'barra';
type SerieAtiva = 'ambos' | 'vendas' | 'positivacao';
type HoverAlvo = { indice: number; serie: 'valor' | 'positivacao' } | null;

const CORES = {
  valor: '#1e2a78',
  valorDestaque: '#4c6fff',
  positivacao: '#ea580c',
  positivacaoDestaque: '#ffb020',
  grade: '#eef0f4',
  eixoTexto: '#8a92a6',
};

const formatValorPadrao = (valor: number) =>
  `R$ ${Math.round(valor / 1000).toLocaleString('pt-BR')}k`;

const formatPositivacaoPadrao = (valor: number) => valor.toLocaleString('pt-BR');

const formatIndice = (valor: number) => `${Math.round(valor)}%`;

// Converte uma série de valores reais em coordenadas Y dentro de [topo, base],
// usando um domínio [dominioMin, dominioMax] compartilhado (permite comparar
// séries diferentes na mesma escala visual, como no modo índice).
function escalarComDominio(
  valores: number[],
  dominioMin: number,
  dominioMax: number,
  topo: number,
  base: number
): number[] {
  if (dominioMax === dominioMin) {
    return valores.map(() => (topo + base) / 2);
  }
  return valores.map((v) => base - ((v - dominioMin) / (dominioMax - dominioMin)) * (base - topo));
}

// Índice de crescimento relativo ao primeiro período (primeiro mês = 100%).
function calcularIndice(valores: number[]): number[] {
  const base = valores[0] || 1;
  return valores.map((v) => (v / base) * 100);
}

interface ParadaGradiente {
  offset: number;
  cor: string;
}

// Gradiente centrado no ponto em destaque: cor original nas pontas,
// sobe para a cor de destaque perto de "xCentro" e volta a esmaecer para
// os dois lados, dentro de um domínio [xMin, xMax] em coordenadas do SVG.
function calcularStopsGradiente(
  xCentro: number,
  xMin: number,
  xMax: number,
  corBase: string,
  corDestaque: string
): ParadaGradiente[] {
  const largura = xMax - xMin || 1;
  const faixa = Math.min(largura * 0.22, 150);
  const paraOffset = (x: number) => (Math.max(xMin, Math.min(xMax, x)) - xMin) / largura * 100;

  return [
    { offset: 0, cor: corBase },
    { offset: paraOffset(xCentro - faixa), cor: corBase },
    { offset: paraOffset(xCentro), cor: corDestaque },
    { offset: paraOffset(xCentro + faixa), cor: corBase },
    { offset: 100, cor: corBase },
  ];
}

const LARGURA = 1000;
const ALTURA = 460;
const PAD_ESQ = 70;
const PAD_DIR = 70;
const TOPO_PLOT = 70;
const BASE_PLOT = 300;
const QTD_LINHAS_GRADE = 4;
const LARGURA_BARRA = 46;

const EvolucaoGraficoMesAMes: React.FC<EvolucaoGraficoMesAMesProps> = ({
  dados,
  formatValor = formatValorPadrao,
  formatPositivacao = formatPositivacaoPadrao,
  className = '',
}) => {
  const [tipoGrafico, setTipoGrafico] = useState<TipoGrafico>('linha');
  const [serieAtiva, setSerieAtiva] = useState<SerieAtiva>('ambos');
  const [mostrarValores, setMostrarValores] = useState(true);
  const [hover, setHover] = useState<HoverAlvo>(null);

  const mostraValor = serieAtiva !== 'positivacao';
  const mostraPosit = serieAtiva !== 'vendas';
  // Quando só "Vendas" está ativo no modo Barras, o valor vendido vira a
  // própria coluna (não faz sentido desenhar como linha sem a positivação
  // para comparar).
  const valorComoBarra = tipoGrafico === 'barra' && serieAtiva === 'vendas';
  const valorComoLinha = mostraValor && !valorComoBarra;

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

  // ---- Modo Linhas (índice de crescimento) ----
  const modoIndice = useMemo(() => {
    const indiceValor = calcularIndice(dados.map((d) => d.valorVendido));
    const indicePosit = calcularIndice(dados.map((d) => d.positivacao));

    const ativos = [
      ...(mostraValor ? indiceValor : []),
      ...(mostraPosit ? indicePosit : []),
      100,
    ];
    const min = Math.min(...ativos);
    const max = Math.max(...ativos);
    const folga = (max - min) * 0.15 || 20;
    const dominioMin = Math.max(0, min - folga);
    const dominioMax = max + folga;

    return {
      yValor: escalarComDominio(indiceValor, dominioMin, dominioMax, TOPO_PLOT, BASE_PLOT),
      yPosit: escalarComDominio(indicePosit, dominioMin, dominioMax, TOPO_PLOT, BASE_PLOT),
      indiceValor,
      indicePosit,
      dominioMin,
      dominioMax,
    };
  }, [dados, mostraValor, mostraPosit]);

  // ---- Modo Barras + Linha (valores reais, eixos independentes) ----
  const modoReal = useMemo(() => {
    const valores = dados.map((d) => d.valorVendido);
    const posits = dados.map((d) => d.positivacao);
    const maxValor = Math.max(...valores, 1) * 1.15;
    const maxPosit = Math.max(...posits, 1) * 1.15;

    return {
      yValor: escalarComDominio(valores, 0, maxValor, TOPO_PLOT, BASE_PLOT),
      topoBarra: escalarComDominio(posits, 0, maxPosit, TOPO_PLOT, BASE_PLOT),
      maxValor,
      maxPosit,
    };
  }, [dados]);

  const ehLabelVisivel = (indice: number, serie: 'valor' | 'positivacao') =>
    mostrarValores || (hover?.indice === indice && hover.serie === serie);

  const semDados = dados.length === 0;

  const pathValorIndice = pontosX.map((x, i) => `${x},${modoIndice.yValor[i]}`).join(' ');
  const pathPositIndice = pontosX.map((x, i) => `${x},${modoIndice.yPosit[i]}`).join(' ');
  const pathValorReal = pontosX.map((x, i) => `${x},${modoReal.yValor[i]}`).join(' ');

  // Destaque de hover: gradiente na linha (centrado no ponto) + sombra "elevada" na barra.
  const uid = useId().replace(/:/g, '');
  const idGradValor = `grad-valor-${uid}`;
  const idGradPosit = `grad-posit-${uid}`;
  const idSombraBarra = `sombra-barra-${uid}`;

  const hoverX = hover ? pontosX[hover.indice] : undefined;
  const stopsGradValor =
    hoverX !== undefined && hover?.serie === 'valor'
      ? calcularStopsGradiente(hoverX, PAD_ESQ, LARGURA - PAD_DIR, CORES.valor, CORES.valorDestaque)
      : null;
  const stopsGradPosit =
    hoverX !== undefined && hover?.serie === 'positivacao'
      ? calcularStopsGradiente(hoverX, PAD_ESQ, LARGURA - PAD_DIR, CORES.positivacao, CORES.positivacaoDestaque)
      : null;

  return (
    <div className={`rounded-2xl bg-white p-6 shadow-sm font-poppins ${className}`.trim()}>
      {/* Cabeçalho + controles */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-wide text-gray-400">
          Evolução mês a mês
        </span>

        <div className="flex items-center gap-2">
          {/* Ambos / Vendas / Positivação */}
          <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1">
            {([
              { valor: 'ambos', rotulo: 'Ambos' },
              { valor: 'vendas', rotulo: 'Vendas' },
              { valor: 'positivacao', rotulo: 'Positivação' },
            ] as { valor: SerieAtiva; rotulo: string }[]).map((opcao) => (
              <button
                key={opcao.valor}
                type="button"
                onClick={() => setSerieAtiva(opcao.valor)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                  serieAtiva === opcao.valor
                    ? 'bg-white text-[#32307b] shadow-sm'
                    : 'text-gray-500 hover:text-[#32307b]'
                }`}
              >
                {opcao.rotulo}
              </button>
            ))}
          </div>

          {/* Tipo de gráfico */}
          <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1">
            <button
              type="button"
              title="Linhas (índice)"
              onClick={() => setTipoGrafico('linha')}
              className={`rounded-md p-1.5 transition-colors cursor-pointer ${
                tipoGrafico === 'linha'
                  ? 'bg-white text-[#32307b] shadow-sm'
                  : 'text-gray-500 hover:text-[#32307b]'
              }`}
            >
              <LineChartIcon size={16} />
            </button>
            <button
              type="button"
              title="Barras + Linha (valores)"
              onClick={() => setTipoGrafico('barra')}
              className={`rounded-md p-1.5 transition-colors cursor-pointer ${
                tipoGrafico === 'barra'
                  ? 'bg-white text-[#32307b] shadow-sm'
                  : 'text-gray-500 hover:text-[#32307b]'
              }`}
            >
              <BarChart3 size={16} />
            </button>
          </div>

          {/* Mostrar / ocultar valores */}
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

      {/* Legenda */}
      <div className="mb-2 flex items-center justify-center gap-5">
        {mostraValor && (
          <span
            className={`flex items-center gap-2 rounded-full px-2 py-1 text-sm transition-all duration-150 ${
              hover?.serie === 'valor' ? 'scale-105 font-bold' : 'text-gray-500'
            }`}
            style={
              hover?.serie === 'valor'
                ? { color: CORES.valor, backgroundColor: `${CORES.valor}14` }
                : undefined
            }
          >
            <span className="h-[3px] w-5 rounded-full" style={{ backgroundColor: CORES.valor }} />
            Valor Vendido {tipoGrafico === 'linha' ? '(índice)' : '(R$)'}
          </span>
        )}
        {mostraPosit && (
          <span
            className={`flex items-center gap-2 rounded-full px-2 py-1 text-sm transition-all duration-150 ${
              hover?.serie === 'positivacao' ? 'scale-105 font-bold' : 'text-gray-500'
            }`}
            style={
              hover?.serie === 'positivacao'
                ? { color: CORES.positivacao, backgroundColor: `${CORES.positivacao}14` }
                : undefined
            }
          >
            <span
              className="h-[3px] w-5 rounded-full"
              style={{ backgroundColor: CORES.positivacao }}
            />
            Positivação {tipoGrafico === 'linha' ? '(índice)' : ''}
          </span>
        )}
      </div>

      {semDados ? (
        <div className="flex h-[260px] items-center justify-center text-sm text-gray-400">
          Sem dados para exibir o gráfico.
        </div>
      ) : (
        <svg
          viewBox={`0 0 ${LARGURA} ${ALTURA}`}
          className="h-auto w-full"
          role="img"
          aria-label="Gráfico de evolução mês a mês: valor vendido e positivação"
        >
          <defs>
            {stopsGradValor && (
              <linearGradient
                id={idGradValor}
                gradientUnits="userSpaceOnUse"
                x1={PAD_ESQ}
                x2={LARGURA - PAD_DIR}
                y1={0}
                y2={0}
              >
                {stopsGradValor.map((s, i) => (
                  <stop key={i} offset={`${s.offset}%`} stopColor={s.cor} />
                ))}
              </linearGradient>
            )}
            {stopsGradPosit && (
              <linearGradient
                id={idGradPosit}
                gradientUnits="userSpaceOnUse"
                x1={PAD_ESQ}
                x2={LARGURA - PAD_DIR}
                y1={0}
                y2={0}
              >
                {stopsGradPosit.map((s, i) => (
                  <stop key={i} offset={`${s.offset}%`} stopColor={s.cor} />
                ))}
              </linearGradient>
            )}
            <filter id={idSombraBarra} x="-60%" y="-60%" width="220%" height="220%">
              <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#1f2433" floodOpacity="0.35" />
            </filter>
          </defs>

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

          {/* Rótulos do eixo (esquerda) */}
          {linhasGrade.map((y, i) => {
            const t = i / (QTD_LINHAS_GRADE - 1);
            let texto = '';
            if (tipoGrafico === 'linha') {
              const valorGrade = modoIndice.dominioMax - t * (modoIndice.dominioMax - modoIndice.dominioMin);
              texto = formatIndice(valorGrade);
            } else if (mostraValor) {
              texto = formatValor(modoReal.maxValor * (1 - t));
            } else if (mostraPosit) {
              texto = formatPositivacao(Math.round(modoReal.maxPosit * (1 - t)));
            }
            return texto ? (
              <text
                key={i}
                x={PAD_ESQ - 30}
                y={y + 5}
                textAnchor="end"
                fontSize={16}
                fill={CORES.eixoTexto}
              >
                {texto}
              </text>
            ) : null;
          })}

          {/* Rótulos do eixo (direita) — só faz sentido no modo barras com as duas séries ativas */}
          {tipoGrafico === 'barra' &&
            mostraValor &&
            mostraPosit &&
            linhasGrade.map((y, i) => {
              const t = i / (QTD_LINHAS_GRADE - 1);
              return (
                <text
                  key={i}
                  x={LARGURA - PAD_DIR + 30}
                  y={y + 5}
                  textAnchor="start"
                  fontSize={16}
                  fill={CORES.eixoTexto}
                >
                  {formatPositivacao(Math.round(modoReal.maxPosit * (1 - t)))}
                </text>
              );
            })}

          {/* ---- MODO BARRAS: colunas de positivação ---- */}
          {tipoGrafico === 'barra' &&
            mostraPosit &&
            dados.map((d, i) => {
              const x = pontosX[i];
              const yTopo = modoReal.topoBarra[i];
              const emDestaque = hover?.indice === i && hover.serie === 'positivacao';
              return (
                <g
                  key={`barra-${d.mes}`}
                  onMouseEnter={() => setHover({ indice: i, serie: 'positivacao' })}
                  onMouseLeave={() => setHover(null)}
                  className="cursor-pointer"
                >
                  <rect
                    x={x - LARGURA_BARRA / 2}
                    y={yTopo}
                    width={LARGURA_BARRA}
                    height={BASE_PLOT - yTopo}
                    rx={6}
                    fill={CORES.positivacao}
                    opacity={emDestaque ? 1 : 0.85}
                    filter={emDestaque ? `url(#${idSombraBarra})` : undefined}
                    style={{
                      transformBox: 'fill-box',
                      transformOrigin: 'bottom',
                      transform: emDestaque ? 'scale(1.08)' : 'scale(1)',
                      transition: 'transform 150ms ease, filter 150ms ease, opacity 150ms ease',
                    }}
                  />
                  {ehLabelVisivel(i, 'positivacao') && (
                    <text
                      x={x}
                      y={yTopo - 12}
                      textAnchor="middle"
                      fontSize={emDestaque ? 20 : 18}
                      fontWeight={700}
                      fill={emDestaque ? CORES.positivacaoDestaque : CORES.positivacao}
                      style={{ transition: 'fill 150ms ease, font-size 150ms ease' }}
                    >
                      {formatPositivacao(d.positivacao)}
                    </text>
                  )}
                </g>
              );
            })}

          {/* ---- MODO BARRAS: "Vendas" sozinho vira coluna de valor vendido ---- */}
          {valorComoBarra &&
            dados.map((d, i) => {
              const x = pontosX[i];
              const yTopo = modoReal.yValor[i];
              const emDestaque = hover?.indice === i && hover.serie === 'valor';
              return (
                <g
                  key={`barra-valor-${d.mes}`}
                  onMouseEnter={() => setHover({ indice: i, serie: 'valor' })}
                  onMouseLeave={() => setHover(null)}
                  className="cursor-pointer"
                >
                  <rect
                    x={x - LARGURA_BARRA / 2}
                    y={yTopo}
                    width={LARGURA_BARRA}
                    height={BASE_PLOT - yTopo}
                    rx={6}
                    fill={CORES.valor}
                    opacity={emDestaque ? 1 : 0.85}
                    filter={emDestaque ? `url(#${idSombraBarra})` : undefined}
                    style={{
                      transformBox: 'fill-box',
                      transformOrigin: 'bottom',
                      transform: emDestaque ? 'scale(1.08)' : 'scale(1)',
                      transition: 'transform 150ms ease, filter 150ms ease, opacity 150ms ease',
                    }}
                  />
                  {ehLabelVisivel(i, 'valor') && (
                    <text
                      x={x}
                      y={yTopo - 12}
                      textAnchor="middle"
                      fontSize={emDestaque ? 20 : 18}
                      fontWeight={700}
                      fill={emDestaque ? CORES.valorDestaque : CORES.valor}
                      style={{ transition: 'fill 150ms ease, font-size 150ms ease' }}
                    >
                      {formatValor(d.valorVendido)}
                    </text>
                  )}
                </g>
              );
            })}

          {/* ---- Linhas (positivação, modo índice) ---- */}
          {tipoGrafico === 'linha' && mostraPosit && (
            <polyline
              points={pathPositIndice}
              fill="none"
              stroke={stopsGradPosit ? `url(#${idGradPosit})` : CORES.positivacao}
              strokeWidth={4}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ transition: 'stroke 150ms ease' }}
            />
          )}

          {/* ---- Linha (valor vendido, ambos os modos) ---- */}
          {valorComoLinha && (
            <polyline
              points={tipoGrafico === 'linha' ? pathValorIndice : pathValorReal}
              fill="none"
              stroke={stopsGradValor ? `url(#${idGradValor})` : CORES.valor}
              strokeWidth={4}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ transition: 'stroke 150ms ease' }}
            />
          )}

          {/* Pontos + rótulos das linhas */}
          {dados.map((d, i) => {
            const x = pontosX[i];
            const yPositIndice = modoIndice.yPosit[i];
            const yValorAtivo = tipoGrafico === 'linha' ? modoIndice.yValor[i] : modoReal.yValor[i];
            const valorPorCima = mostraPosit && tipoGrafico === 'linha' ? yValorAtivo <= yPositIndice : true;
            const positEmDestaque = hover?.indice === i && hover.serie === 'positivacao';
            const valorEmDestaque = hover?.indice === i && hover.serie === 'valor';

            return (
              <g key={d.mes}>
                {/* Positivação — só desenha ponto no modo linha (no modo barra ela já é a coluna) */}
                {tipoGrafico === 'linha' && mostraPosit && (
                  <g
                    onMouseEnter={() => setHover({ indice: i, serie: 'positivacao' })}
                    onMouseLeave={() => setHover(null)}
                    className="cursor-pointer"
                  >
                    <circle cx={x} cy={yPositIndice} r={14} fill="transparent" />
                    <circle
                      cx={x}
                      cy={yPositIndice}
                      r={positEmDestaque ? 11 : 8}
                      fill={positEmDestaque ? CORES.positivacaoDestaque : '#ffffff'}
                      stroke={positEmDestaque ? CORES.positivacaoDestaque : CORES.positivacao}
                      strokeWidth={4}
                      style={{ transition: 'r 150ms ease, fill 150ms ease, stroke 150ms ease' }}
                    />
                    {ehLabelVisivel(i, 'positivacao') && (
                      <text
                        x={x}
                        y={valorPorCima ? yPositIndice + 34 : yPositIndice - 22}
                        textAnchor="middle"
                        fontSize={positEmDestaque ? 22 : 20}
                        fontWeight={700}
                        fill={positEmDestaque ? CORES.positivacaoDestaque : CORES.positivacao}
                        style={{ transition: 'fill 150ms ease, font-size 150ms ease' }}
                      >
                        {formatIndice(modoIndice.indicePosit[i])}
                      </text>
                    )}
                  </g>
                )}

                {/* Valor vendido — ponto na linha (não desenha quando ele já é a barra) */}
                {valorComoLinha && (
                  <g
                    onMouseEnter={() => setHover({ indice: i, serie: 'valor' })}
                    onMouseLeave={() => setHover(null)}
                    className="cursor-pointer"
                  >
                    <circle cx={x} cy={yValorAtivo} r={14} fill="transparent" />
                    <circle
                      cx={x}
                      cy={yValorAtivo}
                      r={valorEmDestaque ? 11 : 8}
                      fill={valorEmDestaque ? CORES.valorDestaque : '#ffffff'}
                      stroke={valorEmDestaque ? CORES.valorDestaque : CORES.valor}
                      strokeWidth={4}
                      style={{ transition: 'r 150ms ease, fill 150ms ease, stroke 150ms ease' }}
                    />
                    {ehLabelVisivel(i, 'valor') && (
                      <text
                        x={x}
                        y={
                          tipoGrafico === 'linha'
                            ? valorPorCima
                              ? yValorAtivo - 22
                              : yValorAtivo + 34
                            : yValorAtivo - 22
                        }
                        textAnchor="middle"
                        fontSize={valorEmDestaque ? 22 : 20}
                        fontWeight={700}
                        fill={valorEmDestaque ? CORES.valorDestaque : CORES.valor}
                        style={{ transition: 'fill 150ms ease, font-size 150ms ease' }}
                      >
                        {tipoGrafico === 'linha'
                          ? formatIndice(modoIndice.indiceValor[i])
                          : formatValor(d.valorVendido)}
                      </text>
                    )}
                  </g>
                )}

                {/* Legenda do mês (ano + mês), destacada quando a coluna está em hover */}
                <text
                  x={x}
                  y={BASE_PLOT + 120}
                  textAnchor="middle"
                  fontSize={hover?.indice === i ? 18 : 16}
                  fontWeight={700}
                  fill={
                    hover?.indice === i
                      ? hover.serie === 'valor'
                        ? CORES.valorDestaque
                        : CORES.positivacaoDestaque
                      : CORES.eixoTexto
                  }
                  style={{ transition: 'fill 150ms ease, font-size 150ms ease' }}
                >
                  {d.mes}
                </text>
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
};

export default EvolucaoGraficoMesAMes;
