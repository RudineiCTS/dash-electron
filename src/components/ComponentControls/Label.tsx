import { ReactNode } from "react";

interface LabelProps {
    children:ReactNode
}
export function Label({ children }:LabelProps) {
  return (
    <span
      style={{
        fontSize: "0.62rem",
        fontWeight: 600,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "#4A5568",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {children}
    </span>
  );
}