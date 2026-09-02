export type SortDirection = "asc" | "desc";

export function compareValues(a: unknown, b: unknown, direction: SortDirection): number {
    const dir = direction === "asc" ? 1 : -1;

    const aNil = a === null || a === undefined;
    const bNil = b === null || b === undefined;
    if (aNil && bNil) return 0;
    if (aNil) return 1; // nulos sempre por último, independente da direção
    if (bNil) return -1;

    if (typeof a === "number" && typeof b === "number") {
        return (a - b) * dir;
    }

    return String(a).localeCompare(String(b), "pt-BR", { numeric: true, sensitivity: "base" }) * dir;
}
