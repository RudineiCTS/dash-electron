export interface SellOutSummaryInterface {
    startDate: string | null,
    endDate: string | null,
    idManufacturer: number[] | null,
    productLine: number[] | null,
    products:number[] | null,
    idComissionScenario: number | null,
    clients: number[] | null,
    consideraGrandesContas:boolean,
    tipoData: string,
}


 export interface SellOutSummaryMonthly{
    yearMonth:string,
    soldValue:number,
    clientCount:number
}

export interface SellOutMonthlyResponse{
    data:SellOutSummaryMonthly[]
}