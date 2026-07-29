export type ParamsCampaignType = {
    idCampaign:number,
	competenceDate:string,
	idCompetencePeriodStatus:number,
	startDate:Date,
	endDate:Date,
	totalRanking:number,
	description:string,

	idAssessmentType:string,
	idCalculationMethod:number,

	validationRule:number,
	valueType:number,
	earlyEndDate:Date,
	notes:string,
	considersExclusives:boolean,
	campaignType:any,
}

export type ManufacturesCampaignType = {
    idCampaign: number,
    idManufacturer:number,
    name: string,
    isValid: boolean
}
export type LineProductCampaignType = {
    idCampaign: number,
	idProductLine:number,
	name: string,
	isValid: boolean
}

export type ProductCampaign = {
	idCampaign: number,
	idProduct:number,
	name: string,
	isValid: boolean,
}

export type ProductCampaignType = {
	items :ProductCampaign[]
	totalCount?:number,
	pageNumber?:number,
	pageSize?:number,
	totalPages?:number
}
export type ClientCampaign = {
    idCampaign: number,
	idClients:number,
	clientName: string,
	cpfCnpj: string,
	city: string,
    state:string,
	isValid: boolean,
}
export type ClientCampaignType = {
	items :ClientCampaign[],
	totalCount?:number,
	pageNumber?:number,
	pageSize?:number,
	totalPages?:number
}

export type PaginationType = {
	totalCount:number,
	pageNumber:number,
	pageSize:number,
	totalPages:number
}