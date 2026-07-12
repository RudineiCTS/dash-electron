import { HTMLAttributes } from "react";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement>{
    variant?: "text" | "circle" | "rect"
}

export function Skeleton({variant = "rect", className="", ...props}:SkeletonProps){
    const baseStyle = "animate-pulse bg-gray-700/40 relative overflow-hidden";

    const variantStyle = {
        text:"h-4 rounded",
        circle:"rounded-full",
        rect:"rounded-md"
    }[variant];

    return (
        <div
          className={`${baseStyle} ${variantStyle} ${className}`}
          {...props}
        >
          {/* efeito shimmer passando por cima */}
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
    )
}