import { useState } from 'react'
import { DigitadoraCombobox } from '../components/DigitadoraCombobox'
import { EmptyState } from '../components/StateViews'
import { PedidosNaoFaturados } from '../components/PedidosNaoFaturados'
import { getDigitadora } from '../lib/digitadoras'
import { useApiResource } from '../lib/useApiResource'

interface Props {
  mes: string
  onMes: (mes: string) => void
  /** Pessoa logada (null se não está ligada a uma pessoa do televendas). */
  idPessoa: number | null
  /** Gestor escolhe de quem ver; os demais veem só os próprios pedidos. */
  ehGestor: boolean
}

/** Aba "Pedidos não faturados" das Exclusivas: só o que a pessoa DIGITOU (não faturado, excluído ou devolução). */
export function ExclusivasPedidosNaoFaturados({ mes, onMes, idPessoa, ehGestor }: Props) {
  const [escolhida, setEscolhida] = useState<number | null>(null)
  const alvo = ehGestor ? escolhida : idPessoa
  const pessoa = useApiResource((signal) => (alvo ? getDigitadora(alvo, signal) : Promise.resolve(null)), [alvo])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-2">
        <input
          type="month"
          aria-label="Mês"
          value={mes}
          onChange={(e) => e.target.value && onMes(e.target.value)}
          className="h-9 rounded-md border border-github-border bg-github-bg-card px-2.5 text-sm text-github-text"
        />
        {ehGestor && (
          <DigitadoraCombobox
            value={escolhida}
            onChange={setEscolhida}
            ariaLabel="Escolher a pessoa"
            placeholder="Escolha a pessoa…"
            className="min-w-0 flex-1 sm:max-w-xs sm:flex-none sm:basis-72"
          />
        )}
      </div>

      {alvo ? (
        <PedidosNaoFaturados idPessoa={alvo} mes={mes} nomePessoa={pessoa.data?.operatorName ?? 'a pessoa'} />
      ) : (
        <EmptyState message={ehGestor ? 'Escolha a pessoa para ver os pedidos que ela digitou.' : 'Seu usuário não está ligado a uma pessoa do televendas.'} />
      )}
    </div>
  )
}
