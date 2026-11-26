import { Fragment, useMemo, useState } from 'react'
import { useOrdenacao } from '../lib/ordenar'
import { ThOrdenavel } from '../components/ThOrdenavel'
import dayjs from 'dayjs'
import { ChevronDown, ChevronRight, Download, Search } from 'lucide-react'
import { PERMITIR_TROCA_USUARIO, useUsuario } from '../auth/UsuarioContext'
import { useGestor } from '../auth/useGestor'
import { PedidosDoClienteExclusiva } from '../components/PedidosDoClienteExclusiva'
import { EmptyState, ErrorState } from '../components/StateViews'
import { getExclusivasClientes, getExclusivasResumo } from '../lib/exclusivas'
import { exportarExcel } from '../lib/exportarExcel'
import { formatCurrency } from '../lib/format'
import { useApiResource } from '../lib/useApiResource'
import { ExclusivasCarteira } from './ExclusivasCarteira'
import { ExclusivasOportunidades } from './ExclusivasOportunidades'
import { ExclusivasPedidosNaoFaturados } from './ExclusivasPedidosNaoFaturados'

const PAGE_SIZE = 30
const TODAS = ''

const campo = 'h-9 rounded-md border border-github-border bg-github-bg-card px-2.5 text-sm text-github-text'

/** "POSITIVAÇÃO BOTICÁRIO EXCLUSIVO" -> "BOTICÁRIO EXCLUSIVO" (só para exibir). */
function nomeIndustria(nome: string | null) {
  return (nome ?? 'Sem indústria').replace(/^(POSITIVAÇÃO|EXCLUSIVA)\s+/i, '')
}

/** "NESTLE" -> "Nestle"; "J&J" e "P&G HPC" ficam como estão (siglas); "BOTICÁRIO EXCLUSIVO" -> "Boticário Exclusivo". */
function industriaEmTexto(nome: string | null) {
  return nomeIndustria(nome)
    .split(' ')
    .map((p) => (p.includes('&') || p.length <= 3 ? p : p.charAt(0) + p.slice(1).toLowerCase()))
    .join(' ')
}

function data(valor: string | null) {
  return valor ? dayjs(valor).format('DD/MM/YYYY') : '-'
}

/**
 * Exclusivas por usuário logado (login).
 *  - Gestor (supervisiona alguém da base): vê todas as indústrias; ao escolher uma, os clientes aparecem embaixo.
 *  - Demais: só as exclusivas e os clientes da própria pessoa.
 * Clicar em um cliente abre os pedidos dele. Sem usuário, a tela pede para entrar (como em "Meus pedidos").
 */
