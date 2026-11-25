import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { Search } from 'lucide-react'
import { getCampaignSummaryPerPeriod } from '@shared/services/campaign.teleseler'
import { Switch } from '../../components/Switch'
import { CardListSkeleton, EmptyState, ErrorState } from '../../components/StateViews'
import { defaultCompetencia, monthToCompetencia } from '../../lib/format'
import { useApiResource } from '../../lib/useApiResource'
import {
  getVisibilidades,
  indexarVisibilidades,
  salvarVisibilidade,
  type VisibilidadeCampanha,
} from '../../lib/visibilidade'

type Campo = 'hidePrize' | 'hideAssessed'

const campo = 'h-9 rounded-md border border-github-border bg-github-bg-card px-2.5 text-sm text-github-text'

function mensagemDeErro(err: unknown): string {
  if (isAxiosError(err)) {
    const status = err.response?.status
    if (status === 401 || status === 403) return 'Sem permissão: só administrador altera a visibilidade.'
    if (!err.response) return 'Sem conexão com o servidor. A alteração não foi salva.'
    if (status && status >= 500) {
      return 'O servidor não conseguiu salvar. Confira se o script da tabela (Compass_CampanhaVisibilidade.sql) foi executado.'
    }
  }
  return 'Não foi possível salvar a alteração.'
}

/**
 * Configuração: quais campanhas escondem o prêmio e/ou o apurado dos usuários comuns.
 * O administrador continua vendo tudo. Cada chave salva na hora; se falhar, volta ao valor anterior.
 * Esconder o apurado também esconde o percentual de atingimento (senão o valor sairia de meta x percentual).
 */
export default function VisibilidadeCampanhas() {
  const [params, setParams] = useSearchParams()
  const competencia = params.get('competencia') ?? defaultCompetencia()
  const [busca, setBusca] = useState('')

  const campanhas = useApiResource((signal) => getCampaignSummaryPerPeriod(competencia, signal), [competencia])
  const regrasApi = useApiResource((signal) => getVisibilidades(signal), [])

  const [regras, setRegras] = useState<ReadonlyMap<number, VisibilidadeCampanha>>(new Map())
  const [salvando, setSalvando] = useState<ReadonlySet<number>>(new Set())
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (regrasApi.data) setRegras(indexarVisibilidades(regrasApi.data))
  }, [regrasApi.data])

  const lista = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return [...(campanhas.data ?? [])]
      .filter((c) => !termo || `${c.campaignDescription} ${c.idCampaign}`.toLowerCase().includes(termo))
      .sort((a, b) => a.idCampaign - b.idCampaign)
  }, [campanhas.data, busca])

  const comRegra = (campanhas.data ?? []).filter((c) => {
    const r = regras.get(c.idCampaign)
    return r && (r.hidePrize || r.hideAssessed)
  }).length

  async function alterar(idCampaign: number, qual: Campo, valor: boolean) {
    const anterior = regras.get(idCampaign) ?? { idCampaign, hidePrize: false, hideAssessed: false }
    const nova: VisibilidadeCampanha = { ...anterior, [qual]: valor }

    setErro(null)
    setRegras((atual) => new Map(atual).set(idCampaign, nova)) // aparece já; volta se falhar
    setSalvando((atual) => new Set(atual).add(idCampaign))
    try {
      await salvarVisibilidade(idCampaign, nova.hidePrize, nova.hideAssessed)
    } catch (err) {
      setRegras((atual) => new Map(atual).set(idCampaign, anterior))
      setErro(mensagemDeErro(err))
    } finally {
      setSalvando((atual) => {
        const proximo = new Set(atual)
        proximo.delete(idCampaign)
        return proximo
      })
    }
  }

  return (
    <section aria-label="Visibilidade das campanhas" className="flex flex-col gap-3">
      <div>
        <h2 className="text-base font-extrabold">Visibilidade das campanhas</h2>
        <p className="mt-1 text-sm text-github-text-muted">
          Escolha o que some das campanhas para os usuários que não são administradores. Você, como administrador,
          continua vendo tudo, com um aviso nas campanhas escondidas.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="month"
          aria-label="Competência"
          value={competencia.slice(0, 7)}
          onChange={(e) => {
            const proxima = monthToCompetencia(e.target.value)
            if (!proxima) return
            setParams(
              (prev) => {
                const next = new URLSearchParams(prev)
                next.set('competencia', proxima)
                return next
              },
              { replace: true },
            )
          }}
          className={campo}
        />
        <label className="relative block w-full sm:w-72">
          <span className="sr-only">Buscar campanha</span>
          <Search size={16} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-github-text-muted" />
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar campanha ou número"
            className={`${campo} w-full pl-8 placeholder:text-github-text-muted`}
          />
        </label>
        {campanhas.data && (
          <p className="text-sm text-github-text-muted sm:ml-auto">
            <strong className="font-semibold text-github-text">{comRegra}</strong> de {campanhas.data.length} com algo
            escondido
          </p>
        )}
      </div>

      {erro && (
        <p role="alert" className="rounded-lg border border-other-redflag px-3 py-2 text-sm text-other-redflag">
          {erro}
        </p>
      )}

      {(campanhas.loading || regrasApi.loading) && <CardListSkeleton count={3} />}
      {campanhas.error && <ErrorState message={campanhas.error} onRetry={campanhas.reload} />}
      {regrasApi.error && !campanhas.error && <ErrorState message={regrasApi.error} onRetry={regrasApi.reload} />}

      {campanhas.data && regrasApi.data && !campanhas.error && !regrasApi.error &&
        (lista.length === 0 ? (
          <EmptyState message="Nenhuma campanha encontrada." />
        ) : (
          <ul className="grid grid-cols-1 gap-2.5 lg:grid-cols-2">
            {lista.map((c) => {
              const regra = regras.get(c.idCampaign)
              const ocupado = salvando.has(c.idCampaign)
              return (
                <li key={c.idCampaign} className="rounded-xl border border-github-border bg-github-bg-card p-3">
                  <p className="text-xs text-github-text-muted">
                    #{c.idCampaign} · {c.campaignTypeDescription}
                  </p>
                  <h3 className="line-clamp-2 text-sm font-semibold">{c.campaignDescription}</h3>

                  <div className="mt-2 flex flex-col gap-1.5">
                    <label className="flex items-center justify-between gap-3 rounded-lg bg-github-bg-hover px-3 py-2 text-sm">
                      <span>Esconder prêmio</span>
                      <Switch
                        label={`Esconder prêmio da campanha ${c.idCampaign}`}
                        checked={!!regra?.hidePrize}
                        disabled={ocupado}
                        onChange={(v) => alterar(c.idCampaign, 'hidePrize', v)}
                      />
                    </label>
                    <label className="flex items-center justify-between gap-3 rounded-lg bg-github-bg-hover px-3 py-2 text-sm">
                      <span>
                        Esconder apurado
                        <span className="block text-[11px] text-github-text-muted">Também esconde o percentual de atingimento</span>
                      </span>
                      <Switch
                        label={`Esconder apurado da campanha ${c.idCampaign}`}
                        checked={!!regra?.hideAssessed}
                        disabled={ocupado}
                        onChange={(v) => alterar(c.idCampaign, 'hideAssessed', v)}
                      />
                    </label>
                  </div>
                </li>
              )
            })}
          </ul>
        ))}
    </section>
  )
}
