import { ReactNode } from "react";

interface TagProps{
    children: ReactNode,
    active:boolean
}

export function Tag({ children, active = true }:TagProps) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "3px 10px",
        borderRadius: "4px",
        fontSize: "0.72rem",
        fontWeight: 500,
        fontFamily: "'Inter', sans-serif",
        background: active ? "#1E3A2F" : "#1E2733",
        color: active ? "#4ADE80" : "#4A5568",
        border: `1px solid ${active ? "#166534" : "#2D3748"}`,
      }}
    >
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: active ? "#4ADE80" : "#4A5568", display: "inline-block" }} />
      {children}
    </span>
  );
}
 