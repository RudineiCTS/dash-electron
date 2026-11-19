import { Fragment, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { ChevronDown, ChevronRight, Search } from 'lucide-react'
import { PERMITIR_TROCA_USUARIO, useUsuario } from '../auth/UsuarioContext'
import { useGestor } from '../auth/useGestor'
import { EmptyState, ErrorState } from '../components/StateViews'
import { getExclusivasClientes, getExclusivasPedidos, getExclusivasResumo, type ExclusivaCliente } from '../lib/exclusivas'
import { formatCurrency } from '../lib/format'
import { useApiResource } from '../lib/useApiResource'

const PAGE_SIZE = 30
const TODAS = ''

const campo = 'h-9 rounded-md border border-github-border bg-github-bg-card px-2.5 text-sm text-github-text'

/** "POSITIVAÇÃO BOTICÁRIO EXCLUSIVO" -> "BOTICÁRIO EXCLUSIVO" (só para exibir). */
function nomeIndustria(nome: string | null) {
  return (nome ?? 'Sem indústria').replace(/^POSITIVAÇÃO\s+/i, '')
}

function data(valor: string | null) {
  return valor ? dayjs(valor).format('DD/MM/YYYY') : '-'
}

interface PedidosDoClienteProps {
  referencia: string
  cliente: ExclusivaCliente
  idPessoaFiltro: number | null
}

/** Pré-pedidos do cliente no mês; carrega só quando a linha é aberta. */
function PedidosDoCliente({ referencia, cliente, idPessoaFiltro }: PedidosDoClienteProps) {
  const pedidos = useApiResource(
    (signal) =>
      getExclusivasPedidos(
        referencia,
        cliente.idPessoaCliente ?? 0,
        cliente.industria,
        idPessoaFiltro ?? cliente.idPessoaTelevendas,
        signal,
      ),
    [referencia, cliente.idPessoaCliente, cliente.industria, cliente.idPessoaTelevendas, idPessoaFiltro],
  )

  if (pedidos.loading) return <div className="h-12 animate-pulse rounded-lg bg-github-bg-hover" aria-busy="true" />
  if (pedidos.error) return <ErrorState message={pedidos.error} onRetry={pedidos.reload} />
  if (!pedidos.data || pedidos.data.length === 0) {
    return <p className="text-sm text-github-text-muted">Nenhum pedido encontrado para este cliente.</p>
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-github-border bg-github-bg">
      <table className="w-full text-left text-xs">
        <thead className="bg-github-bg-hover text-[10px] uppercase tracking-wide text-github-text-muted">
          <tr>
            <th className="py-1.5 pl-3 font-medium">Pré-pedido</th>
            <th className="px-2 py-1.5 font-medium">Pedidos</th>
            <th className="px-2 py-1.5 font-medium">Faturamento</th>
            <th className="px-2 py-1.5 text-right font-medium">Venda</th>
            <th className="px-2 py-1.5 text-right font-medium">Devolução</th>
            <th className="px-2 py-1.5 text-right font-medium">Líquido</th>
            <th className="py-1.5 pl-2 pr-3 font-medium">Situação</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.data.map((p) => (
            <tr key={`${p.idPrePedido}-${p.idPedido}`} className="border-t border-github-border">
              <td className="py-1.5 pl-3 font-medium">{p.idPrePedido ?? '-'}</td>
              <td className="max-w-[14rem] truncate px-2 py-1.5" title={p.idPedido ?? ''}>
                {p.idPedido ?? '-'}
              </td>
              <td className="whitespace-nowrap px-2 py-1.5">{data(p.dataFaturamento)}</td>
              <td className="whitespace-nowrap px-2 py-1.5 text-right">{formatCurrency(p.venda)}</td>
              <td className="whitespace-nowrap px-2 py-1.5 text-right">{formatCurrency(p.devolucao)}</td>
              <td className="whitespace-nowrap px-2 py-1.5 text-right font-semibold">{formatCurrency(p.totalVenda)}</td>
              <td className="py-1.5 pl-2 pr-3">
                {p.positivou ? (
                  <span className="inline-block whitespace-nowrap rounded bg-[#639922]/15 px-1.5 text-[11px] font-medium text-[#639922]">
                    Positivou
                  </span>
                ) : (
                  <span className="text-github-text-muted">-</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/**
 * Exclusivas por usuário logado ("Entrar como…").
 *  - Gestor (supervisiona alguém da base): vê todas as indústrias; ao escolher uma, os clientes aparecem embaixo.
 *  - Demais: só as exclusivas e os clientes da própria pessoa.
 * Clicar em um cliente abre os pedidos dele. Sem usuário, a tela pede para entrar (como em "Meus pedidos").
 */
export default function ExclusivasPage() {
  const { idPessoa, usuario } = useUsuario()
  const { ehGestor, carregando: carregandoGestor } = useGestor(idPessoa)
  const pronto = !!idPessoa && !carregandoGestor
  /** null = de todos (gestor). */
  const idPessoaFiltro = ehGestor ? null : idPessoa

  const [mes, setMes] = useState(() => dayjs().format('YYYY-MM'))
  const referencia = `${mes}-01`

  const [industria, setIndustria] = useState(TODAS)
  const [operador, setOperador] = useState(TODAS)
  const [busca, setBusca] = useState('')
  const [limite, setLimite] = useState(PAGE_SIZE)
  const [aberto, setAberto] = useState<string | null>(null)

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

  const geradoEm = resumo.data?.find((r) => r.geradoEm)?.geradoEm
  const totalPositivados = (resumo.data ?? []).reduce((s, r) => s + r.positivados, 0)
  const varias = (resumo.data?.length ?? 0) > 1
  /** Gestor só vê os clientes depois de escolher uma indústria. */
  const mostrarClientes = !ehGestor || !!industria
  const colunas = 5 + (varias && !industria ? 1 : 0) + (ehGestor ? 1 : 0) + 2 /* 1ª compra e última (md+) */

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

      {!idPessoa && (
        <EmptyState
          message={
            PERMITIR_TROCA_USUARIO
              ? 'Escolha um usuário em “Entrar como…” no topo para ver as exclusivas.'
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

      {idPessoa && (carregandoGestor || resumo.loading) && (
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
            <p className="text-sm text-github-text-muted">
              <strong className="font-semibold text-github-text">{visiveis.length.toLocaleString('pt-BR')}</strong> clientes
              {industria && <> em {nomeIndustria(industria)}</>} · clique em um cliente para ver os pedidos
            </p>
            <div className="overflow-x-auto rounded-xl border border-github-border bg-github-bg-card">
              <table className="w-full text-left text-sm">
                <thead className="bg-github-bg-hover text-[10px] uppercase tracking-wide text-github-text-muted">
                  <tr>
                    <th className="py-2 pl-3 font-medium">Cliente</th>
                    {varias && !industria && <th className="px-2 py-2 font-medium">Indústria</th>}
                    {ehGestor && <th className="px-2 py-2 font-medium">Operador</th>}
                    <th className="px-2 py-2 text-right font-medium">Pedidos</th>
                    <th className="px-2 py-2 text-right font-medium">Venda líquida</th>
                    <th className="hidden px-2 py-2 font-medium md:table-cell">1ª compra</th>
                    <th className="hidden px-2 py-2 font-medium md:table-cell">Última</th>
                    <th className="py-2 pl-2 pr-3 font-medium">Situação</th>
                  </tr>
                </thead>
                <tbody>
                  {visiveis.slice(0, limite).map((c) => {
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
                              className={`inline-block whitespace-nowrap rounded px-1.5 text-[11px] font-medium ${
                                c.positivou ? 'bg-[#639922]/15 text-[#639922]' : 'bg-github-bg-hover text-github-text-muted'
                              }`}
                            >
                              {c.positivou ? 'Positivado' : 'Sem positivação'}
                            </span>
                          </td>
                        </tr>
                        {aberta && (
                          <tr className="border-t border-github-border bg-github-bg-hover/40">
                            <td colSpan={colunas} className="px-3 py-2">
                              <PedidosDoCliente referencia={referencia} cliente={c} idPessoaFiltro={idPessoaFiltro} />
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
    </div>
  )
}
