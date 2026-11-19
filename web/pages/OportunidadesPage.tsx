import { useEffect, useMemo, useState, type ReactNode } from 'react'
import axios from 'axios'
import dayjs from 'dayjs'
import { AlertTriangle, Check, ChevronDown, ChevronRight, Phone } from 'lucide-react'
import { ErrorState } from '../components/StateViews'
import { formatCurrency } from '../lib/format'
import { useApiResource } from '../lib/useApiResource'

/* ----------------------------- dados da demonstração ----------------------------- */

interface Produto {
  nome: string
  preco: number
  margemPct: number
}
interface KitLinha {
  produto: number
  nome: string
  preco: number
  qtd: number
  margemPct: number
}
/** O que a inteligência calculou para cada cliente. */
interface Analise {
  cliente: number
  status: 'ok' | 'sem_credito' | 'bloqueado'
  score: number
  prontidao: number
  potencial: number
  motivos: string[]
  alertas: string[]
  curva: string | null
  porte: string
  ciclo: { intervalo: number | null; recencia: number | null; ticket: number | null; pedidos6m: number }
  credito: { limite: number; saldo: number; disponivel: number | null }
  inad: { titulos: number; valor: number; dias: number } | null
  perfil: string[]
  reposicao: { nome: string; intervalo: number; dias: number; estado: string }[]
  afin: number
  jnj6: number
  kit: KitLinha[]
  total: number
  margemEst: number
}
interface Recompra extends Analise {
  ultimaCompra: string
  diasSemComprar: number
  valorUltimaCompra: number
  produtos: number[]
  qtds: Record<string, number>
}
interface Gatilho extends Analise {
  pedidoAtual: number
  faltam: number
  ultimaCompra: string
  produtosAtuais: number[]
}
type Novo = Analise
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
    universo: number
    amostrados: number
    candidatos: number
    bloqueados: number
    semCredito: number
    elegiveis: number
    grandes: number
    potencialGrandes: number
    fatiaJnjPct: number
    potencialElegiveis: number
  }
  metodo: { titulo: string; texto: string }[]
  produtos: Record<string, Produto>
  kit: KitItem[]
  recompra: Recompra[]
  gatilho: Gatilho[]
  novos: Novo[]
  grandesContas: { cliente: number; curva: string | null; potencial: number; afin: number; ticket: number | null }[]
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
const reais = (n: number) => formatCurrency(n)

/** "FIO DENTAL J&J REACH ESSENCIAL MENTA 100M" -> "Fio Dental J&J Reach Essencial Menta 100M" */
function bonito(nome: string) {
  return nome
    .toLowerCase()
    .split(' ')
    .map((p) => (p.includes('&') || p.length <= 2 ? p.toUpperCase() : p.charAt(0).toUpperCase() + p.slice(1)))
    .join(' ')
}

