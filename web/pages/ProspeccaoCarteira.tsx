import { useMemo, useState } from 'react'
import { useOrdenacao } from '../lib/ordenar'
import { ThOrdenavel } from '../components/ThOrdenavel'
import dayjs from 'dayjs'
import { Search } from 'lucide-react'
import { BotaoExportarExcel } from '../components/BotaoExportarExcel'
import { EmptyState, ErrorState } from '../components/StateViews'
import { exportarExcel } from '../lib/exportarExcel'
import { formatCurrency } from '../lib/format'
import { getProspeccaoCarteira } from '../lib/prospeccao'
import { useApiResource } from '../lib/useApiResource'

const PAGE_SIZE = 40
const campo = 'h-9 rounded-md border border-github-border bg-github-bg-card px-2.5 text-sm text-github-text'

type Situacao = 'todos' | 'vendeu' | 'pendentes'

interface Props {
  /** Operadora logada; `null` = gestor (escolhe uma operadora para ver a carteira). */
  idPessoaTelevendas: number | null
  /** Operadoras que o gestor pode escolher. */
  operadoras: { id: number; nome: string }[]
}

/**
 * Carteira de prospecção: todos os clientes que a operadora deve trabalhar no mês atual (inteiro),
 * marcando quem já está positivado no mês e quem ainda está pendente.
 * Gestor: precisa escolher uma operadora (a carteira de todas junta é grande demais para abrir de uma vez).
 */
