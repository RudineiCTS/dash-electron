import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react'
import { CommissionScenario, CommissionScenarioCopyRequest } from '../interfaces/CommissionScenario'
import { copyCommissionScenario, getCommissionScenarios } from '../services/commissionScenario'

interface CommissionScenarioContextValue {
    scenarios: CommissionScenario[]
    loading: boolean
    error: string
    refetch: () => void
    copying: boolean
    copyError: string
    copyScenario: (request: CommissionScenarioCopyRequest) => Promise<boolean>
}

const CommissionScenarioContext = createContext<CommissionScenarioContextValue | undefined>(undefined)

export function CommissionScenarioProvider({ children }: { children: ReactNode }) {
    const [scenarios, setScenarios] = useState<CommissionScenario[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [copying, setCopying] = useState(false)
    const [copyError, setCopyError] = useState('')
    const [reloadToken, setReloadToken] = useState(0)

    const fetchScenarios = useCallback(async (signal?: AbortSignal) => {
        try {
            setLoading(true)
            setError('')
            const data = await getCommissionScenarios(10, signal)
            setScenarios(data)
        } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') return
            setError('Erro ao buscar os cenários de comissão')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        const controller = new AbortController()
        fetchScenarios(controller.signal)
        return () => controller.abort()
    }, [fetchScenarios, reloadToken])

    const refetch = useCallback(() => setReloadToken((t) => t + 1), [])

    const copyScenario = useCallback(async (request: CommissionScenarioCopyRequest) => {
        setCopying(true)
        setCopyError('')
        try {
            const result = await copyCommissionScenario(request)
            if (!result.success) {
                setCopyError(result.errorMessage ?? 'Erro ao copiar o cenário.')
                return false
            }
            refetch()
            return true
        } catch {
            setCopyError('Erro ao copiar o cenário.')
            return false
        } finally {
            setCopying(false)
        }
    }, [refetch])

    return (
        <CommissionScenarioContext.Provider
            value={{ scenarios, loading, error, refetch, copying, copyError, copyScenario }}
        >
            {children}
        </CommissionScenarioContext.Provider>
    )
}

export function useCommissionScenario() {
    const context = useContext(CommissionScenarioContext)
    if (!context) {
        throw new Error('useCommissionScenario deve ser usado dentro de um CommissionScenarioProvider')
    }
    return context
}
