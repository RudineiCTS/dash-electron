import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { Search } from 'lucide-react'
import { EmptyState, ErrorState } from '../components/StateViews'
import { getExclusivasClientes, getExclusivasResumo } from '../lib/exclusivas'
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

export default function ExclusivasPage() {
  const [mes, setMes] = useState(() => dayjs().format('YYYY-MM'))
  const referencia = `${mes}-01`

  const [industria, setIndustria] = useState(TODAS)
  const [operador, setOperador] = useState(TODAS)
  const [busca, setBusca] = useState('')
  const [limite, setLimite] = useState(PAGE_SIZE)

  const resumo = useApiResource((signal) => getExclusivasResumo(referencia, signal), [referencia])
  const clientes = useApiResource((signal) => getExclusivasClientes(referencia, signal), [referencia])

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

  function escolherIndustria(nome: string) {
    setIndustria((atual) => (atual === nome ? TODAS : nome))
    setOperador(TODAS)
    setLimite(PAGE_SIZE)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h1 className="text-lg font-extrabold">
          Exclusivas
          <span className="ml-2 text-xs font-medium tracking-[0.15em] text-github-btn-green-hover">POSITIVAÇÃO POR CLIENTE</span>
        </h1>
        <p className="text-sm text-github-text-muted">
          {resumo.data && (
            <>
              <strong className="font-semibold text-github-text">{totalPositivados.toLocaleString('pt-BR')}</strong> positivados
              {geradoEm && <> · atualizado em {dayjs(geradoEm).format('DD/MM HH:mm')}</>}
            </>
          )}
        </p>
      </div>

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
            }
          }}
          className={campo}
        />
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
      </section>

      {resumo.loading && <div className="h-24 animate-pulse rounded-xl border border-github-border bg-github-bg-card" aria-busy="true" />}
      {resumo.error && <ErrorState message={resumo.error} onRetry={resumo.reload} />}

      {resumo.data && resumo.data.length === 0 && (
        <EmptyState message="Ainda não há resultado de exclusivas para esse mês. A carga roda uma vez por dia." />
      )}

      {resumo.data && resumo.data.length > 0 && (
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
                    {formatCurrency(r.totalVenda)} · {r.operadores} {r.operadores === 1 ? 'operador' : 'operadores'}
                  </p>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {clientes.loading && <div className="h-40 animate-pulse rounded-xl border border-github-border bg-github-bg-card" aria-busy="true" />}
      {clientes.error && <ErrorState message={clientes.error} onRetry={clientes.reload} />}

      {clientes.data && clientes.data.length > 0 &&
        (visiveis.length === 0 ? (
          <EmptyState message="Nenhum cliente encontrado para esses filtros." />
        ) : (
          <section aria-label="Clientes" className="flex flex-col gap-2">
            <p className="text-sm text-github-text-muted">
              <strong className="font-semibold text-github-text">{visiveis.length.toLocaleString('pt-BR')}</strong> clientes
              {industria ? <> em {nomeIndustria(industria)}</> : <> em todas as indústrias</>}
            </p>
            <div className="overflow-x-auto rounded-xl border border-github-border bg-github-bg-card">
              <table className="w-full text-left text-sm">
                <thead className="bg-github-bg-hover text-[10px] uppercase tracking-wide text-github-text-muted">
                  <tr>
                    <th className="py-2 pl-3 font-medium">Cliente</th>
                    {!industria && <th className="px-2 py-2 font-medium">Indústria</th>}
                    <th className="px-2 py-2 font-medium">Operador</th>
                    <th className="px-2 py-2 text-right font-medium">Pedidos</th>
                    <th className="px-2 py-2 text-right font-medium">Venda líquida</th>
                    <th className="hidden px-2 py-2 font-medium md:table-cell">1ª compra</th>
                    <th className="hidden px-2 py-2 font-medium md:table-cell">Última</th>
                    <th className="py-2 pl-2 pr-3 font-medium">Situação</th>
                  </tr>
                </thead>
                <tbody>
                  {visiveis.slice(0, limite).map((c) => (
                    <tr
                      key={`${c.industria}-${c.idPessoaTelevendas}-${c.idPessoaCliente}`}
                      className="border-t border-github-border hover:bg-github-bg-hover"
                    >
                      <td className="max-w-[18rem] py-1.5 pl-3">
                        <p className="truncate font-semibold">{c.razaoSocial ?? '-'}</p>
                        <p className="text-xs text-github-text-muted">Cód. {c.idPessoaCliente ?? '-'}</p>
                      </td>
                      {!industria && (
                        <td className="whitespace-nowrap px-2 py-1.5 text-xs text-github-text-muted">{nomeIndustria(c.industria)}</td>
                      )}
                      <td className="max-w-[12rem] truncate px-2 py-1.5">{c.digitador ?? '-'}</td>
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
                  ))}
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
