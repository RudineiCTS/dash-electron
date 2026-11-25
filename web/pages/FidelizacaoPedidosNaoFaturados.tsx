import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { Download, Search } from 'lucide-react'
import { EmptyState, ErrorState } from '../components/StateViews'
import { ThOrdenavel } from '../components/ThOrdenavel'
import { exportarExcel } from '../lib/exportarExcel'
import { getFidelizacaoPedidosNaoFaturados, type FidelizacaoPedidoNaoFaturado } from '../lib/fidelizacao'
import { formatCurrency } from '../lib/format'
import { useOrdenacao } from '../lib/ordenar'
import { useApiResource } from '../lib/useApiResource'

const PAGE_SIZE = 40
const campo = 'h-9 rounded-md border border-github-border bg-github-bg-card px-2.5 text-sm text-github-text'

type GrupoSituacao = 'todas' | 'afaturar' | 'excluidas' | 'devolucoes'
type Origem = 'todas' | 'CARTEIRA' | 'DIGITOU' | 'AMBOS'
type TipoCarteira = 'todas' | 'LOJA VIRTUAL' | 'SETOR'

/** Situação do pedido (operação 4): 1 Aberto, 2 Liberado, 3 Estoque, 4 A Faturar; 6 Excluída; 7 Devolução Parcial; 8 Devolução Total. */
function grupoDe(idSituacao: number): Exclude<GrupoSituacao, 'todas'> {
  if (idSituacao === 6) return 'excluidas'
  if (idSituacao === 7 || idSituacao === 8) return 'devolucoes'
  return 'afaturar'
}

const ROTULO_ORIGEM: Record<string, string> = { CARTEIRA: 'Carteira', DIGITOU: 'Digitou', AMBOS: 'Carteira e digitou' }

function corDaSituacao(idSituacao: number) {
  const g = grupoDe(idSituacao)
  if (g === 'excluidas') return 'bg-other-redflag/10 text-other-redflag'
  if (g === 'devolucoes') return 'bg-[#BA7517]/15 text-[#BA7517]'
  return 'bg-[#639922]/15 text-[#639922]'
}

interface Props {
  /** Período que está aberto na tela. */
  idPeriodo: number
  idPessoa: number
  nomePessoa: string
}

/**
 * Pedidos que ainda não entraram na apuração (a apuração só vê pedido faturado): não faturados, excluídos e devoluções,
 * da carteira da pessoa ou digitados por ela. Vem da tabela gravada pela procedure
 * uspUsuComissaoVendasPedidoNaoFaturadoCarga, que guarda um período só (o da última carga).
 */
