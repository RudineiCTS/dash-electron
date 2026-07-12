export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';

  return `${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
}
