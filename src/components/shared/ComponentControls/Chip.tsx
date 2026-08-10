import { ReactNode } from "react";

interface ChipProps{
    children:ReactNode
}

export function Chip({ children }:ChipProps) {
  return (
    <span
      style={{
        padding: "4px 10px",
        borderRadius: "4px",
        fontSize: "0.72rem",
        fontWeight: 500,
        fontFamily: "'Inter', sans-serif",
        background: "#243040",
        color: "#94A3B8",
        border: "1px solid #2D3748",
      }}
    >
      {children}
    </span>
  );
}