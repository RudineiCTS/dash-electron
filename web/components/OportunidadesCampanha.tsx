import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronRight, ChevronUp, Loader2 } from 'lucide-react'
import {
  getClientesOportunidades,
  getContatoOportunidade,
  getItensOportunidade,
  getResumoOportunidades,
  type CaminhoOportunidade,
  type ClienteOportunidade,
  type ResumoCaminho,
} from '../lib/campanhaOportunidades'
import { formatCurrency } from '../lib/format'
import { useApiResource } from '../lib/useApiResource'
import { EmptyState, ErrorState } from './StateViews'

const TAMANHO = 30

const CAMINHOS: { id: CaminhoOportunidade; titulo: string; ajuda: string }[] = [
  { id: 'RECOMPRA', titulo: 'Quem já comprou e sumiu', ajuda: 'Já levou desta campanha e não comprou neste mês. É o mais fácil de vender.' },
  { id: 'OPORTUNIDADE_MES', titulo: 'Oportunidades do mês', ajuda: 'Comprou neste mês, mas nenhum pedido chegou a R$ 100. Cada pedido conta sozinho: ofereça um pedido novo e inteiro acima de R$ 100, não o que falta para o anterior.' },
  { id: 'NOVO', titulo: 'Clientes novos', ajuda: 'Compra produtos parecidos de outras marcas e quase não leva desta campanha.' },
]

const ORIGEM: Record<string, string> = {
  REPETIR: 'Ele já leva',
  REPOSICAO: 'Está na hora de repor',
  AINDA_NAO_LEVOU: 'Ainda não levou',
}

const SITUACAO: Record<string, { texto: string; classe: string }> = {
  OK: { texto: 'Liberado para vender', classe: 'text-green-700 dark:text-green-400' },
  SEM_CREDITO: { texto: 'Sem crédito livre', classe: 'text-other-redflag' },
  BLOQUEADO: { texto: 'Falar com o financeiro', classe: 'text-other-redflag' },
}

function chance(score: number) {
  return score >= 70 ? 'Alta' : score >= 40 ? 'Média' : 'Baixa'
}

function Itens({ idCampaign, idOportunidade }: { idCampaign: number; idOportunidade: number }) {
  const itens = useApiResource((signal) => getItensOportunidade(idCampaign, idOportunidade, signal), [idCampaign, idOportunidade])

  if (itens.loading) return <p className="text-xs text-github-text-muted">Carregando pedido sugerido…</p>
  if (itens.error) return <ErrorState message={itens.error} onRetry={itens.reload} />
  if (!itens.data?.length) return <p className="text-xs text-github-text-muted">Sem pedido sugerido para este cliente.</p>

  const total = itens.data.reduce((s, i) => s + i.quantidade * i.valorUnitario, 0)
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-medium">Pedido sugerido</p>
      <ul className="flex flex-col gap-1">
        {itens.data.map((i) => (
          <li key={i.ordem} className="flex flex-wrap items-baseline justify-between gap-x-3 text-sm">
            <span className="min-w-0 flex-1">
              {i.quantidade} × {i.produto ?? `Produto ${i.idProduto}`}
              <span className="ml-2 text-xs text-github-text-muted">{ORIGEM[i.origem] ?? i.origem}</span>
            </span>
            <span className="tabular-nums text-github-text-muted">{formatCurrency(i.quantidade * i.valorUnitario)}</span>
          </li>
        ))}
      </ul>
      <p className="text-right text-xs text-github-text-muted">Total sugerido: {formatCurrency(total)}</p>
      {total < 100 && (
        <p className="text-xs text-other-redflag">Este pedido sozinho não chega a R$ 100. Some mais produtos para o pedido valer.</p>
      )}
    </div>
  )
}

