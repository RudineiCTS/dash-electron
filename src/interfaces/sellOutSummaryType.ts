export interface SellOutSummaryInterface {
    startDate: Date | null,
    endDate: Date | null,
    idManufacturer: number[] | null,
    productLine: number[] | null,
    products:number[] | null,
    idComissionScenario: number | null,
    clients: number[] | null,
    consideraGrandesContas:boolean,
}


 export interface SellOutSummaryMonthly{
    yearMonth:string,
    soldValue:number,
    clientCount:number
}

export interface SellOutMonthlyResponse{
    data:SellOutSummaryMonthly[]
}