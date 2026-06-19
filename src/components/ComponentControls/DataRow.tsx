import { Label } from "./Label";
import { Value } from "./Value";

interface DataRowProps{
    label:string,
    value:string,
    mono?:boolean
}

export function DataRow({ label, value, mono = false }:DataRowProps) {
  const isEmpty = !value || value === "—";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2px", padding: "10px 20px" }}>
      <Label>{label}</Label>
      <Value mono={mono} empty={isEmpty}>{value || "Não informado"}</Value>
    </div>
  );
}