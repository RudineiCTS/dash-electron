export type DynamicReportFieldKind = 'id' | 'text' | 'date' | 'metric';

export interface DynamicReportField {
  key: string;
  label: string;
  kind: DynamicReportFieldKind;
  disabled?: boolean;
}

export interface DynamicReportScope {
  idCampaigns: number[];
  idManufacturers: number[];
  productLines: string[];
  competenceMonths: string[];
}

export interface DynamicReportFilter {
  field: string;
  values: string[];
}

export interface DynamicReportRequest {
  scope: DynamicReportScope;
  groupBy: string[];
  columns: string[];
  metrics: string[];
  filters: DynamicReportFilter[];
}

export interface DynamicReportRow {
  dimensions: Record<string, string | number | null>;
  metrics: Record<string, number>;
}

export interface DynamicReportResponse {
  rows: DynamicReportRow[];
  totals: Record<string, number>;
  groupCount: number;
}