function Contato({ idCampaign, idOportunidade }: { idCampaign: number; idOportunidade: number }) {
  const contato = useApiResource((signal) => getContatoOportunidade(idCampaign, idOportunidade, signal), [idCampaign, idOportunidade])

  if (contato.loading) return <p className="text-xs text-github-text-muted">Carregando contato…</p>
  if (contato.error || !contato.data) return <p className="text-xs text-github-text-muted">Não foi possível carregar o contato deste cliente.</p>

  const { nome, razaoSocial, telefones } = contato.data
  return (
    <div className="flex flex-col gap-1 rounded-lg bg-github-bg-hover px-3 py-2">
      <p className="text-sm font-semibold">{nome ?? 'Nome não cadastrado'}</p>
      {razaoSocial && razaoSocial !== nome && <p className="text-xs text-github-text-muted">{razaoSocial}</p>}
      {telefones.length === 0 ? (
        <p className="text-sm text-github-text-muted">Sem telefone cadastrado.</p>
      ) : (
        <ul className="flex flex-wrap gap-x-4 gap-y-1">
          {telefones.map((t) => (
            <li key={`${t.tipo}-${t.numero}`} className="text-sm">
              <span className="text-xs text-github-text-muted">{t.tipo}: </span>
              <a href={`tel:${t.numero.replace(/\D/g, '')}`} className="font-medium underline">
                {t.numero}
              </a>
              {t.principal && <span className="ml-1 text-xs text-github-text-muted">(principal)</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Dado({ rotulo, valor, destaque = false }: { rotulo: string; valor: string; destaque?: boolean }) {
  return (
    <div className="flex flex-col">
      <dt className="text-xs text-github-text-muted">{rotulo}</dt>
      <dd className={destaque ? 'text-lg font-bold tabular-nums' : 'text-sm font-semibold tabular-nums'}>{valor}</dd>
    </div>
  )
}

function Cliente({ c, idCampaign }: { c: ClienteOportunidade; idCampaign: number }) {
  const [aberto, setAberto] = useState(false)
  const sit = SITUACAO[c.situacao] ?? { texto: c.situacao, classe: '' }
  const motivos = c.motivos?.split(' | ').filter(Boolean) ?? []
  const alertas = c.alertas?.split(' | ').filter(Boolean) ?? []

  return (
    <li className="rounded-xl border border-github-border bg-github-bg-card">
      <button
        type="button"
        aria-expanded={aberto}
        onClick={() => setAberto((a) => !a)}
        className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left"
      >
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold">
            {c.nome ?? 'Cliente'} <span className="font-normal text-github-text-muted">· cód. {c.idPessoaCliente}</span>
          </span>
          <span className={`block text-xs ${sit.classe}`}>{sit.texto}</span>
        </span>
        <span className="flex shrink-0 items-center gap-3 text-right text-xs text-github-text-muted">
          <span>
            <span className="block">Chance {chance(c.score)}</span>
            <span className="block">Pode comprar ~{formatCurrency(c.potencialMensal)}/mês</span>
          </span>
          {aberto ? <ChevronUp size={16} aria-hidden /> : <ChevronDown size={16} aria-hidden />}
        </span>
      </button>

      {aberto && (
        <div className="flex flex-col gap-3 border-t border-github-border px-3 py-3">
          <Contato idCampaign={idCampaign} idOportunidade={c.idCampanhaOportunidade} />

          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {c.creditoDisponivel != null && <Dado rotulo="Crédito livre para comprar" valor={formatCurrency(c.creditoDisponivel)} destaque />}
            {c.ticketMedio != null && <Dado rotulo="Pedido médio (todas as marcas)" valor={formatCurrency(c.ticketMedio)} />}
            {c.diasSemComprar != null && <Dado rotulo="Última compra desta campanha" valor={`há ${c.diasSemComprar} dias`} />}
          </dl>

          {motivos.length > 0 && (
            <ul className="list-disc pl-5 text-sm">
              {motivos.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          )}
          {alertas.length > 0 && (
            <ul className="list-disc pl-5 text-sm text-other-redflag">
              {alertas.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          )}
          {c.situacao === 'OK' && <Itens idCampaign={idCampaign} idOportunidade={c.idCampanhaOportunidade} />}
        </div>
      )}
    </li>
  )
}

/**
 * Card da página da campanha: mostra quantos clientes têm oportunidade e, ao clicar, abre a tela própria
 * (/campaigns/details/:id/oportunidades). Vem da carga diária da campanha; só aparece se houver carga.
 */
export function OportunidadesCampanha({ idCampaign, competencia }: { idCampaign: number; competencia: string }) {
  const resumo = useApiResource((signal) => getResumoOportunidades(idCampaign, signal), [idCampaign])

  // sem carga para esta campanha: o card nem aparece
  if (resumo.loading || resumo.error || !resumo.data || resumo.data.length === 0) return null

  const clientes = resumo.data.reduce((s, r) => s + r.clientes, 0)
  const prontos = resumo.data.reduce((s, r) => s + r.prontos, 0)

  return (
    <Link
      to={`/campaigns/details/${idCampaign}/oportunidades?competencia=${competencia}`}
      className="flex w-full items-center justify-between gap-3 rounded-xl border border-github-border bg-github-bg-card px-4 py-3 hover:bg-github-bg-hover"
    >
      <span className="min-w-0">
        <span className="block text-base font-semibold">Oportunidades</span>
        <span className="block text-sm text-github-text-muted">
          {prontos.toLocaleString('pt-BR')} clientes liberados para vender mais desta campanha ({clientes.toLocaleString('pt-BR')} no total)
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-1 text-sm font-medium">
        Ver todas
        <ChevronRight size={16} aria-hidden />
      </span>
    </Link>
  )
}

export function PainelOportunidades({ idCampaign, resumo }: { idCampaign: number; resumo: ResumoCaminho[] }) {
  const [caminho, setCaminho] = useState<CaminhoOportunidade>('RECOMPRA')
  const [somenteProntos, setSomenteProntos] = useState(true)
  const [busca, setBusca] = useState('')
  const [pagina, setPagina] = useState(1)
  const [ordem, setOrdem] = useState('chance:desc')
  const [ordenar, direcao] = ordem.split(':') as [string, 'asc' | 'desc']

  const lista = useApiResource(
    (signal) =>
      getClientesOportunidades(idCampaign, caminho, { somenteProntos, busca: busca.trim(), pagina: 1, tamanho: TAMANHO * pagina, ordenar, direcao }, signal),
    [idCampaign, caminho, somenteProntos, busca, pagina, ordem],
  )

  const contagem = (id: CaminhoOportunidade) => resumo.find((r) => r.caminho === id)
  const atual = CAMINHOS.find((c) => c.id === caminho)!

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-github-text-muted">Comece de cima: os primeiros têm mais chance de comprar.</p>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
        {CAMINHOS.map((c, i) => {
          const r = contagem(c.id)
          const ativo = c.id === caminho
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={ativo}
              onClick={() => {
                setCaminho(c.id)
                setPagina(1)
              }}
              className={`rounded-xl border px-3 py-2.5 text-left ${ativo ? 'border-[#32307B] bg-[#32307B] text-white' : 'border-github-border bg-github-bg-card hover:bg-github-bg-hover'}`}
            >
              <span className="block text-xs opacity-80">Caminho {i + 1}</span>
              <span className="block text-sm font-semibold">{c.titulo}</span>
              <span className="block text-xs opacity-80">
                {r ? `${r.prontos} liberados para vender · ${r.clientes} no total` : 'Nenhum cliente'}
              </span>
            </button>
          )
        })}
      </div>

      <p className="text-xs text-github-text-muted">{atual.ajuda}</p>

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          inputMode="numeric"
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value.replace(/\D/g, ''))
            setPagina(1)
          }}
          placeholder="Buscar pelo código do cliente"
          aria-label="Buscar pelo código do cliente"
          className="h-9 w-full rounded-md border border-github-border bg-github-bg-card px-3 text-base placeholder:text-github-text-muted sm:w-64 sm:text-sm"
        />
        <label className="flex items-center gap-2 text-sm">
          <span className="text-github-text-muted">Ordenar por</span>
          <select
            value={ordem}
            onChange={(e) => {
              setOrdem(e.target.value)
              setPagina(1)
            }}
            className="h-9 rounded-md border border-github-border bg-github-bg-card px-2 text-base sm:text-sm"
          >
            <option value="chance:desc">Maior chance de comprar</option>
            <option value="chance:asc">Menor chance de comprar</option>
            <option value="potencial:desc">Maior potencial por mês</option>
            <option value="ticket:desc">Maior ticket médio</option>
            <option value="dias:desc">Mais tempo sem comprar</option>
            <option value="dias:asc">Menos tempo sem comprar</option>
            <option value="nome:asc">Nome do cliente (A a Z)</option>
            <option value="nome:desc">Nome do cliente (Z a A)</option>
            <option value="codigo:asc">Código do cliente (menor)</option>
            <option value="codigo:desc">Código do cliente (maior)</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={somenteProntos}
            onChange={(e) => {
              setSomenteProntos(e.target.checked)
              setPagina(1)
            }}
            className="h-4 w-4"
          />
          Só clientes liberados para vender
        </label>
        <p className="basis-full text-xs text-github-text-muted">
          Liberado = cadastro ativo, sem boleto vencido há mais de 7 dias e com crédito livre. Desmarque para ver também quem está com pendência no financeiro.
        </p>
      </div>

      {lista.loading && (
        <div className="flex flex-col gap-2" role="status" aria-live="polite" aria-busy="true">
          <p className="flex items-center gap-2 text-sm text-github-text-muted">
            <Loader2 size={16} className="animate-spin" /> Carregando clientes…
          </p>
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl border border-github-border bg-github-bg-card" />
          ))}
        </div>
      )}
      {lista.error && <ErrorState message={lista.error} onRetry={lista.reload} />}
      {lista.data && lista.data.itens.length === 0 && <EmptyState message="Nenhum cliente neste caminho com esse filtro." />}

      {lista.data && lista.data.itens.length > 0 && (
        <>
          <ul className="flex flex-col gap-2">
            {lista.data.itens.map((c) => (
              <Cliente key={c.idCampanhaOportunidade} c={c} idCampaign={idCampaign} />
            ))}
          </ul>
          <div className="flex items-center justify-between text-xs text-github-text-muted">
            <span>
              Mostrando {lista.data.itens.length} de {lista.data.total}
            </span>
            {lista.data.itens.length < lista.data.total && (
              <button
                type="button"
                onClick={() => setPagina((p) => p + 1)}
                className="h-9 rounded-md border border-github-border px-4 text-sm font-medium text-github-text hover:bg-github-bg-hover"
              >
                Ver mais
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
