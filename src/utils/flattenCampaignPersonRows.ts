import { CampaignPersonRow } from "../interfaces/CampaignPersonRow";

export function flattenCampaignPersonRows(rows: CampaignPersonRow[]): CampaignPersonRow[] {
  return rows.flatMap((row) => [
    row,
    ...(row.children ? flattenCampaignPersonRows(row.children) : []),
  ]);
}