/** Troca o jargão da análise por linguagem de balcão. */
function simples(t: string): string {
  return t
    .replace(/^Já comprou J&J nos últimos (\d+) meses \((R\$ [\d.,]+)\)/, 'Já comprou um pouco de J&J ($2 nos últimos $1 meses): é só aumentar')
    .replace(/^Cliente ativo: compra a cada ~(\d+) dia\(s\)[.,]? ?[Úú]ltima há (\d+)/, 'Cliente que compra sempre: a cada ~$1 dia(s). Última compra há $2')
    .replace(/^Compra de outras marcas nas categorias do J&J \((R\$ [\d.,]+) em (\d+) meses\) e quase não compra J&J/, 'Gastou $1 em $2 meses com outras marcas do mesmo tipo de produto e quase não leva J&J: espaço aberto na prateleira dele')
    .replace(/^Repõe (.+?) a cada ~(\d+) dias; a última compra foi há (\d+): está na janela de reposição/, 'Costuma repor $1 a cada ~$2 dias e a última compra foi há $3: o estoque dele deve estar acabando, hora de ligar')
    .replace(/^Está há (\d+) dias sem comprar \(ciclo normal ~(\d+)\)/, 'Está há $1 dias sem comprar (o normal dele é a cada ~$2): ligue antes que compre de outro')
    .replace(/^Está sumindo: (\d+) dias sem comprar \(ciclo normal ~(\d+)\)/, 'Está sumindo: $1 dias sem comprar (o normal dele é a cada ~$2). Vale uma ligação agora')
    .replace(/^Compras caíram (\d+)% nos últimos (\d+) dias/, 'As compras dele caíram $1% nos últimos $2 dias: converse para entender')
    .replace(/^Sem limite de crédito cadastrado: confirmar antes de vender/, 'Sem limite de crédito cadastrado: confirme antes de fechar')
    .replace(/^Só (R\$ [\d.,]+) livres de (R\$ [\d.,]+) de limite/, 'Só $1 livres de $2 de limite: monte um pedido que caiba')
    .replace(/^Crédito livre apertado: (R\$ [\d.,]+)/, 'Crédito livre apertado: $1. Monte um pedido que caiba')
    .replace(/^Cliente grande: confirmar se já tem vendedor dedicado/, 'Cliente grande: veja se alguém já cuida dele')
    .replace(/^Título vencido há (\d+) dias \((R\$ [\d.,]+)\)\s*:? ?confirmar/, 'Tem boleto atrasado há $1 dias ($2): confirme com o financeiro antes de vender')
    .replace(/^Título vencido há (\d+) dias/, 'Tem boleto atrasado há $1 dias')
    .replace(/^Passou do ciclo de reposição de uma categoria do J&J: pode estar comprando em outro lugar/, 'Já passou da hora de repor um produto do tipo J&J: pode estar comprando em outro lugar')
    .replace(/(Farma E Alimentar|Farma|Alimentar|Glifage) · /g, '').replace(/(Farma E Alimentar|Farma|Alimentar|Glifage) - /g, '')
}

/** "Farma E Alimentar - Hpc Jmo" -> "Hpc Jmo" */
const categoria = (c: string) => c.replace(/^(Farma E Alimentar|Farma|Alimentar|Glifage) - /, '')

const ROTULO_CURVA: Record<string, string> = { A: 'Cliente top', B: 'Cliente bom', C: 'Dá para crescer' }

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

function Chip({ children, tom }: { children: ReactNode; tom: 'verde' | 'ambar' | 'vermelho' | 'neutro' }) {
  const cor = {
    verde: 'bg-[#639922]/15 text-[#639922]',
    ambar: 'bg-[#BA7517]/15 text-[#BA7517]',
    vermelho: 'bg-[#E24B4A]/15 text-[#E24B4A]',
    neutro: 'bg-github-bg-hover text-github-text-muted',
  }[tom]
  return <span className={`inline-block whitespace-nowrap rounded px-1.5 text-[11px] font-medium ${cor}`}>{children}</span>
}

function chipsStatus(a: Analise) {
  return (
    <>
      {a.status === 'ok' && <Chip tom="verde">Pode vender</Chip>}
      {a.status === 'sem_credito' && <Chip tom="ambar">Crédito curto</Chip>}
      {a.status === 'bloqueado' && <Chip tom="vermelho">Não vender agora</Chip>}
      {a.curva && <Chip tom="neutro">{ROTULO_CURVA[a.curva] ?? `Curva ${a.curva}`}</Chip>}
    </>
  )
}

/* ------------------------------------ página ------------------------------------ */

