import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react'
import { getSystemUser } from '../services/systemUser'
import { SystemUserProfile } from '../interfaces/SystemUser'

interface UserContextValue {
    userName: string
    profile: SystemUserProfile | null
    loading: boolean
    blocked: boolean
    blockReason: string
    hasSeenWelcome: boolean
    completeOnboarding: () => Promise<void>
    retry: () => void
}

const UserContext = createContext<UserContextValue | undefined>(undefined)

function getBridge() {
    return typeof window !== 'undefined' ? window.compassAPI : undefined
}

function isAbortError(err: unknown): boolean {
    return err instanceof Error && (err.name === 'AbortError' || err.name === 'CanceledError')
}

export function UserProvider({ children }: { children: ReactNode }) {
    const [userName, setUserName] = useState('')
    const [profile, setProfile] = useState<SystemUserProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [blocked, setBlocked] = useState(false)
    const [blockReason, setBlockReason] = useState('')
    const [hasSeenWelcome, setHasSeenWelcome] = useState(false)
    const [attempt, setAttempt] = useState(0)

    useEffect(() => {
        const controller = new AbortController()
        let cancelled = false

        async function bootstrap() {
            setLoading(true)
            setBlocked(false)
            setBlockReason('')

            const bridge = getBridge()
            const osUserName = bridge ? await bridge.getOsUsername() : 'usuario.dev'
            if (cancelled) return
            setUserName(osUserName)

            const seenWelcome = bridge ? await bridge.getHasSeenWelcome() : true
            if (cancelled) return
            setHasSeenWelcome(seenWelcome)

            try {
                const data = await getSystemUser(osUserName, controller.signal)
                if (cancelled) return

                if (data.inactive) {
                    setBlocked(true)
                    setBlockReason('Seu usuário está inativo no Compass. Fale com o time responsável para reativar o acesso.')
                    return
                }

                setProfile(data)
            } catch (err) {
                if (cancelled || isAbortError(err)) return

                const status = (err as { response?: { status?: number } })?.response?.status
                if (status === 404) {
                    setBlocked(true)
                    setBlockReason('Seu usuário ainda não está cadastrado no Compass. Fale com o time responsável para liberar o acesso.')
                } else {
                    setBlocked(true)
                    setBlockReason('Não foi possível verificar seu acesso ao Compass agora. Verifique sua conexão e tente novamente.')
                }
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        bootstrap()
        return () => {
            cancelled = true
            controller.abort()
        }
    }, [attempt])

    const completeOnboarding = useCallback(async () => {
        const bridge = getBridge()
        await bridge?.setHasSeenWelcome(true)
        setHasSeenWelcome(true)
    }, [])

    const retry = useCallback(() => setAttempt((a) => a + 1), [])

    return (
        <UserContext.Provider
            value={{ userName, profile, loading, blocked, blockReason, hasSeenWelcome, completeOnboarding, retry }}
        >
            {children}
        </UserContext.Provider>
    )
}

export function useUser() {
    const context = useContext(UserContext)
    if (!context) {
        throw new Error('useUser deve ser usado dentro de um UserProvider')
    }
    return context
}
