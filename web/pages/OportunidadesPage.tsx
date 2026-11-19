import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import dayjs from 'dayjs'
import { Check, ChevronDown, ChevronRight, Phone } from 'lucide-react'
import { ErrorState } from '../components/StateViews'
import { formatCurrency } from '../lib/format'
import { useApiResource } from '../lib/useApiResource'

/* ----------------------------- dados da demonstração ----------------------------- */

interface Produto {
  nome: string
  preco: number
  margemPct: number
}
interface Recompra {
  cliente: number
  ultimaCompra: string
  diasSemComprar: number
  valorUltimaCompra: number
  produtos: number[]
  qtds: Record<string, number>
}
interface Gatilho {
  cliente: number
  pedidoAtual: number
  faltam: number
  ultimaCompra: string
  produtosAtuais: number[]
}
interface Novo {
  cliente: number
  curva: string
  valorUltimoPedido: number
  ultimoPedido: string
}
interface KitItem {
  produto: number
  preco: number
  margemPct: number
  clientes: number
  qtd: number
}
interface Dados {
  geradoEm: string
  observacao: string
  resumo: {
    margemLiquidaPct: number
    ticketRecompra: number
    ticketNovo: number
    clientesOutubro: number
    clientesRecompraNov: number
    semRecompra: number
    gatilhoValor: number
  }
  produtos: Record<string, Produto>
  kit: KitItem[]
  recompra: Recompra[]
  gatilho: Gatilho[]
  novos: Novo[]
}

async function carregar(signal: AbortSignal): Promise<Dados> {
  const r = await axios.get<Dados>(`${import.meta.env.BASE_URL}oportunidades-jnj.json`, { signal })
  return r.data
}

/* ----------------------------------- helpers ----------------------------------- */

type Caminho = 'recompra' | 'gatilho' | 'novos'

interface Linha {
  nome: string
  preco: number
  qtd: number
  margemPct: number
}

const subtotal = (l: Linha) => l.preco * l.qtd
const totalLinhas = (ls: Linha[]) => ls.reduce((s, l) => s + subtotal(l), 0)
const margemLinhas = (ls: Linha[]) => ls.reduce((s, l) => s + (subtotal(l) * l.margemPct) / 100, 0)

/** "FIO DENTAL J&J REACH ESSENCIAL MENTA 100M" -> "Fio Dental J&J Reach Essencial Menta 100M" */
function bonito(nome: string) {
  return nome
    .toLowerCase()
    .split(' ')
    .map((p) => (p.includes('&') || p.length <= 2 ? p.toUpperCase() : p.charAt(0).toUpperCase() + p.slice(1)))
    .join(' ')
}

const CHAVE = 'compass-web:oportunidades-ligados'
function lerLigados(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(CHAVE) ?? '[]') as string[])
  } catch {
    return new Set()
  }
}
function salvarLigados(s: Set<string>) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify([...s]))
  } catch {
    /* sem localStorage: vale só até recarregar */
  }
}

const CAMINHOS: { id: Caminho; numero: number; titulo: string }[] = [
  { id: 'recompra', numero: 1, titulo: 'Quem já comprou e sumiu' },
  { id: 'gatilho', numero: 2, titulo: 'Pedido quase lá' },
  { id: 'novos', numero: 3, titulo: 'Clientes novos' },
]

/* ------------------------------------ página ------------------------------------ */

