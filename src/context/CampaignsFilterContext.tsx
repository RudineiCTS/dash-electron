import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from 'react'
import dayjs from 'dayjs'

type CampaignTab = 'pontos' | 'valor'

interface CampaignsFilterContextValue {
    dateCompetency: string
    setDateCompetency: Dispatch<SetStateAction<string>>
    filterActive: string
    setFilterActive: Dispatch<SetStateAction<string>>
    activeTab: CampaignTab
    setActiveTab: Dispatch<SetStateAction<CampaignTab>>
    onlyAchieved: boolean
    setOnlyAchieved: Dispatch<SetStateAction<boolean>>
}

const defaultDateCompetency = dayjs().endOf('month').format('YYYY-MM-DD')

const CampaignsFilterContext = createContext<CampaignsFilterContextValue | undefined>(undefined)

export function CampaignsFilterProvider({ children }: { children: ReactNode }) {
    const [dateCompetency, setDateCompetency] = useState(defaultDateCompetency)
    const [filterActive, setFilterActive] = useState('')
    const [activeTab, setActiveTab] = useState<CampaignTab>('valor')
    const [onlyAchieved, setOnlyAchieved] = useState(false)

    return (
        <CampaignsFilterContext.Provider
            value={{
                dateCompetency,
                setDateCompetency,
                filterActive,
                setFilterActive,
                activeTab,
                setActiveTab,
                onlyAchieved,
                setOnlyAchieved,
            }}
        >
            {children}
        </CampaignsFilterContext.Provider>
    )
}

export function useCampaignsFilter() {
    const context = useContext(CampaignsFilterContext)
    if (!context) {
        throw new Error('useCampaignsFilter deve ser usado dentro de um CampaignsFilterProvider')
    }
    return context
}