export default function OportunidadesPage() {
  const dados = useApiResource((signal) => carregar(signal), [])
  const [caminho, setCaminho] = useState<Caminho>('recompra')
  const [limite, setLimite] = useState(8)
  const [aberto, setAberto] = useState<number | null>(null)
  const [ligados, setLigados] = useState<Set<string>>(() => lerLigados())
  const [metodo, setMetodo] = useState(false)

  useEffect(() => {
    setLimite(8)
    setAberto(null)
  }, [caminho])

  const d = dados.data
  const produto = (id: number | string): Produto => d?.produtos[String(id)] ?? { nome: `Produto ${id}`, preco: 0, margemPct: 0 }
  const kitPadrao = useMemo<Linha[]>(
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

  const r = d.resumo
  const lista: Analise[] = caminho === 'recompra' ? d.recompra : caminho === 'gatilho' ? d.gatilho : d.novos
  const feitos = lista.filter((x) => ligados.has(`${caminho}:${x.cliente}`)).length
  const prontos = (l: Analise[]) => l.filter((x) => x.status === 'ok').length
  const voltando40 = Math.round(prontos(d.recompra) * 0.4)

  /* monta o pedido sugerido e o roteiro de cada cliente */
  function roteiro(c: Caminho, a: Analise): { base: string; linhas: Linha[]; fala: string; extra?: string; rotulo: string } {
    if (c === 'recompra') {
      const x = a as Recompra
      const linhas = x.produtos.map((p) => ({
        nome: bonito(produto(p).nome),
        preco: produto(p).preco,
        qtd: x.qtds[String(p)] ?? 1,
        margemPct: produto(p).margemPct,
      }))
      return {
        rotulo: 'Pedido sugerido',
        base: `Comprou ${reais(x.valorUltimaCompra)} em ${dayjs(x.ultimaCompra).format('DD/MM')} e está há ${x.diasSemComprar} dias sem comprar.`,
        linhas,
        fala: `“Oi! Aqui é da Solfarma. No mês passado você levou ${linhas
          .slice(0, 2)
          .map((l) => l.nome)
          .join(' e ')}. Estou separando os pedidos deste mês — posso repetir o que você levou?”`,
      }
    }
    if (c === 'gatilho') {
      const x = a as Gatilho
      // pedido NOVO que sozinho passa do valor da positivação: o que ele já leva primeiro, depois os mais vendidos
      const kitQtd = new Map(d!.kit.map((k) => [k.produto, k.qtd]))
      const ids = [...x.produtosAtuais, ...d!.kit.map((k) => k.produto)].filter((p, n, arr) => arr.indexOf(p) === n && produto(p).preco > 0)
      const linhas: Linha[] = []
      for (const p of ids) {
        if (totalLinhas(linhas) >= r.gatilhoValor) break
        const pr = produto(p)
        const falta = r.gatilhoValor - totalLinhas(linhas)
        const qtd = Math.max(1, Math.min(kitQtd.get(p) ?? 3, Math.ceil(falta / pr.preco)))
        linhas.push({ nome: bonito(pr.nome), preco: pr.preco, qtd, margemPct: pr.margemPct })
      }
      if (linhas.length && totalLinhas(linhas) < r.gatilhoValor) {
        linhas[0].qtd += Math.ceil((r.gatilhoValor - totalLinhas(linhas)) / linhas[0].preco)
      }
      const nomes = linhas.slice(0, 2).map((l) => l.nome).join(' e ')
      return {
        rotulo: 'Pedido novo sugerido',
        base: `Comprou em ${dayjs(x.ultimaCompra).format('DD/MM')}, mas o maior pedido dele foi de ${reais(x.pedidoAtual)}. Para positivar, ele precisa de um pedido NOVO de pelo menos ${reais(r.gatilhoValor)}.`,
        linhas,
        extra: `O pedido tem que passar de ${reais(r.gatilhoValor)} sozinho. Não vale somar com o pedido anterior`,
        fala: `“Oi! Aqui é da Solfarma. Estou fechando os pedidos de J&J deste mês e quero te passar ${nomes}. Montei um pedido de ${reais(totalLinhas(linhas))} para você, posso enviar?”`,
      }
    }
    const linhas: Linha[] = a.kit.length
      ? a.kit.map((k) => ({ nome: bonito(k.nome), preco: k.preco, qtd: k.qtd, margemPct: k.margemPct }))
      : kitPadrao
    return {
      rotulo: 'Pedido de entrada sugerido',
      base: `Compra pouco ou nada de J&J. Pelo que ele compra de outras marcas, pode levar cerca de ${reais(a.potencial)} por mês.`,
      linhas,
      extra: `Pode comprar cerca de ${reais(a.potencial)} por mês`,
      fala: `“Oi! Você já compra com a gente e queremos te apresentar a linha J&J, pensando no que você já vende${a.perfil.length ? ` (${categoria(a.perfil[0]).toLowerCase()})` : ''}. Posso montar um pedido de teste só com os que mais saem?”`,
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
          Três caminhos, do mais fácil para o mais difícil de vender. Cada cliente já vem com o que ele costuma comprar, quando precisa repor e se pode comprar. É só ligar e oferecer.
        </p>
        <p className="mt-2 rounded-lg border border-dashed border-github-border bg-github-bg-card px-3 py-2 text-xs text-github-text-muted">
          Demonstração com dados reais dos últimos 6 meses (até 18/11/2026). Clientes só pelo código. Os “novos” foram escolhidos entre uma parte dos clientes; tem mais gente boa por aí.
        </p>
        <button
          type="button"
          onClick={() => setMetodo((v) => !v)}
          aria-expanded={metodo}
          className="mt-2 flex items-center gap-1 text-sm font-medium text-github-text-link"
        >
          {metodo ? <ChevronDown size={15} /> : <ChevronRight size={15} />} Como a lista é escolhida
        </button>
        {metodo && (
          <ul className="mt-1 list-disc space-y-1 rounded-xl border border-github-border bg-github-bg-card py-3 pl-8 pr-3 text-sm">
            <li>Olhamos o que o cliente compra de outras marcas parecidas com a J&amp;J: quanto mais ele compra, mais espaço para a J&amp;J.</li>
            <li>Vemos há quanto tempo ele não compra e de quanto em quanto tempo costuma comprar. Passou da hora? Ele está precisando repor.</li>
            <li>Conferimos se ele pode comprar: limite de crédito livre e boletos atrasados. Quem não pode fica marcado, para você não perder tempo.</li>
            <li>Tudo vira uma nota de 0 a 100: quanto maior, mais fácil e mais vale a pena ligar. Comece pelas maiores.</li>
            <li>O pedido sugerido cabe no crédito do cliente e traz os produtos que mais combinam com o que ele já compra.</li>
          </ul>
        )}
      </div>

      <section aria-label="Os três caminhos" className="grid grid-cols-1 gap-2.5 md:grid-cols-3">
        {CAMINHOS.map((c) => {
          const ativo = caminho === c.id
          const l: Analise[] = c.id === 'recompra' ? d.recompra : c.id === 'gatilho' ? d.gatilho : d.novos
          const texto =
            c.id === 'recompra'
              ? `Compraram J&J nos últimos 6 meses e não compraram em novembro. Se 4 em cada 10 dos liberados voltarem (${voltando40}), são cerca de ${reais(voltando40 * r.ticketRecompra)} em vendas.`
              : c.id === 'gatilho'
                ? `Compraram, mas nenhum pedido chegou a ${reais(r.gatilhoValor)}. Eles já compram. Um pedido novo de pelo menos ${reais(r.gatilhoValor)} positiva o cliente para você.`
                : `Os ${d.novos.length} melhores entre ${r.elegiveis} clientes que compram produtos parecidos e ainda não levam J&J. Todos juntos podem comprar cerca de ${reais(r.potencialElegiveis)} por mês.`
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
                {l.length}
                <span className="ml-1 text-xs font-normal text-github-text-muted">
                  clientes · {prontos(l)} prontos para vender
                </span>
              </p>
              <p className="mt-2 text-xs text-github-text-muted">{texto}</p>
            </button>
          )
        })}
      </section>

      <p className="rounded-xl border border-github-border bg-github-bg-card px-3 py-2 text-xs text-github-text-muted">
        <strong className="text-github-text">Para o gestor:</strong> {r.grandes} clientes grandes (pedidos acima de R$ 2.500) compram produtos parecidos e quase não levam J&amp;J: podem render {reais(r.potencialGrandes)} por mês. Ficaram fora da lista das vendedoras porque provavelmente já têm alguém cuidando.
        {r.bloqueados + r.semCredito > 0 && (
          <> Além disso, {r.bloqueados + r.semCredito} clientes foram tirados da lista por falta de crédito ou boleto atrasado.</>
        )}
      </p>

      <section aria-label="Lista de clientes" className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-github-text-muted">
            <strong className="font-semibold text-github-text">{CAMINHOS.find((c) => c.id === caminho)?.titulo}</strong> · comece de cima: os primeiros têm mais chance. Clique no cliente para ver o roteiro
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
            const info = aberta ? roteiro(caminho, x) : null
            const resumoLinha =
              caminho === 'recompra'
                ? `Última compra ${reais((x as Recompra).valorUltimaCompra)} · ${(x as Recompra).diasSemComprar} dias atrás`
                : caminho === 'gatilho'
                  ? `Maior pedido ${reais((x as Gatilho).pedidoAtual)} · precisa de um pedido novo de ${reais(r.gatilhoValor)}`
                  : `Pode comprar ~${reais(x.potencial)} por mês · cliente ${x.porte.toLowerCase()}`
            const credito = x.credito
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
                    <span className="flex flex-wrap items-center gap-1.5">
                      <span className="text-sm font-semibold">Cliente {x.cliente}</span>
                      {chipsStatus(x)}
                    </span>
                    <span className="block text-xs text-github-text-muted">{resumoLinha}</span>
                  </span>
                  <span className="shrink-0 text-right" title="De 0 a 100: quanto maior, mais fácil e mais vale a pena ligar">
                    <span className="block text-lg font-semibold leading-none">{x.score}</span>
                    <span className="text-[10px] uppercase tracking-wide text-github-text-muted">chance</span>
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
                      <p className="text-xs font-semibold uppercase tracking-wide text-github-text-muted">1. Por que ligar agora</p>
                      <p className="mt-0.5">{info.base}</p>
                      {x.motivos.length > 0 && (
                        <ul className="mt-1 list-disc space-y-0.5 pl-5 text-github-text">
                          {x.motivos.map((m) => (
                            <li key={m}>{simples(m)}</li>
                          ))}
                        </ul>
                      )}
                      <p className="mt-1.5 text-xs text-github-text-muted">
                        {x.perfil.length > 0 && <>Compra mais: {x.perfil.map(categoria).join(', ')}. </>}
                        {x.ciclo.intervalo != null && <>Costuma pedir a cada ~{x.ciclo.intervalo} dia(s); o último foi há {x.ciclo.recencia}. </>}
                        {x.ciclo.ticket != null && <>Cada pedido dele é de cerca de {reais(x.ciclo.ticket)}.</>}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-github-text-muted">2. Antes de ligar, confira</p>
                      <ul className="mt-1 space-y-1">
                        <li className="text-xs">
                          Pode comprar a prazo?{' '}
                          {credito.disponivel == null ? (
                            <span className="text-[#BA7517]">sem limite cadastrado, confirme antes de fechar</span>
                          ) : (
                            <>
                              limite {reais(credito.limite)}, já usou {reais(credito.saldo)},{' '}
                              <strong className={credito.disponivel < 100 ? 'text-[#E24B4A]' : ''}>{reais(Math.max(credito.disponivel, 0))} livres para comprar</strong>
                              {info.linhas.length > 0 && credito.disponivel >= totalLinhas(info.linhas) && ' · o pedido sugerido cabe'}
                            </>
                          )}
                        </li>
                        <li className="text-xs">
                          Boletos atrasados:{' '}
                          {x.inad ? (
                            <span className="text-[#E24B4A]">
                              {x.inad.titulos} boleto(s) vencido(s), o mais antigo há {x.inad.dias} dias ({reais(x.inad.valor)}). Fale com o financeiro antes
                            </span>
                          ) : (
                            'nenhum, está em dia'
                          )}
                        </li>
                        {x.alertas.map((al) => (
                          <li key={al} className="flex items-start gap-1.5 text-xs text-[#BA7517]">
                            <AlertTriangle size={13} className="mt-0.5 shrink-0" /> {simples(al)}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-github-text-muted">3. O que oferecer</p>
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
                                <td className="whitespace-nowrap px-2 py-1.5 text-right">{reais(l.preco)}</td>
                                <td className="whitespace-nowrap py-1.5 pl-2 pr-3 text-right font-semibold">{reais(subtotal(l))}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <p className="mt-1.5 text-sm">
                        <strong>
                          {info.rotulo}: {reais(totalLinhas(info.linhas))}
                        </strong>
                        {info.extra && <span className="text-github-text-muted"> · {info.extra}</span>}
                      </p>
                      <p className="text-xs text-github-text-muted">
                        Se fechar, a empresa ganha cerca de {reais(margemLinhas(info.linhas))} de lucro nesse pedido (já descontado o que o fabricante devolve).
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-github-text-muted">4. O que falar na ligação</p>
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
