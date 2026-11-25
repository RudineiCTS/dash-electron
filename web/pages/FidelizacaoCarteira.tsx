import { useMemo, useState } from 'react'
import { useOrdenacao } from '../lib/ordenar'
import { ThOrdenavel } from '../components/ThOrdenavel'
import dayjs from 'dayjs'
import { Download, Search } from 'lucide-react'
import { EmptyState, ErrorState } from '../components/StateViews'
import { exportarExcel } from '../lib/exportarExcel'
import { getFidelizacaoCarteira } from '../lib/fidelizacao'
import { formatCurrency } from '../lib/format'
import { useApiResource } from '../lib/useApiResource'

const PAGE_SIZE = 40
const campo = 'h-9 rounded-md border border-github-border bg-github-bg-card px-2.5 text-sm text-github-text'

type Situacao = 'todos' | 'com' | 'sem'
type TipoCarteira = 'todas' | 'LOJA VIRTUAL' | 'SETOR'

interface Props {
  idPeriodo: number
  idPessoa: number
  /** Nome da pessoa, só para o nome do arquivo e do título. */
  nomePessoa: string
}

/**
 * Carteira de uma pessoa no período da Fidelização: os clientes dela e quem já teve compra nos KPIs calculados.
 * A ligação é pelo id da pessoa (IDPessoaTelevendas) e pelo cenário do período.
 */