export default function ExclusivasPage() {
  const { idPessoa, usuario } = useUsuario()
  const { ehGestor, carregando: carregandoGestor } = useGestor(idPessoa)
  const pronto = (!!idPessoa || ehGestor) && !carregandoGestor
  /** null = de todos (gestor). */
  const idPessoaFiltro = ehGestor ? null : idPessoa

  const [mes, setMes] = useState(() => dayjs().format('YYYY-MM'))
  const referencia = `${mes}-01`

  const [industria, setIndustria] = useState(TODAS)
  const [operador, setOperador] = useState(TODAS)
  const [busca, setBusca] = useState('')
  const [limite, setLimite] = useState(PAGE_SIZE)
  const [aberto, setAberto] = useState<string | null>(null)
  const [aba, setAba] = useState<'resultado' | 'carteira' | 'oportunidades' | 'pedidos'>('resultado')

  const resumo = useApiResource(
    (signal) => (pronto ? getExclusivasResumo(referencia, idPessoaFiltro, signal) : Promise.resolve([])),
    [referencia, idPessoa, ehGestor, carregandoGestor],
  )
  const clientes = useApiResource(
    (signal) => (pronto ? getExclusivasClientes(referencia, idPessoaFiltro, signal) : Promise.resolve([])),
    [referencia, idPessoa, ehGestor, carregandoGestor],
  )

  const operadores = useMemo(() => {
    const lista = (clientes.data ?? []).filter((c) => !industria || c.industria === industria)
    return [...new Set(lista.map((c) => c.digitador).filter((d): d is string => !!d))].sort((a, b) =>
      a.localeCompare(b, 'pt-BR'),
    )
  }, [clientes.data, industria])

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return (clientes.data ?? []).filter(
      (c) =>
        (!industria || c.industria === industria) &&
        (!operador || c.digitador === operador) &&
        (!termo || (c.razaoSocial ?? '').toLowerCase().includes(termo) || String(c.idPessoaCliente ?? '').includes(termo)),
    )
  }, [clientes.data, industria, operador, busca])
  // a lista tem uma linha por cliente E operador: o mesmo cliente atendido por dois operadores aparece duas vezes
  const clientesDistintos = useMemo(() => new Set(visiveis.map((c) => c.idPessoaCliente)).size, [visiveis])

  const { ordenadas, ord, alternar } = useOrdenacao(visiveis, {
    cliente: (c) => c.razaoSocial,
    industria: (c) => c.industria,
    operador: (c) => c.digitador,
    pedidos: (c) => c.pedidos,
    venda: (c) => c.totalVenda,
    primeira: (c) => c.primeiraCompra,
    ultima: (c) => c.ultimaCompra,
    situacao: (c) => c.positivou,
  })

  const geradoEm = resumo.data?.find((r) => r.geradoEm)?.geradoEm
  const totalPositivados = (resumo.data ?? []).reduce((s, r) => s + r.positivados, 0)
  const varias = (resumo.data?.length ?? 0) > 1
  /** Gestor só vê os clientes depois de escolher uma indústria. */
  const mostrarClientes = !ehGestor || !!industria
  const colunas = 5 + (varias && !industria ? 1 : 0) + (ehGestor ? 1 : 0) + 2 /* 1ª compra e última (md+) */

  /** Baixa em Excel os clientes do resultado que estão na tela (todos, não só a página mostrada). */
  function baixarExcel() {
    exportarExcel({
      arquivo: `exclusivas-resultado-${mes}${industria ? `-${nomeIndustria(industria)}` : ''}`.replace(/\s+/g, '-'),
      aba: 'Resultado',
      totalizar: true,
      linhas: visiveis,
      colunas: [
        { titulo: 'Código', tipo: 'numero', largura: 10, valor: (c) => c.idPessoaCliente },
        { titulo: 'Cliente', largura: 40, valor: (c) => c.razaoSocial },
        { titulo: 'Indústria', largura: 24, valor: (c) => nomeIndustria(c.industria) },
        ...(ehGestor ? [{ titulo: 'Operador', largura: 32, valor: (c: (typeof visiveis)[number]) => c.digitador }] : []),
        { titulo: 'Pedidos', tipo: 'numero', largura: 9, valor: (c) => c.pedidos },
        { titulo: 'Venda', tipo: 'moeda', largura: 14, valor: (c) => c.venda },
        { titulo: 'Devolução', tipo: 'moeda', largura: 14, valor: (c) => c.devolucao },
        { titulo: 'Venda líquida', tipo: 'moeda', largura: 14, valor: (c) => c.totalVenda },
        { titulo: '1ª compra', largura: 12, valor: (c) => (c.primeiraCompra ? dayjs(c.primeiraCompra).format('DD/MM/YYYY') : '') },
        { titulo: 'Última compra', largura: 13, valor: (c) => (c.ultimaCompra ? dayjs(c.ultimaCompra).format('DD/MM/YYYY') : '') },
        {
          titulo: 'Situação',
          largura: 34,
          valor: (c) => (c.positivou ? 'Positivado' : c.positivadoPorOutro ? `Positivado por outro operador Exclusivo ${industriaEmTexto(c.industria)}` : 'Sem positivação'),
        },
      ],
    })
  }

  function escolherIndustria(nome: string) {
    setIndustria((atual) => (atual === nome ? TODAS : nome))
    setOperador(TODAS)
    setLimite(PAGE_SIZE)
    setAberto(null)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h1 className="text-lg font-extrabold">
          Exclusivas
          <span className="ml-2 text-xs font-medium tracking-[0.15em] text-github-btn-green-hover">POSITIVAÇÃO POR CLIENTE</span>
        </h1>
        {pronto && resumo.data && resumo.data.length > 0 && (
          <p className="text-sm text-github-text-muted">
            {usuario?.operatorName && <>{usuario.operatorName}{ehGestor && ' (gestor)'} · </>}
            <strong className="font-semibold text-github-text">{totalPositivados.toLocaleString('pt-BR')}</strong> positivados
            {geradoEm && <> · atualizado em {dayjs(geradoEm).format('DD/MM HH:mm')}</>}
          </p>
        )}
      </div>

      {pronto && (
        <div role="tablist" aria-label="Visão" className="flex w-fit gap-0.5 rounded-lg bg-github-bg-hover p-0.5">
          {(
            [
              { id: 'resultado', label: 'Resultado' },
              { id: 'carteira', label: 'Carteira' },
              { id: 'oportunidades', label: 'Oportunidades' },
              { id: 'pedidos', label: 'Pedidos não faturados' },
            ] as const
          ).map((a) => (
            <button
              key={a.id}
              role="tab"
              type="button"
              aria-selected={aba === a.id}
              onClick={() => setAba(a.id)}
              className={`h-8 rounded-md px-4 text-sm font-medium ${
                aba === a.id ? 'bg-github-bg-card text-github-text shadow-sm' : 'text-github-text-muted'
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}

      {pronto && aba === 'pedidos' ? (
        <ExclusivasPedidosNaoFaturados mes={mes} onMes={setMes} idPessoa={idPessoa} ehGestor={ehGestor} />
      ) : pronto && aba === 'carteira' ? (
        <ExclusivasCarteira mes={mes} onMes={setMes} idPessoaFiltro={idPessoaFiltro} ehGestor={ehGestor} />
      ) : pronto && aba === 'oportunidades' ? (
        <ExclusivasOportunidades idPessoaFiltro={idPessoaFiltro} />
      ) : (
        <>
      {!idPessoa && !ehGestor && (
        <EmptyState
          message={
            PERMITIR_TROCA_USUARIO
              ? 'Seu usuário não está ligado a uma pessoa do televendas, então não há exclusivas para mostrar.'
              : 'Entre no sistema para ver as suas exclusivas.'
          }
        />
      )}

      {pronto && (
        <section aria-label="Filtros" className="flex flex-wrap items-center gap-2">
          <input
            type="month"
            aria-label="Mês"
            value={mes}
            onChange={(e) => {
              if (e.target.value) {
                setMes(e.target.value)
                setIndustria(TODAS)
                setOperador(TODAS)
                setLimite(PAGE_SIZE)
                setAberto(null)
              }
            }}
            className={campo}
          />
          {ehGestor && mostrarClientes && (
            <select
              aria-label="Operador"
              value={operador}
              onChange={(e) => {
                setOperador(e.target.value)
                setLimite(PAGE_SIZE)
              }}
              className={`${campo} max-w-[16rem]`}
            >
              <option value={TODAS}>Operador: todos</option>
              {operadores.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          )}
          {mostrarClientes && (
            <label className="relative block w-full sm:w-64">
              <span className="sr-only">Buscar cliente</span>
              <Search size={16} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-github-text-muted" />
              <input
                type="search"
                value={busca}
                onChange={(e) => {
                  setBusca(e.target.value)
                  setLimite(PAGE_SIZE)
                }}
                placeholder="Buscar cliente ou código"
                className={`${campo} w-full pl-8`}
              />
            </label>
          )}
        </section>
      )}

      {(idPessoa || ehGestor) && (carregandoGestor || resumo.loading) && (
        <div className="h-24 animate-pulse rounded-xl border border-github-border bg-github-bg-card" aria-busy="true" />
      )}
      {pronto && resumo.error && <ErrorState message={resumo.error} onRetry={resumo.reload} />}

      {pronto && resumo.data && !resumo.error && resumo.data.length === 0 && (
        <EmptyState message="Nenhum resultado de exclusivas para este usuário neste mês." />
      )}

      {pronto && resumo.data && resumo.data.length > 0 && (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(13rem,1fr))] gap-2.5" aria-label="Indústrias">
          {resumo.data.map((r) => {
            const nome = r.industria ?? ''
            const ativa = industria === nome
            return (
              <li key={nome}>
                <button
                  type="button"
                  aria-pressed={ativa}
                  onClick={() => escolherIndustria(nome)}
                  className={`w-full rounded-xl border p-3 text-left transition-colors ${
                    ativa
                      ? 'border-github-btn-green bg-github-bg-hover'
                      : 'border-github-border bg-github-bg-card hover:bg-github-bg-hover'
                  }`}
                >
                  <p className="truncate text-xs font-medium uppercase tracking-wide text-github-text-muted">{nomeIndustria(r.industria)}</p>
                  <p className="mt-1 text-2xl font-semibold leading-none">
                    {r.positivados.toLocaleString('pt-BR')}
                    <span className="ml-1 text-xs font-normal text-github-text-muted">positivados</span>
                  </p>
                  {r.aPositivar > 0 && (
                    <p
                      className="mt-1.5 text-lg font-semibold leading-none"
                      title="Clientes com pedido digitado que ainda não foi faturado e que ainda não estão nos positivados"
                    >
                      {r.aPositivar.toLocaleString('pt-BR')}
                      <span className="ml-1 text-xs font-normal text-github-text-muted">a positivar</span>
                    </p>
                  )}
                  <p className="mt-2 text-xs text-github-text-muted">
                    {formatCurrency(r.totalVenda)}
                    {ehGestor && <> · {r.operadores} {r.operadores === 1 ? 'operador' : 'operadores'}</>}
                  </p>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {pronto && ehGestor && !industria && resumo.data && resumo.data.length > 0 && (
        <p className="text-sm text-github-text-muted">Escolha uma indústria acima para ver os clientes.</p>
      )}

      {pronto && mostrarClientes && clientes.loading && (
        <div className="h-40 animate-pulse rounded-xl border border-github-border bg-github-bg-card" aria-busy="true" />
      )}
      {pronto && mostrarClientes && clientes.error && <ErrorState message={clientes.error} onRetry={clientes.reload} />}

      {pronto && mostrarClientes && clientes.data && clientes.data.length > 0 &&
        (visiveis.length === 0 ? (
          <EmptyState message="Nenhum cliente encontrado para esses filtros." />
        ) : (
          <section aria-label="Clientes" className="flex flex-col gap-2">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={baixarExcel}
                disabled={visiveis.length === 0}
                className="flex h-9 items-center gap-1.5 rounded-md border border-github-border bg-github-bg-card px-3 text-sm font-medium hover:bg-github-bg-hover disabled:opacity-50"
              >
                <Download size={15} /> Exportar Excel ({visiveis.length.toLocaleString('pt-BR')})
              </button>
            </div>
                        <p className="text-sm text-github-text-muted">
              <strong className="font-semibold text-github-text">{clientesDistintos.toLocaleString('pt-BR')}</strong> clientes
              {industria && <> em {nomeIndustria(industria)}</>}
              {' '}
              · clique em um cliente para ver os pedidos
            </p>
            <div className="overflow-x-auto rounded-xl border border-github-border bg-github-bg-card">
              <table className="w-full text-left text-sm">
                <thead className="bg-github-bg-hover text-[10px] uppercase tracking-wide text-github-text-muted">
                  <tr>
                    <ThOrdenavel rotulo="Cliente" chave="cliente" ord={ord} onAlternar={alternar} className="py-2 pl-3 font-medium" />
                    {varias && !industria && <ThOrdenavel rotulo="Indústria" chave="industria" ord={ord} onAlternar={alternar} className="px-2 py-2 font-medium" />}
                    {ehGestor && <ThOrdenavel rotulo="Operador" chave="operador" ord={ord} onAlternar={alternar} className="px-2 py-2 font-medium" />}
                    <ThOrdenavel rotulo="Pedidos" chave="pedidos" ord={ord} onAlternar={alternar} direita className="px-2 py-2 text-right font-medium" />
                    <ThOrdenavel rotulo="Venda líquida" chave="venda" ord={ord} onAlternar={alternar} direita className="px-2 py-2 text-right font-medium" />
                    <ThOrdenavel rotulo="1ª compra" chave="primeira" ord={ord} onAlternar={alternar} className="hidden px-2 py-2 font-medium md:table-cell" />
                    <ThOrdenavel rotulo="Última" chave="ultima" ord={ord} onAlternar={alternar} className="hidden px-2 py-2 font-medium md:table-cell" />
                    <ThOrdenavel rotulo="Situação" chave="situacao" ord={ord} onAlternar={alternar} className="py-2 pl-2 pr-3 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {ordenadas.slice(0, limite).map((c) => {
                    const chave = `${c.industria}-${c.idPessoaTelevendas}-${c.idPessoaCliente}`
                    const aberta = aberto === chave
                    return (
                      <Fragment key={chave}>
                        <tr
                          className={`cursor-pointer border-t border-github-border hover:bg-github-bg-hover ${aberta ? 'bg-github-bg-hover' : ''}`}
                          onClick={() => setAberto(aberta ? null : chave)}
                        >
                          <td className="max-w-[20rem] py-1.5 pl-3">
                            <button
                              type="button"
                              aria-expanded={aberta}
                              aria-label={`${aberta ? 'Fechar' : 'Abrir'} pedidos de ${c.razaoSocial ?? 'cliente'}`}
                              onClick={(e) => {
                                e.stopPropagation()
                                setAberto(aberta ? null : chave)
                              }}
                              className="flex w-full items-center gap-1.5 text-left"
                            >
                              {aberta ? <ChevronDown size={15} className="shrink-0" /> : <ChevronRight size={15} className="shrink-0" />}
                              <span className="min-w-0">
                                <span className="block truncate font-semibold">{c.razaoSocial ?? '-'}</span>
                                <span className="block text-xs text-github-text-muted">Cód. {c.idPessoaCliente ?? '-'}</span>
                              </span>
                            </button>
                          </td>
                          {varias && !industria && (
                            <td className="whitespace-nowrap px-2 py-1.5 text-xs text-github-text-muted">{nomeIndustria(c.industria)}</td>
                          )}
                          {ehGestor && <td className="max-w-[12rem] truncate px-2 py-1.5">{c.digitador ?? '-'}</td>}
                          <td className="px-2 py-1.5 text-right">{c.pedidos}</td>
                          <td className="whitespace-nowrap px-2 py-1.5 text-right font-semibold">{formatCurrency(c.totalVenda)}</td>
                          <td className="hidden whitespace-nowrap px-2 py-1.5 md:table-cell">{data(c.primeiraCompra)}</td>
                          <td className="hidden whitespace-nowrap px-2 py-1.5 md:table-cell">{data(c.ultimaCompra)}</td>
                          <td className="py-1.5 pl-2 pr-3">
                            <span
                              className={`inline-block max-w-[15rem] rounded px-1.5 text-[11px] font-medium leading-tight ${
                                c.positivou
                                  ? 'bg-[#639922]/15 text-[#639922]'
                                  : c.positivadoPorOutro
                                    ? 'bg-[#BA7517]/15 text-[#BA7517]'
                                    : 'bg-github-bg-hover text-github-text-muted'
                              }`}
                            >
                              {c.positivou
                                ? 'Positivado'
                                : c.positivadoPorOutro
                                  ? `Positivado por outro operador Exclusivo ${industriaEmTexto(c.industria)}`
                                  : 'Sem positivação'}
                            </span>
                          </td>
                        </tr>
                        {aberta && (
                          <tr className="border-t border-github-border bg-github-bg-hover/40">
                            <td colSpan={colunas} className="px-3 py-2">
                              <PedidosDoClienteExclusiva
                                referencia={referencia}
                                idPessoaCliente={c.idPessoaCliente ?? 0}
                                industria={c.industria}
                                idPessoa={idPessoaFiltro ?? c.idPessoaTelevendas}
                              />
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {visiveis.length > limite && (
              <button
                type="button"
                onClick={() => setLimite((n) => n + PAGE_SIZE)}
                className="h-9 rounded-md border border-github-border bg-github-bg-card text-sm font-medium"
              >
                Mostrar mais ({(visiveis.length - limite).toLocaleString('pt-BR')})
              </button>
            )}
          </section>
        ))}
        </>
      )}
    </div>
  )
}
