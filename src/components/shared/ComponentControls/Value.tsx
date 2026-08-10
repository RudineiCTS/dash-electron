import { ReactNode } from "react";

interface ValueProps{
    children:ReactNode,
    mono:boolean,
    empty?:boolean
}

export function Value({ children, mono = false, empty = false }:ValueProps) {
  return (
    <span
      style={{
        fontSize: "0.85rem",
        fontWeight: empty ? 400 : 500,
        color: empty ? "#2D3748" : "#CBD5E0",
        fontFamily: mono ? "'JetBrains Mono', monospace" : "'Inter', sans-serif",
        fontStyle: empty ? "italic" : "normal",
      }}
    >
      {children}
    </span>
  );
}