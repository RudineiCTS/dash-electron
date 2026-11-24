import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { ChevronDown, X } from 'lucide-react'
import { getDigitadoras, type Digitadora } from '../lib/digitadoras'
import { useApiResource } from '../lib/useApiResource'

interface DigitadoraComboboxProps {
  /** IDPessoaTelevendas selecionado, ou null. */
  value: number | null
  onChange: (idPersonSales: number | null) => void
  className?: string
  placeholder?: string
  ariaLabel?: string
}

/** "José" e "jose" se encontram: minúsculas e sem acento. */
function normalizar(texto: string) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

/**
 * Combobox (padrão ARIA 1.2) com todas as digitadoras: digite para filtrar por nome ou ID,
 * use ↑ ↓ Enter Esc, ou toque numa opção. Carrega a lista sozinho (GET televendas-base-digitadoras).
 */
export function DigitadoraCombobox({
  value,
  onChange,
  className = '',
  placeholder = 'Consultar pessoa…',
  ariaLabel = 'Consultar pessoa',
}: DigitadoraComboboxProps) {
  const { data, loading, error, reload } = useApiResource((signal) => getDigitadoras(signal), [])
  const listId = useId()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [aberto, setAberto] = useState(false)
  const [busca, setBusca] = useState('')
  const [ativo, setAtivo] = useState(0)

  const selecionada = useMemo(() => data?.find((d) => d.idPersonSales === value) ?? null, [data, value])

  const filtradas = useMemo(() => {
    const termo = normalizar(busca)
    if (!data) return []
    if (!termo) return data
    return data.filter((d) => normalizar(d.operatorName).includes(termo) || String(d.idPersonSales).includes(termo))
  }, [data, busca])

  // Mantém a opção ativa dentro do intervalo e visível ao navegar pelo teclado.
  useEffect(() => setAtivo(0), [busca])
  useEffect(() => {
    if (!aberto) return
    wrapperRef.current?.querySelector(`#${CSS.escape(`${listId}-${ativo}`)}`)?.scrollIntoView({ block: 'nearest' })
  }, [ativo, aberto, listId])

  function escolher(d: Digitadora | null) {
    onChange(d ? d.idPersonSales : null)
    setBusca('')
    setAberto(false)
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!aberto) setAberto(true)
      else setAtivo((i) => Math.min(i + 1, filtradas.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setAtivo((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && aberto && filtradas[ativo]) {
      e.preventDefault()
      escolher(filtradas[ativo])
    } else if (e.key === 'Escape') {
      setAberto(false)
      setBusca('')
    }
  }

  const textoInput = aberto ? busca : (selecionada?.operatorName ?? '')

  return (
    <div
      ref={wrapperRef}
      className={`relative ${className}`}
      onBlur={(e) => {
        // fecha só quando o foco sai do componente inteiro (não ao tocar numa opção)
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setAberto(false)
          setBusca('')
        }
      }}
    >
      <input
        type="text"
        role="combobox"
        aria-label={ariaLabel}
        title={selecionada?.operatorName}
        aria-expanded={aberto}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={aberto && filtradas[ativo] ? `${listId}-${ativo}` : undefined}
        autoComplete="off"
        value={textoInput}
        placeholder={loading ? 'Carregando pessoas…' : placeholder}
        onChange={(e) => {
          setBusca(e.target.value)
          setAberto(true)
        }}
        onFocus={() => setAberto(true)}
        onKeyDown={onKeyDown}
        className="h-9 w-full rounded-md border border-github-border bg-github-bg-card pl-2.5 pr-14 text-base text-github-text placeholder:text-github-text-muted sm:text-sm"
      />

      <div className="absolute inset-y-0 right-1 flex items-center gap-0.5">
        {value !== null && (
          <button
            type="button"
            aria-label="Limpar pessoa"
            onClick={() => escolher(null)}
            className="flex h-7 w-7 items-center justify-center rounded text-github-text-muted hover:text-github-text"
          >
            <X size={15} />
          </button>
        )}
        <ChevronDown size={16} className="pointer-events-none mr-1 text-github-text-muted" aria-hidden />
      </div>

      {aberto && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Pessoas"
          // onMouseDown evita o blur do input antes do clique registrar a escolha
          onMouseDown={(e) => e.preventDefault()}
          // no header o campo é estreito: a lista pode ser mais larga que ele (sem sair da tela)
          className="absolute left-0 top-full z-20 mt-1 max-h-64 w-72 min-w-full max-w-[calc(100vw-1rem)] overflow-y-auto rounded-md border border-github-border bg-github-bg-card py-1 text-github-text shadow-lg"
        >
          {loading && <li className="px-3 py-2 text-sm text-github-text-muted">Carregando…</li>}

          {error && (
            <li className="flex items-center justify-between gap-2 px-3 py-2 text-sm text-other-redflag">
              <span>{error}</span>
              <button type="button" onClick={reload} className="shrink-0 font-medium underline">
                Tentar de novo
              </button>
            </li>
          )}

          {data && filtradas.length === 0 && (
            <li className="px-3 py-2 text-sm text-github-text-muted">Ninguém encontrado para essa busca.</li>
          )}

          {filtradas.map((d, i) => (
            <li
              key={d.idPersonSales}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={d.idPersonSales === value}
              onClick={() => escolher(d)}
              onMouseEnter={() => setAtivo(i)}
              className={`cursor-pointer px-3 py-1.5 ${i === ativo ? 'bg-github-bg-hover' : ''} ${
                d.idPersonSales === value ? 'font-semibold' : ''
              }`}
            >
              <span className="block truncate text-sm text-github-text">{d.operatorName}</span>
              <span className="block truncate text-[11px] text-github-text-muted">
                #{d.idPersonSales} · {d.supervisorName}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