export default function OportunidadesPage() {
  const dados = useApiResource((signal) => carregar(signal), [])
  const [caminho, setCaminho] = useState<Caminho>('recompra')
  const [limite, setLimite] = useState(8)
  const [aberto, setAberto] = useState<number | null>(null)
  const [ligados, setLigados] = useState<Set<string>>(() => lerLigados())

  useEffect(() => {
    setLimite(8)
    setAberto(null)
  }, [caminho])

  const d = dados.data

  const produto = (id: number | string): Produto => d?.produtos[String(id)] ?? { nome: `Produto ${id}`, preco: 0, margemPct: 0 }
  const kit = useMemo<Linha[]>(
    () => (d ? d.kit.map((k) => ({ nome: bonito(d.produtos[String(k.produto)]?.nome ?? ''), preco: k.preco, qtd: k.qtd, margemPct: k.margemPct })) : []),
    [d],
  )

  function alternar(chave: string) {
    setLigados((atual) => {
      const novo = new Set(atual)
      if (novo.has(chave)) novo.delete(chave)
      else novo.add(chave)
      salvarLigados(novo)
      return novo
    })
  }

  if (dados.loading) return <div className="h-40 animate-pulse rounded-xl border border-github-border bg-github-bg-card" aria-busy="true" />
  if (dados.error || !d) return <ErrorState message={dados.error ?? 'Não foi possível carregar.'} onRetry={dados.reload} />

  const gatilhoValor = d.resumo.gatilhoValor
  const voltando40 = Math.round(d.resumo.semRecompra * 0.4)
  const lista = caminho === 'recompra' ? d.recompra : caminho === 'gatilho' ? d.gatilho : d.novos
  const feitos = lista.filter((x) => ligados.has(`${caminho}:${x.cliente}`)).length

  /* monta o pedido sugerido e o roteiro de cada cliente */
  function roteiro(c: Caminho, cliente: number): { motivo: string; linhas: Linha[]; fala: string; extra?: string; rotulo: string } {
    if (c === 'recompra') {
      const r = d!.recompra.find((x) => x.cliente === cliente)!
      const linhas = r.produtos.map((p) => ({
        nome: bonito(produto(p).nome),
        preco: produto(p).preco,
        qtd: r.qtds[String(p)] ?? 1,
        margemPct: produto(p).margemPct,
      }))
      return {
        rotulo: 'Pedido sugerido',
        motivo: `Comprou ${formatCurrency(r.valorUltimaCompra)} em ${dayjs(r.ultimaCompra).format('DD/MM')} e está há ${r.diasSemComprar} dias sem comprar. É o cliente mais fácil: já conhece e comprou.`,
        linhas,
        fala: `“Oi! Aqui é da Solfarma. No mês passado você levou ${linhas
          .slice(0, 2)
          .map((l) => l.nome)
          .join(' e ')}. Estou separando os pedidos deste mês — posso repetir o que você levou?”`,
      }
    }
    if (c === 'gatilho') {
      const g = d!.gatilho.find((x) => x.cliente === cliente)!
      const jaTem = new Set(g.produtosAtuais)
      const candidato = d!.kit.find((k) => !jaTem.has(k.produto)) ?? d!.kit[0]
      const nome = bonito(produto(candidato.produto).nome)
      const qtd = Math.max(1, Math.ceil(g.faltam / candidato.preco))
      const linhas: Linha[] = [{ nome, preco: candidato.preco, qtd, margemPct: candidato.margemPct }]
      return {
        rotulo: 'Acrescentar ao pedido',
        motivo: `Comprou em ${dayjs(g.ultimaCompra).format('DD/MM')}, mas o maior pedido foi de ${formatCurrency(g.pedidoAtual)}. Faltam ${formatCurrency(g.faltam)} para chegar a ${formatCurrency(gatilhoValor)}.`,
        linhas,
        extra: `Pedido atual ${formatCurrency(g.pedidoAtual)} + sugestão = ${formatCurrency(g.pedidoAtual + totalLinhas(linhas))}`,
        fala: `“Seu último pedido ficou em ${formatCurrency(g.pedidoAtual)}. Posso incluir ${nome} para completar um pedido de ${formatCurrency(gatilhoValor)}?”`,
      }
    }
    const n = d!.novos.find((x) => x.cliente === cliente)!
    return {
      rotulo: 'Pedido de entrada sugerido',
      motivo: `Cliente ${n.curva === 'A' ? 'de maior porte' : 'importante'} da empresa (último pedido de ${formatCurrency(n.valorUltimoPedido)} em ${dayjs(n.ultimoPedido).format('DD/MM')}), de porte parecido com os seus, e que ainda não compra J&J.`,
      linhas: kit,
      fala: '“Oi! Você já compra com a gente e queremos te apresentar a linha J&J: Listerine, fio dental Reach, Band-Aid e absorventes. Posso montar um pedido de teste só com os que mais saem?”',
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
      <div>
        <h1 className="text-lg font-extrabold">
          Como vender mais J&amp;J
          <span className="ml-2 text-xs font-medium tracking-[0.15em] text-github-btn-green-hover">PASSO A PASSO</span>
        </h1>
        <p className="mt-1 text-sm text-github-text-muted">
          Três caminhos, do mais fácil para o mais difícil. Comece pelo 1: é quem já comprou de você.
        </p>
        <p className="mt-2 rounded-lg border border-dashed border-github-border bg-github-bg-card px-3 py-2 text-xs text-github-text-muted">
          Demonstração com dados reais de out/nov de 2026 (até 18/11). Os clientes aparecem só pelo código.
        </p>
      </div>

      <section aria-label="Os três caminhos" className="grid grid-cols-1 gap-2.5 md:grid-cols-3">
        {CAMINHOS.map((c) => {
          const ativo = caminho === c.id
          const qtd = c.id === 'recompra' ? d.recompra.length : c.id === 'gatilho' ? d.gatilho.length : d.novos.length
          const texto =
            c.id === 'recompra'
              ? `Compraram em outubro e ainda não voltaram. Se 4 em cada 10 voltarem (${voltando40} clientes): cerca de ${formatCurrency(voltando40 * d.resumo.ticketRecompra)} em vendas.`
              : c.id === 'gatilho'
                ? `Já compraram, mas nenhum pedido chegou a ${formatCurrency(gatilhoValor)}. Cada um que passar desse valor vira mais um positivado.`
                : `Clientes de porte parecido com os seus que ainda não compram J&J. O primeiro pedido médio de um cliente novo é de ${formatCurrency(d.resumo.ticketNovo)}.`
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={ativo}
              onClick={() => setCaminho(c.id)}
              className={`rounded-xl border p-3 text-left transition-colors ${
                ativo ? 'border-github-btn-green bg-github-bg-hover' : 'border-github-border bg-github-bg-card hover:bg-github-bg-hover'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#32307B] text-xs font-bold text-white">
                  {c.numero}
                </span>
                <span className="text-sm font-semibold">{c.titulo}</span>
              </div>
              <p className="mt-2 text-3xl font-semibold leading-none">
                {qtd}
                <span className="ml-1 text-xs font-normal text-github-text-muted">clientes</span>
              </p>
              <p className="mt-2 text-xs text-github-text-muted">{texto}</p>
            </button>
          )
        })}
      </section>

      <section aria-label="Lista de clientes" className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-github-text-muted">
            <strong className="font-semibold text-github-text">{CAMINHOS.find((c) => c.id === caminho)?.titulo}</strong> · clique em um cliente
            para ver o roteiro
          </p>
          <p className="text-sm text-github-text-muted">
            <strong className="font-semibold text-github-text">{feitos}</strong> de {lista.length} já ligados
          </p>
        </div>

        <ul className="flex flex-col gap-1.5">
          {lista.slice(0, limite).map((x) => {
            const chave = `${caminho}:${x.cliente}`
            const aberta = aberto === x.cliente
            const ligado = ligados.has(chave)
            const info = aberta ? roteiro(caminho, x.cliente) : null
            const resumoLinha =
              caminho === 'recompra'
                ? `Última compra ${formatCurrency((x as Recompra).valorUltimaCompra)} · ${(x as Recompra).diasSemComprar} dias atrás`
                : caminho === 'gatilho'
                  ? `Pedido de ${formatCurrency((x as Gatilho).pedidoAtual)} · faltam ${formatCurrency((x as Gatilho).faltam)}`
                  : `Último pedido ${formatCurrency((x as Novo).valorUltimoPedido)} · curva ${(x as Novo).curva}`
            return (
              <li key={chave} className="rounded-xl border border-github-border bg-github-bg-card">
                <button
                  type="button"
                  aria-expanded={aberta}
                  onClick={() => setAberto(aberta ? null : x.cliente)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left"
                >
                  {aberta ? <ChevronDown size={16} className="shrink-0" /> : <ChevronRight size={16} className="shrink-0" />}
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">Cliente {x.cliente}</span>
                    <span className="block text-xs text-github-text-muted">{resumoLinha}</span>
                  </span>
                  {ligado && (
                    <span className="flex items-center gap-1 rounded bg-[#639922]/15 px-1.5 text-[11px] font-medium text-[#639922]">
                      <Check size={12} /> Ligado
                    </span>
                  )}
                </button>

                {info && (
                  <div className="flex flex-col gap-3 border-t border-github-border px-3 py-3 text-sm">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-github-text-muted">1. Por que ligar</p>
                      <p className="mt-0.5">{info.motivo}</p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-github-text-muted">2. O que oferecer</p>
                      <div className="mt-1 overflow-x-auto rounded-lg border border-github-border">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-github-bg-hover text-[10px] uppercase tracking-wide text-github-text-muted">
                            <tr>
                              <th className="py-1.5 pl-3 font-medium">Produto</th>
                              <th className="px-2 py-1.5 text-right font-medium">Qtd</th>
                              <th className="px-2 py-1.5 text-right font-medium">Preço</th>
                              <th className="py-1.5 pl-2 pr-3 text-right font-medium">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {info.linhas.map((l) => (
                              <tr key={l.nome} className="border-t border-github-border">
                                <td className="py-1.5 pl-3">{l.nome}</td>
                                <td className="px-2 py-1.5 text-right">{l.qtd}</td>
                                <td className="whitespace-nowrap px-2 py-1.5 text-right">{formatCurrency(l.preco)}</td>
                                <td className="whitespace-nowrap py-1.5 pl-2 pr-3 text-right font-semibold">{formatCurrency(subtotal(l))}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <p className="mt-1.5 text-sm">
                        <strong>
                          {info.rotulo}: {formatCurrency(totalLinhas(info.linhas))}
                        </strong>
                        {info.extra && <span className="text-github-text-muted"> · {info.extra}</span>}
                      </p>
                      <p className="text-xs text-github-text-muted">
                        Margem líquida estimada: {formatCurrency(margemLinhas(info.linhas))} (
                        {totalLinhas(info.linhas) > 0 ? Math.round((margemLinhas(info.linhas) / totalLinhas(info.linhas)) * 100) : 0}%), já
                        considerando o reembolso do fabricante.
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-github-text-muted">3. O que falar</p>
                      <p className="mt-0.5 rounded-lg bg-github-bg-hover px-3 py-2 italic">{info.fala}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => alternar(chave)}
                      className={`flex h-9 w-fit items-center gap-2 rounded-md px-3 text-sm font-medium ${
                        ligado ? 'border border-github-border bg-github-bg-card' : 'bg-github-btn-green text-white'
                      }`}
                    >
                      <Phone size={15} /> {ligado ? 'Desmarcar ligação' : 'Marcar como ligado'}
                    </button>
                  </div>
                )}
              </li>
            )
          })}
        </ul>

        {lista.length > limite && (
          <button
            type="button"
            onClick={() => setLimite((n) => n + 8)}
            className="h-9 rounded-md border border-github-border bg-github-bg-card text-sm font-medium"
          >
            Mostrar mais ({lista.length - limite})
          </button>
        )}
      </section>
    </div>
  )
}