export function ProspeccaoCarteira({ idPessoaTelevendas, operadoras }: Props) {
  const ehGestor = idPessoaTelevendas == null
  const [escolhida, setEscolhida] = useState<number | null>(null)
  const [situacao, setSituacao] = useState<Situacao>('todos')
  const [busca, setBusca] = useState('')
  const [limite, setLimite] = useState(PAGE_SIZE)

  const idFiltro = ehGestor ? escolhida : idPessoaTelevendas
  const carteira = useApiResource(
    (signal) => (idFiltro ? getProspeccaoCarteira(idFiltro, signal) : Promise.resolve([])),
    [idFiltro],
  )

  const todos = useMemo(() => carteira.data ?? [], [carteira.data])
  const venderam = todos.filter((c) => c.noPainel).length
  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return todos.filter(
      (c) =>
        (situacao === 'todos' || (situacao === 'vendeu' ? c.noPainel : !c.noPainel)) &&
        (!termo || (c.nomeCliente ?? '').toLowerCase().includes(termo) || String(c.idCliente).includes(termo)),
    )
  }, [todos, situacao, busca])

  const { ordenadas, ord, alternar } = useOrdenacao(visiveis, {
    cliente: (c) => c.nomeCliente,
    situacao: (c) => c.noPainel,
    cadastro: (c) => c.dataCadastroCliente,
    limite: (c) => c.limiteUtilizado,
    telefone: (c) => c.telefone,
    vendas: (c) => c.vendas3Meses,
  })

  /** Baixa a carteira (com os filtros e a ordem que estão na tela). */
  function baixarExcel() {
    const nome = operadoras.find((o) => o.id === idFiltro)?.nome ?? String(idFiltro ?? '')
    exportarExcel({
      arquivo: `prospeccao-carteira-${nome}-${dayjs().format('YYYY-MM')}`.replace(/\s+/g, '-'),
      aba: 'Carteira',
      linhas: ordenadas,
      colunas: [
        { titulo: 'Cód. cliente', tipo: 'numero', largura: 12, valor: (c) => c.idCliente },
        { titulo: 'Cliente', largura: 44, valor: (c) => c.nomeCliente },
        { titulo: 'Situação', largura: 16, valor: (c) => (c.noPainel ? 'Positivado' : 'Não positivado') },
        { titulo: 'Cadastro', largura: 12, valor: (c) => (c.dataCadastroCliente ? dayjs(c.dataCadastroCliente).format('DD/MM/YYYY') : null) },
        { titulo: 'Limite utilizado', tipo: 'moeda', largura: 16, valor: (c) => c.limiteUtilizado },
        { titulo: 'Telefone', largura: 18, valor: (c) => c.telefone },
        { titulo: 'Telefone 2', largura: 18, valor: (c) => c.telefone2 },
        { titulo: 'Vendas 3 meses', tipo: 'moeda', largura: 16, valor: (c) => c.vendas3Meses },
      ],
    })
  }

  return (
    <section aria-label="Carteira" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-2">
        {ehGestor && (
          <label className="flex flex-col gap-1 text-xs text-github-text-muted">
            Operadora
            <select
              className={campo}
              value={escolhida ?? ''}
              onChange={(e) => {
                setEscolhida(e.target.value ? Number(e.target.value) : null)
                setLimite(PAGE_SIZE)
              }}
            >
              <option value="">Escolha uma operadora</option>
              {operadoras.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.nome}
                </option>
              ))}
            </select>
          </label>
        )}
        {idFiltro != null && (
          <>
            <label className="flex flex-col gap-1 text-xs text-github-text-muted">
              Situação
              <select className={campo} value={situacao} onChange={(e) => { setSituacao(e.target.value as Situacao); setLimite(PAGE_SIZE) }}>
                <option value="todos">Todos</option>
                <option value="pendentes">Não positivados</option>
                <option value="vendeu">Positivados</option>
              </select>
            </label>
            <label className="relative flex flex-col gap-1 text-xs text-github-text-muted">
              Buscar cliente
              <Search size={14} className="pointer-events-none absolute bottom-2.5 left-2.5 text-github-text-muted" />
              <input
                className={`${campo} pl-8`}
                placeholder="Nome ou código"
                value={busca}
                onChange={(e) => { setBusca(e.target.value); setLimite(PAGE_SIZE) }}
              />
            </label>
          </>
        )}
      </div>

      {idFiltro == null ? (
        <EmptyState message="Escolha uma operadora para ver a carteira dela." />
      ) : carteira.error ? (
        <ErrorState message={carteira.error} onRetry={carteira.reload} />
      ) : carteira.loading ? (
        <div className="h-40 animate-pulse rounded-xl border border-github-border bg-github-bg-card" aria-busy="true" />
      ) : todos.length === 0 ? (
        <EmptyState message="Nenhum cliente na carteira neste mês." />
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-github-text-muted">
              <strong className="font-semibold text-github-text">{todos.length.toLocaleString('pt-BR')}</strong> clientes na carteira ·{' '}
              <strong className="font-semibold text-github-text">{venderam.toLocaleString('pt-BR')}</strong> positivados ·{' '}
              <strong className="font-semibold text-github-text">{(todos.length - venderam).toLocaleString('pt-BR')}</strong> não positivados
            </p>
            <BotaoExportarExcel total={ordenadas.length} onClick={baixarExcel} />
          </div>
          <div className="overflow-x-auto rounded-xl border border-github-border bg-github-bg-card">
            <table className="w-full text-left text-sm">
              <thead className="text-[11px] uppercase tracking-wide text-github-text-muted">
                <tr className="border-b border-github-border">
                  <ThOrdenavel rotulo="Cliente" chave="cliente" ord={ord} onAlternar={alternar} className="py-2 pl-3 font-medium" />
                  <ThOrdenavel rotulo="Situação" chave="situacao" ord={ord} onAlternar={alternar} className="px-2 py-2 font-medium" />
                  <ThOrdenavel rotulo="Cadastro" chave="cadastro" ord={ord} onAlternar={alternar} className="hidden px-2 py-2 font-medium md:table-cell" />
                  <ThOrdenavel rotulo="Limite utilizado" chave="limite" ord={ord} onAlternar={alternar} direita className="hidden px-2 py-2 text-right font-medium md:table-cell" />
                  <ThOrdenavel rotulo="Telefone" chave="telefone" ord={ord} onAlternar={alternar} className="px-2 py-2 font-medium" />
                  <ThOrdenavel rotulo="Vendas 3 meses" chave="vendas" ord={ord} onAlternar={alternar} direita className="whitespace-nowrap py-2 pl-2 pr-3 text-right font-medium" />
                </tr>
              </thead>
              <tbody>
                {ordenadas.slice(0, limite).map((c) => (
                  <tr key={c.idCliente} className="border-b border-github-border last:border-0">
                    <td className="py-2 pl-3">
                      <span className="font-medium">{c.nomeCliente ?? `Cliente ${c.idCliente}`}</span>
                      <span className="ml-1.5 text-xs text-github-text-muted">{c.idCliente}</span>
                    </td>
                    <td className="px-2 py-2">
                      <span
                        className={`inline-block whitespace-nowrap rounded px-1.5 text-[11px] font-medium ${
                          c.noPainel ? 'bg-[#639922]/15 text-[#639922]' : 'bg-github-bg-hover text-github-text-muted'
                        }`}
                      >
                        {c.noPainel ? 'Positivado' : 'Não positivado'}
                      </span>
                    </td>
                    <td className="hidden whitespace-nowrap px-2 py-2 text-github-text-muted md:table-cell">
                      {c.dataCadastroCliente ? dayjs(c.dataCadastroCliente).format('DD/MM/YYYY') : '-'}
                    </td>
                    <td className="hidden whitespace-nowrap px-2 py-2 text-right md:table-cell">{formatCurrency(c.limiteUtilizado)}</td>
                    <td className="whitespace-nowrap px-2 py-2 text-github-text-muted">
                      {[c.telefone, c.telefone2].filter((t) => !!t?.trim()).join(' · ') || '-'}
                    </td>
                    <td className="whitespace-nowrap py-2 pl-2 pr-3 text-right font-semibold">{formatCurrency(c.vendas3Meses)}</td>
                  </tr>
                ))}
                {visiveis.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-sm text-github-text-muted">
                      Nenhum cliente com esses filtros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {visiveis.length > limite && (
            <button
              type="button"
              onClick={() => setLimite((n) => n + PAGE_SIZE)}
              className="h-9 rounded-md border border-github-border bg-github-bg-card text-sm font-medium"
            >
              Mostrar mais ({visiveis.length - limite})
            </button>
          )}
        </>
      )}
    </section>
  )
}
