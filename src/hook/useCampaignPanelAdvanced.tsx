
interface ComparePeriodUniqueProps{
    FistMonthPeriod:string,
    FirstYearPeriod:number,
    SecondMonthPeriod:string,
    SecondtYearPeriod:number,
}

interface ParamentrosUsePanelAdvancedPros{
    data: ComparePeriodUniqueProps,
    startDate:Date,
    endDate:Date,
    incluingGc: boolean,
    lineProducts: number[]
}

export function useCampaignPanelAdvanced(){

}