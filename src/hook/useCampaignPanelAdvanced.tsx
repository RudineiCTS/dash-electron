import { useCallback, useEffect, useState } from "react"
import { SellOutMonthlyResponse, SellOutSummaryInterface, SellOutSummaryMonthly } from "../interfaces/sellOutSummaryType"
import { getCamapignTelesalerSellOutSummaryMonthly } from "../services/campaignPanelAdvanced.teleseler"


export function useCampaignPanelAdvanced(props:SellOutSummaryInterface | null){
    const [sellOutSummary, setSellOutSummary] =useState<SellOutSummaryMonthly[]>()
    const [loading, setLoading] =useState(false)
    const [error, setError] = useState("")

    const fetchCampaignPanelAdvanced = useCallback(async (signal?: AbortSignal)=>{
        if(!props) return 
        try{
            setLoading(true);
            setError("");
            //recuperar dados no repositorio
            const data = await getCamapignTelesalerSellOutSummaryMonthly(props,signal)
            setSellOutSummary(data)
            console.log(data)

        }catch(err){
            if(err instanceof Error && err.name === 'AbortError')return;
            setError(`Erro ao buscar informações para o painel`)
        }finally{
            setLoading(false)
        }
    },[props])

    useEffect(()=>{
        const controller = new AbortController();
        fetchCampaignPanelAdvanced(controller.signal);
        return () => controller.abort();
    },[fetchCampaignPanelAdvanced])

    return {
        sellOutSummary,
        setSellOutSummary,
        loading,
        error,
        setError
    }
}