import { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import { PERMITIR_TROCA_USUARIO, useUsuario } from '../auth/UsuarioContext'
import { useGestor } from '../auth/useGestor'
import { ProgressBar } from '../components/ProgressBar'
import { EmptyState, ErrorState } from '../components/StateViews'
import { FidelizacaoCarteira } from './FidelizacaoCarteira'
import { FidelizacaoDetalhe } from './FidelizacaoDetalhe'
import { getFidelizacaoPeriodos, getFidelizacaoResultado, type FidelizacaoLinha } from '../lib/fidelizacao'
import { formatCurrency } from '../lib/format'
import { useApiResource } from '../lib/useApiResource'

const campo = 'h-9 rounded-md border border-github-border bg-github-bg-card px-2.5 text-sm text-github-text'

/** Mesmas faixas dos cards de campanha: verde = meta batida, laranja = a partir de 50%, vermelho = abaixo. */
function statusDe(percent: number, comMeta: boolean) {
  if (!comMeta) return { faixa: 'border-l-github-border', barra: 'bg-github-border', texto: 'text-github-text-muted' }
  if (percent >= 100) return { faixa: 'border-l-[#3B6D11]', barra: 'bg-[#3B6D11]', texto: 'text-[#3B6D11]' }
  if (percent >= 50) return { faixa: 'border-l-[#EF9F27]', barra: 'bg-[#EF9F27]', texto: 'text-github-text' }
  return { faixa: 'border-l-[#E24B4A]', barra: 'bg-[#E24B4A]', texto: 'text-[#E24B4A]' }
}

/** KPI sem meta (ex.: Hits): não há o que cobrar, então o card já aparece verde. */
const VERDE = { faixa: 'border-l-[#3B6D11]', barra: 'bg-[#3B6D11]', texto: 'text-[#3B6D11]' }

const numero = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
const percentual = (n: number) => `${numero(n)}%`
const nomeDoKpi = (l: FidelizacaoLinha) => l.nomeKpi?.trim() || l.descricaoKpi?.trim() || l.codigoKpi || 'KPI'

interface PessoaResumo {
  idPessoa: number
  pessoa: string
  tipoPessoa: string | null
  kpis: number
  batidos: number
  premio: number
  mediaRealizado: number
}

function resumirPessoas(linhas: FidelizacaoLinha[]): PessoaResumo[] {
  const mapa = new Map<number, FidelizacaoLinha[]>()
  for (const l of linhas) mapa.set(l.idPessoa, [...(mapa.get(l.idPessoa) ?? []), l])
  return [...mapa.entries()]
    .map(([idPessoa, ls]) => {
      const comMeta = ls.filter((l) => l.valorMeta > 0)
      return {
        idPessoa,
        pessoa: ls[0].pessoa ?? `Pessoa ${idPessoa}`,
        tipoPessoa: ls[0].tipoPessoa,
        kpis: ls.length,
        batidos: comMeta.filter((l) => l.realizado >= 100).length,
        premio: ls.reduce((s, l) => s + l.valorPremio, 0),
        mediaRealizado: comMeta.length ? comMeta.reduce((s, l) => s + l.realizado, 0) / comMeta.length : 0,
      }
    })
    .sort((a, b) => a.pessoa.localeCompare(b.pessoa, 'pt-BR'))
}

function CardKpi({ l, ativo, onAbrir }: { l: FidelizacaoLinha; ativo: boolean; onAbrir: (l: FidelizacaoLinha) => void }) {
  const comMeta = l.valorMeta > 0
  const st = comMeta ? statusDe(l.realizado, true) : VERDE
  return (
    <li className={`rounded-xl border border-l-4 border-github-border bg-github-bg-card p-3 ${st.faixa}`}>
      <p className="text-sm font-semibold leading-snug">{nomeDoKpi(l)}</p>
      <div className="mt-2">
        <ProgressBar percent={comMeta ? l.realizado : 100} colorClass={st.barra} />
      </div>
      <dl className="mt-2 grid grid-cols-3 gap-2">
        <div>
          <dt className="text-[10px] uppercase tracking-wide text-github-text-muted">Meta</dt>
          <dd className="text-sm font-semibold">{comMeta ? numero(l.valorMeta) : 'Sem meta'}</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-wide text-github-text-muted">Realizado</dt>
          <dd className="text-sm font-semibold">{numero(l.valorApurado)}</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-wide text-github-text-muted">Percentual</dt>
          <dd className={`text-sm font-semibold ${st.texto}`}>{comMeta ? percentual(l.realizado) : '-'}</dd>
        </div>
      </dl>
      {l.tipoDetalhe === 'hits' && l.hitsClientes > 0 && l.hitsProdutos > 0 && (
        <p className="mt-2 rounded-md bg-github-bg-hover px-2 py-1.5 text-xs">
          <span className="text-github-text-muted">Cálculo: </span>
          <strong className="font-semibold">{l.hitsClientes.toLocaleString('pt-BR')}</strong> clientes ×{' '}
          <strong className="font-semibold">{l.hitsProdutos.toLocaleString('pt-BR')}</strong> produtos ={' '}
          <strong className="font-semibold">{(l.hitsClientes * l.hitsProdutos).toLocaleString('pt-BR')}</strong>
        </p>
      )}
      <p className="mt-2 text-xs text-github-text-muted">
        Prêmio: <strong className={`font-semibold ${l.valorPremio > 0 ? 'text-[#3B6D11]' : 'text-github-text'}`}>{formatCurrency(l.valorPremio)}</strong>
      </p>
      {l.idMeta != null && l.idKpi != null && l.tipoDetalhe != null && (
        <button
          type="button"
          onClick={() => onAbrir(l)}
          aria-pressed={ativo}
          className={`mt-2 h-8 rounded-md border px-2.5 text-xs font-medium ${
            ativo ? 'border-github-btn-green bg-github-bg-hover' : 'border-github-border hover:bg-github-bg-hover'
          }`}
        >
          {ativo ? 'Fechar clientes' : 'Ver clientes'}
        </button>
      )}
    </li>
  )
}

/**
 * Fidelização por usuário logado ("Entrar como…"), com o resultado já calculado da comissão do Televendas.
 *  - Gestor: vê o time e, ao escolher uma pessoa, os KPIs dela.
 *  - Demais: só os próprios KPIs.
 */
export default function FidelizacaoPage() {
  const { idPessoa, usuario } = useUsuario()
  const { ehGestor, carregando: carregandoGestor } = useGestor(idPessoa)
  const pronto = !!idPessoa && !carregandoGestor
  const idPessoaFiltro = ehGestor ? null : idPessoa

  const periodos = useApiResource((signal) => getFidelizacaoPeriodos(signal), [])
  const [idPeriodo, setIdPeriodo] = useState<number | null>(null)
  const [escolhida, setEscolhida] = useState<number | null>(null)
  /** KPI aberto (clientes). */
  const [kpiAberto, setKpiAberto] = useState<FidelizacaoLinha | null>(null)
  /** Dentro da pessoa: os KPIs ou a carteira dela. */
  const [visao, setVisao] = useState<'kpis' | 'carteira'>('kpis')

  /** Período de hoje; se nenhum contém hoje, o mais recente. */
  useEffect(() => {
    if (idPeriodo != null || !periodos.data?.length) return
    const hoje = dayjs()
    const atual = periodos.data.find((p) => !hoje.isBefore(dayjs(p.dataInicio), 'day') && !hoje.isAfter(dayjs(p.dataFim), 'day'))
    setIdPeriodo((atual ?? periodos.data[0]).idPeriodo)
  }, [periodos.data, idPeriodo])

  const resultado = useApiResource(
    (signal) => (pronto && idPeriodo != null ? getFidelizacaoResultado(idPeriodo, idPessoaFiltro, signal) : Promise.resolve([])),
    [idPeriodo, idPessoa, ehGestor, carregandoGestor],
  )

  const linhas = useMemo(() => resultado.data ?? [], [resultado.data])
  const pessoas = useMemo(() => resumirPessoas(linhas), [linhas])
  const periodoAtual = periodos.data?.find((p) => p.idPeriodo === idPeriodo)
  const calculadoEm = linhas.map((l) => l.dataCalculo).filter((d): d is string => !!d).sort().at(-1)

  /** Gestor vê o time; operador cai direto nos próprios KPIs. */
  const pessoaAberta = ehGestor ? escolhida : idPessoa
  const kpis = useMemo(() => linhas.filter((l) => l.idPessoa === pessoaAberta), [linhas, pessoaAberta])
  const dadosPessoa = pessoas.find((p) => p.idPessoa === pessoaAberta)

  /** Trocar de pessoa ou de período fecha a abertura do KPI. */
  useEffect(() => {
    setKpiAberto(null)
    setVisao('kpis')
  }, [pessoaAberta, idPeriodo])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h1 className="text-lg font-extrabold">
          Fidelização
          <span className="ml-2 text-xs font-medium tracking-[0.15em] text-github-btn-green-hover">RESULTADO DO PERÍODO</span>
        </h1>
        {pronto && linhas.length > 0 && (
          <p className="text-sm text-github-text-muted">
            {usuario?.operatorName && <>{usuario.operatorName}{ehGestor && ' (gestor)'} · </>}
            {calculadoEm && <>calculado em {dayjs(calculadoEm).format('DD/MM HH:mm')}</>}
          </p>
        )}
      </div>

      {periodos.data && periodos.data.length > 0 && (
        <label className="flex w-fit items-center gap-2 text-sm text-github-text-muted">
          Período
          <select
            className={campo}
            value={idPeriodo ?? ''}
            onChange={(e) => {
              setIdPeriodo(Number(e.target.value))
              setEscolhida(null)
            }}
          >
            {periodos.data.map((p) => (
              <option key={p.idPeriodo} value={p.idPeriodo}>
                {dayjs(p.dataInicio).format('DD/MM/YYYY')} a {dayjs(p.dataFim).format('DD/MM/YYYY')}
              </option>
            ))}
          </select>
        </label>
      )}

      {periodos.error ? (
        <ErrorState message={periodos.error} onRetry={periodos.reload} />
      ) : !pronto ? (
        <EmptyState
          message={
            PERMITIR_TROCA_USUARIO
              ? 'Escolha um usuário em “Entrar como…” no topo para ver a fidelização.'
              : 'Faça login para ver a fidelização.'
          }
        />
      ) : resultado.error ? (
        <ErrorState message={resultado.error} onRetry={resultado.reload} />
      ) : resultado.loading || periodos.loading ? (
        <div className="h-40 animate-pulse rounded-xl border border-github-border bg-github-bg-card" aria-busy="true" />
      ) : linhas.length === 0 ? (
        <EmptyState message={`Nenhum resultado calculado${periodoAtual ? ' neste período' : ''}${ehGestor ? '' : ' para você'}.`} />
      ) : ehGestor && escolhida == null ? (
        <section aria-label="Time" className="overflow-x-auto rounded-xl border border-github-border bg-github-bg-card">
          <table className="w-full text-left text-sm">
            <thead className="text-[11px] uppercase tracking-wide text-github-text-muted">
              <tr className="border-b border-github-border">
                <th className="py-2 pl-3 font-medium">Pessoa</th>
                <th className="px-2 py-2 font-medium">Tipo</th>
                <th className="px-2 py-2 text-right font-medium">KPIs batidos</th>
                <th className="px-2 py-2 text-right font-medium">Realizado médio</th>
                <th className="px-2 py-2 text-right font-medium">Prêmio</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {pessoas.map((p) => {
                const st = statusDe(p.mediaRealizado, p.mediaRealizado > 0)
                return (
                  <tr
                    key={p.idPessoa}
                    onClick={() => setEscolhida(p.idPessoa)}
                    className="cursor-pointer border-b border-github-border last:border-0 hover:bg-github-bg-hover"
                  >
                    <td className="py-2 pl-3 font-medium">{p.pessoa}</td>
                    <td className="px-2 py-2 text-github-text-muted">{p.tipoPessoa ?? '-'}</td>
                    <td className="px-2 py-2 text-right">
                      {p.batidos}/{p.kpis}
                    </td>
                    <td className={`px-2 py-2 text-right font-semibold ${st.texto}`}>{percentual(p.mediaRealizado)}</td>
                    <td className="px-2 py-2 text-right">{formatCurrency(p.premio)}</td>
                    <td className="pr-2 text-github-text-muted">
                      <ChevronRight size={16} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </section>
      ) : (
        <section aria-label="KPIs" className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {ehGestor && (
                <button
                  type="button"
                  onClick={() => setEscolhida(null)}
                  className="flex h-9 items-center gap-1 rounded-md border border-github-border bg-github-bg-card px-2.5 text-sm"
                >
                  <ArrowLeft size={15} /> Time
                </button>
              )}
              <p className="text-sm">
                <strong className="font-semibold">{dadosPessoa?.pessoa ?? usuario?.operatorName ?? 'Você'}</strong>
                {dadosPessoa?.tipoPessoa && <span className="text-github-text-muted"> · {dadosPessoa.tipoPessoa}</span>}
              </p>
            </div>
            {dadosPessoa && (
              <p className="text-sm text-github-text-muted">
                {dadosPessoa.batidos} de {dadosPessoa.kpis} KPIs batidos · prêmio{' '}
                <strong className="font-semibold text-github-text">{formatCurrency(dadosPessoa.premio)}</strong>
              </p>
            )}
          </div>
          <div role="tablist" aria-label="Visão da pessoa" className="flex w-fit gap-0.5 rounded-lg bg-github-bg-hover p-0.5">
            {(
              [
                { id: 'kpis', label: 'KPIs' },
                { id: 'carteira', label: 'Carteira' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={visao === t.id}
                onClick={() => setVisao(t.id)}
                className={`h-8 rounded-md px-3 text-sm font-medium ${visao === t.id ? 'bg-github-bg-card shadow-sm' : 'text-github-text-muted'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
          {visao === 'carteira' && pessoaAberta != null && idPeriodo != null ? (
            <FidelizacaoCarteira idPeriodo={idPeriodo} idPessoa={pessoaAberta} nomePessoa={dadosPessoa?.pessoa ?? usuario?.operatorName ?? 'pessoa'} />
          ) : kpis.length === 0 ? (
            <EmptyState message="Nenhum KPI calculado para esta pessoa no período." />
          ) : (
            <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {kpis.map((l) => (
                <CardKpi
                  key={`${l.idPessoa}-${l.idKpi}`}
                  l={l}
                  ativo={kpiAberto?.idKpi === l.idKpi && kpiAberto?.idMeta === l.idMeta}
                  onAbrir={(x) => setKpiAberto((atual) => (atual?.idKpi === x.idKpi && atual?.idMeta === x.idMeta ? null : x))}
                />
              ))}
            </ul>
          )}
          {visao === 'kpis' && kpiAberto && <FidelizacaoDetalhe key={`${kpiAberto.idMeta}-${kpiAberto.idKpi}`} linha={kpiAberto} onFechar={() => setKpiAberto(null)} />}
        </section>
      )}
    </div>
  )
}