export function FidelizacaoPedidosNaoFaturados({ idPeriodo, idPessoa, nomePessoa }: Props) {
  const resposta = useApiResource((signal) => getFidelizacaoPedidosNaoFaturados(idPessoa, signal), [idPessoa])
  const [grupo, setGrupo] = useState<GrupoSituacao>('todas')
  const [origem, setOrigem] = useState<Origem>('todas')
  const [tipoCarteira, setTipoCarteira] = useState<TipoCarteira>('todas')
  const [busca, setBusca] = useState('')
  const [limite, setLimite] = useState(PAGE_SIZE)

  const todos = useMemo(() => resposta.data?.itens ?? [], [resposta.data])

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return todos.filter(
      (p) =>
        (grupo === 'todas' || grupoDe(p.idSituacao) === grupo) &&
        (origem === 'todas' || p.origem === origem) &&
        (tipoCarteira === 'todas' || p.tipoCarteira === tipoCarteira) &&
        (!termo ||
          (p.nomeCliente ?? '').toLowerCase().includes(termo) ||
          String(p.idCliente).includes(termo) ||
          String(p.idPedido).includes(termo) ||
          String(p.idPrePedido ?? '').includes(termo)),
    )
  }, [todos, grupo, origem, tipoCarteira, busca])

  const { ordenadas, ord, alternar } = useOrdenacao(visiveis, {
    pedido: (p) => p.idPedido,
    cliente: (p) => p.nomeCliente,
    situacao: (p) => p.situacao,
    origem: (p) => p.origem,
    carteira: (p) => p.tipoCarteira,
    origemPedido: (p) => p.origemDoPedido,
    data: (p) => p.dataPedido,
    valor: (p) => p.valorTotal,
  })

  /** Totais por grupo, sobre o que passou nos filtros de origem, carteira e busca (a situação só separa os grupos). */
  const totais = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    const base = todos.filter(
      (p) =>
        (origem === 'todas' || p.origem === origem) &&
        (tipoCarteira === 'todas' || p.tipoCarteira === tipoCarteira) &&
        (!termo ||
          (p.nomeCliente ?? '').toLowerCase().includes(termo) ||
          String(p.idCliente).includes(termo) ||
          String(p.idPedido).includes(termo) ||
          String(p.idPrePedido ?? '').includes(termo)),
    )
    const soma = (g: Exclude<GrupoSituacao, 'todas'>) => {
      const l = base.filter((p) => grupoDe(p.idSituacao) === g)
      return { qtd: l.length, valor: l.reduce((s, p) => s + p.valorTotal, 0) }
    }
    return { afaturar: soma('afaturar'), excluidas: soma('excluidas'), devolucoes: soma('devolucoes') }
  }, [todos, origem, tipoCarteira, busca])

  function baixarExcel() {
    exportarExcel<FidelizacaoPedidoNaoFaturado>({
      arquivo: `pedidos-nao-faturados-${nomePessoa}-${idPeriodo}`.replace(/\s+/g, '-'),
      aba: 'Pedidos',
      linhas: ordenadas,
      colunas: [
        { titulo: 'Pedido', tipo: 'numero', largura: 12, valor: (p) => p.idPedido },
        { titulo: 'Pré-pedido', tipo: 'numero', largura: 12, valor: (p) => p.idPrePedido },
        { titulo: 'Cód. cliente', tipo: 'numero', largura: 12, valor: (p) => p.idCliente },
        { titulo: 'Cliente', largura: 40, valor: (p) => p.nomeCliente },
        { titulo: 'Situação', largura: 18, valor: (p) => p.situacao },
        { titulo: 'Origem', largura: 18, valor: (p) => ROTULO_ORIGEM[p.origem] ?? p.origem },
        { titulo: 'Carteira', largura: 14, valor: (p) => (p.tipoCarteira === 'LOJA VIRTUAL' ? 'Loja Virtual' : 'Setor') },
        { titulo: 'Origem do pedido', largura: 26, valor: (p) => p.origemDoPedido },
        { titulo: 'Data do pedido', largura: 14, valor: (p) => dayjs(p.dataPedido).format('DD/MM/YYYY') },
        { titulo: 'Valor', tipo: 'moeda', largura: 14, valor: (p) => p.valorTotal },
      ],
    })
  }

  if (resposta.loading) return <div className="h-40 animate-pulse rounded-xl border border-github-border bg-github-bg-card" aria-busy="true" />
  if (resposta.error) return <ErrorState message={resposta.error} onRetry={resposta.reload} />

  const dados = resposta.data
  if (!dados || dados.idPeriodo == null) {
    return <EmptyState message="Os pedidos não faturados ainda não foram carregados." />
  }
  if (dados.idPeriodo !== idPeriodo) {
    return <EmptyState message="Os pedidos não faturados estão carregados para outro período. Escolha o período mais recente para ver." />
  }
  if (todos.length === 0) return <EmptyState message="Esta pessoa não tem pedidos não faturados, excluídos ou com devolução neste período." />

  const cartao = (id: Exclude<GrupoSituacao, 'todas'>, titulo: string, ajuda: string, t: { qtd: number; valor: number }) => (
    <button
      key={id}
      type="button"
      aria-pressed={grupo === id}
      onClick={() => {
        setGrupo(grupo === id ? 'todas' : id)
        setLimite(PAGE_SIZE)
      }}
      className={`rounded-xl border px-3 py-2 text-left ${grupo === id ? 'border-[#32307B] bg-[#32307B]/10' : 'border-github-border bg-github-bg-card hover:bg-github-bg-hover'}`}
    >
      <span className="block text-[11px] uppercase tracking-wide text-github-text-muted">{titulo}</span>
      <span className="block text-lg font-bold tabular-nums">{formatCurrency(t.valor)}</span>
      <span className="block text-xs text-github-text-muted">
        {t.qtd.toLocaleString('pt-BR')} {t.qtd === 1 ? 'pedido' : 'pedidos'} · {ajuda}
      </span>
    </button>
  )

  return (
    <section aria-label="Pedidos não faturados" className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {cartao('afaturar', 'A faturar', 'ainda não entrou na apuração', totais.afaturar)}
        {cartao('excluidas', 'Excluídos', 'não contam', totais.excluidas)}
        {cartao('devolucoes', 'Devoluções', 'parcial ou total', totais.devolucoes)}
      </div>

      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 text-xs text-github-text-muted">
            Origem
            <select
              className={campo}
              value={origem}
              onChange={(e) => {
                setOrigem(e.target.value as Origem)
                setLimite(PAGE_SIZE)
              }}
            >
              <option value="todas">Todas</option>
              <option value="CARTEIRA">Carteira</option>
              <option value="DIGITOU">Digitou</option>
              <option value="AMBOS">Carteira e digitou</option>
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
              <option value="LOJA VIRTUAL">Loja Virtual</option>
              <option value="SETOR">Setor</option>
            </select>
          </label>
          <label className="relative flex flex-col gap-1 text-xs text-github-text-muted">
            Buscar
            <Search size={14} className="pointer-events-none absolute bottom-2.5 left-2.5 text-github-text-muted" />
            <input
              className={`${campo} pl-8`}
              placeholder="Cliente, código ou pedido"
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

      <p className="text-xs text-github-text-muted">
        Pedidos da carteira ou digitados por {nomePessoa}. O valor é o total da nota (na devolução parcial, não é só o que foi devolvido).
        {dados.geradoEm && <> Atualizado em {dayjs(dados.geradoEm).format('DD/MM HH:mm')}.</>}
      </p>

      <div className="overflow-x-auto rounded-xl border border-github-border bg-github-bg-card">
        <table className="w-full text-left text-sm">
          <thead className="text-[11px] uppercase tracking-wide text-github-text-muted">
            <tr className="border-b border-github-border">
              <ThOrdenavel rotulo="Pedido" chave="pedido" ord={ord} onAlternar={alternar} className="py-2 pl-3 font-medium" />
              <ThOrdenavel rotulo="Cliente" chave="cliente" ord={ord} onAlternar={alternar} className="px-2 py-2 font-medium" />
              <ThOrdenavel rotulo="Situação" chave="situacao" ord={ord} onAlternar={alternar} className="px-2 py-2 font-medium" />
              <ThOrdenavel rotulo="Origem" chave="origem" ord={ord} onAlternar={alternar} className="hidden px-2 py-2 font-medium md:table-cell" />
              <ThOrdenavel rotulo="Carteira" chave="carteira" ord={ord} onAlternar={alternar} className="hidden px-2 py-2 font-medium sm:table-cell" />
              <ThOrdenavel rotulo="Origem do pedido" chave="origemPedido" ord={ord} onAlternar={alternar} className="hidden px-2 py-2 font-medium lg:table-cell" />
              <ThOrdenavel rotulo="Data" chave="data" ord={ord} onAlternar={alternar} className="hidden px-2 py-2 font-medium md:table-cell" />
              <ThOrdenavel rotulo="Valor" chave="valor" ord={ord} onAlternar={alternar} direita className="py-2 pl-2 pr-3 text-right font-medium" />
            </tr>
          </thead>
          <tbody>
            {ordenadas.slice(0, limite).map((p) => (
              <tr key={`${p.idPedido}-${p.idPrePedido ?? ''}`} className="border-b border-github-border last:border-0">
                <td className="whitespace-nowrap py-2 pl-3">
                  <span className="font-medium">{p.idPedido}</span>
                  {p.idPrePedido != null && <span className="ml-1.5 text-xs text-github-text-muted">pré {p.idPrePedido}</span>}
                </td>
                <td className="px-2 py-2">
                  <span className="font-medium">{p.nomeCliente ?? `Cliente ${p.idCliente}`}</span>
                  <span className="ml-1.5 text-xs text-github-text-muted">{p.idCliente}</span>
                </td>
                <td className="px-2 py-2">
                  <span className={`inline-block whitespace-nowrap rounded px-1.5 text-[11px] font-medium ${corDaSituacao(p.idSituacao)}`}>{p.situacao}</span>
                </td>
                <td className="hidden whitespace-nowrap px-2 py-2 text-github-text-muted md:table-cell">{ROTULO_ORIGEM[p.origem] ?? p.origem}</td>
                <td className="hidden whitespace-nowrap px-2 py-2 sm:table-cell">
                  <span
                    className={`inline-block rounded px-1.5 text-[11px] font-medium ${
                      p.tipoCarteira === 'LOJA VIRTUAL' ? 'bg-[#32307B]/10 text-[#32307B] dark:text-[#a5a2e6]' : 'bg-github-bg-hover text-github-text-muted'
                    }`}
                  >
                    {p.tipoCarteira === 'LOJA VIRTUAL' ? 'Loja Virtual' : 'Setor'}
                  </span>
                </td>
                <td className="hidden max-w-[12rem] truncate px-2 py-2 text-github-text-muted lg:table-cell" title={p.origemDoPedido ?? ''}>
                  {p.origemDoPedido ?? '-'}
                </td>
                <td className="hidden whitespace-nowrap px-2 py-2 text-github-text-muted md:table-cell">{dayjs(p.dataPedido).format('DD/MM/YYYY')}</td>
                <td className="whitespace-nowrap py-2 pl-2 pr-3 text-right font-semibold">{formatCurrency(p.valorTotal)}</td>
              </tr>
            ))}
            {visiveis.length === 0 && (
              <tr>
                <td colSpan={8} className="py-6 text-center text-sm text-github-text-muted">
                  Nenhum pedido com esses filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {visiveis.length > limite && (
        <button
          type="button"
          onClick={() => setLimite((l) => l + PAGE_SIZE)}
          className="mx-auto h-9 rounded-md border border-github-border px-4 text-sm font-medium hover:bg-github-bg-hover"
        >
          Mostrar mais ({(visiveis.length - limite).toLocaleString('pt-BR')})
        </button>
      )}
    </section>
  )
}