export function FidelizacaoCarteira({ idPeriodo, idPessoa, nomePessoa }: Props) {
  const carteira = useApiResource((signal) => getFidelizacaoCarteira(idPeriodo, idPessoa, signal), [idPeriodo, idPessoa])
  const [situacao, setSituacao] = useState<Situacao>('todos')
  const [tipoCarteira, setTipoCarteira] = useState<TipoCarteira>('todas')
  const [busca, setBusca] = useState('')
  const [limite, setLimite] = useState(PAGE_SIZE)

  const todos = useMemo(() => carteira.data ?? [], [carteira.data])
  const qtdLojaVirtual = todos.filter((c) => c.tipoCarteira === 'LOJA VIRTUAL').length
  // base = filtros de carteira e de busca; é ela que a legenda conta (a Situação só separa positivados de não positivados)
  const base = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return todos.filter(
      (c) =>
        (tipoCarteira === 'todas' || c.tipoCarteira === tipoCarteira) &&
        (!termo || (c.nomeCliente ?? '').toLowerCase().includes(termo) || String(c.idPessoaCliente).includes(termo)),
    )
  }, [todos, tipoCarteira, busca])
  const comCompra = base.filter((c) => c.comCompra).length
  const visiveis = useMemo(
    () => base.filter((c) => situacao === 'todos' || (situacao === 'com' ? c.comCompra : !c.comCompra)),
    [base, situacao],
  )

  const { ordenadas, ord, alternar } = useOrdenacao(visiveis, {
    cliente: (c) => c.nomeCliente,
    situacao: (c) => c.comCompra,
    carteira: (c) => c.tipoCarteira,
    cadastro: (c) => c.dataCadastroCliente,
    limite: (c) => c.limiteDisponivel,
    telefone: (c) => c.telefone,
  })

  function baixarExcel() {
    exportarExcel({
      arquivo: `fidelizacao-carteira-${nomePessoa}-${idPeriodo}`.replace(/\s+/g, '-'),
      aba: 'Carteira',
      linhas: visiveis,
      colunas: [
        { titulo: 'Código', tipo: 'numero', largura: 10, valor: (c) => c.idPessoaCliente },
        { titulo: 'Cliente', largura: 40, valor: (c) => c.nomeCliente },
        { titulo: 'Situação', largura: 16, valor: (c) => (c.comCompra ? 'Positivado' : 'Não positivado') },
        { titulo: 'Tipo de carteira', largura: 16, valor: (c) => c.tipoCarteira },
        { titulo: 'Cadastro', largura: 12, valor: (c) => (c.dataCadastroCliente ? dayjs(c.dataCadastroCliente).format('DD/MM/YYYY') : '') },
        { titulo: 'Limite disponível', tipo: 'moeda', largura: 16, valor: (c) => c.limiteDisponivel },
        { titulo: 'Telefone', largura: 16, valor: (c) => c.telefone },
        { titulo: 'Telefone 2', largura: 16, valor: (c) => c.telefone2 },
      ],
    })
  }

  if (carteira.loading) return <div className="h-40 animate-pulse rounded-xl border border-github-border bg-github-bg-card" aria-busy="true" />
  if (carteira.error) return <ErrorState message={carteira.error} onRetry={carteira.reload} />
  if (todos.length === 0) return <EmptyState message="Esta pessoa não tem carteira neste período." />

  return (
    <section aria-label="Carteira" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 text-xs text-github-text-muted">
            Situação
            <select
              className={campo}
              value={situacao}
              onChange={(e) => {
                setSituacao(e.target.value as Situacao)
                setLimite(PAGE_SIZE)
              }}
            >
              <option value="todos">Todos</option>
              <option value="com">Positivados</option>
              <option value="sem">Não positivados</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-github-text-muted">
            Carteira
            <select
              className={campo}
              value={tipoCarteira}
              onChange={(e) => {
                setTipoCarteira(e.target.value as TipoCarteira)
                setLimite(PAGE_SIZE)
              }}
            >
              <option value="todas">Todas</option>
              <option value="LOJA VIRTUAL">Loja Virtual ({qtdLojaVirtual.toLocaleString('pt-BR')})</option>
              <option value="SETOR">Setor ({(todos.length - qtdLojaVirtual).toLocaleString('pt-BR')})</option>
            </select>
          </label>
          <label className="relative flex flex-col gap-1 text-xs text-github-text-muted">
            Buscar cliente
            <Search size={14} className="pointer-events-none absolute bottom-2.5 left-2.5 text-github-text-muted" />
            <input
              className={`${campo} pl-8`}
              placeholder="Nome ou código"
              value={busca}
              onChange={(e) => {
                setBusca(e.target.value)
                setLimite(PAGE_SIZE)
              }}
            />
          </label>
        </div>
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
        <strong className="font-semibold text-github-text">{base.length.toLocaleString('pt-BR')}</strong> clientes{' '}
        {tipoCarteira === 'SETOR' ? 'no Setor' : tipoCarteira === 'LOJA VIRTUAL' ? 'na Loja Virtual' : 'na carteira'} ·{' '}
        <strong className="font-semibold text-github-text">{comCompra.toLocaleString('pt-BR')}</strong> positivados ·{' '}
        <strong className="font-semibold text-github-text">{(base.length - comCompra).toLocaleString('pt-BR')}</strong> não positivados
      </p>

      <div className="overflow-x-auto rounded-xl border border-github-border bg-github-bg-card">
        <table className="w-full text-left text-sm">
          <thead className="text-[11px] uppercase tracking-wide text-github-text-muted">
            <tr className="border-b border-github-border">
              <ThOrdenavel rotulo="Cliente" chave="cliente" ord={ord} onAlternar={alternar} className="py-2 pl-3 font-medium" />
              <ThOrdenavel rotulo="Situação" chave="situacao" ord={ord} onAlternar={alternar} className="px-2 py-2 font-medium" />
              <ThOrdenavel rotulo="Carteira" chave="carteira" ord={ord} onAlternar={alternar} className="hidden px-2 py-2 font-medium sm:table-cell" />
              <ThOrdenavel rotulo="Cadastro" chave="cadastro" ord={ord} onAlternar={alternar} className="hidden px-2 py-2 font-medium md:table-cell" />
              <ThOrdenavel rotulo="Limite disponível" chave="limite" ord={ord} onAlternar={alternar} direita className="hidden px-2 py-2 text-right font-medium md:table-cell" />
              <ThOrdenavel rotulo="Telefone" chave="telefone" ord={ord} onAlternar={alternar} className="py-2 pl-2 pr-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {ordenadas.slice(0, limite).map((c) => (
              <tr key={c.idPessoaCliente} className="border-b border-github-border last:border-0">
                <td className="py-2 pl-3">
                  <span className="font-medium">{c.nomeCliente ?? `Cliente ${c.idPessoaCliente}`}</span>
                  <span className="ml-1.5 text-xs text-github-text-muted">{c.idPessoaCliente}</span>
                </td>
                <td className="px-2 py-2">
                  <span
                    className={`inline-block whitespace-nowrap rounded px-1.5 text-[11px] font-medium ${
                      c.comCompra ? 'bg-[#639922]/15 text-[#639922]' : 'bg-github-bg-hover text-github-text-muted'
                    }`}
                  >
                    {c.comCompra ? 'Positivado' : 'Não positivado'}
                  </span>
                </td>
                <td className="hidden whitespace-nowrap px-2 py-2 sm:table-cell">
                  <span
                    className={`inline-block rounded px-1.5 text-[11px] font-medium ${
                      c.tipoCarteira === 'LOJA VIRTUAL' ? 'bg-[#32307B]/10 text-[#32307B] dark:text-[#a5a2e6]' : 'bg-github-bg-hover text-github-text-muted'
                    }`}
                  >
                    {c.tipoCarteira === 'LOJA VIRTUAL' ? 'Loja Virtual' : 'Setor'}
                  </span>
                </td>
                <td className="hidden whitespace-nowrap px-2 py-2 text-github-text-muted md:table-cell">
                  {c.dataCadastroCliente ? dayjs(c.dataCadastroCliente).format('DD/MM/YYYY') : '-'}
                </td>
                <td className="hidden whitespace-nowrap px-2 py-2 text-right md:table-cell">{formatCurrency(c.limiteDisponivel)}</td>
                <td className="whitespace-nowrap py-2 pl-2 pr-3 text-github-text-muted">
                  {[c.telefone, c.telefone2].filter((t) => !!t?.trim()).join(' · ') || '-'}
                </td>
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
      <p className="text-xs text-github-text-muted">
        “Positivado” é o cliente que aparece nos clientes calculados dos KPIs desta pessoa no período.
      </p>
    </section>
  )
}
