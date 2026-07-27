interface LogoAppProps {
    className?: string
}

export function LogoApp({ className }: LogoAppProps) {
    return (
        <div className={`flex flex-col items-center justify-center m-auto ${className}`}>
            <div className="flex items-center justify-center gap-3">
                <svg
                    width="40"
                    height="40"
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        <linearGradient id="bussola-gradient" x1="0" y1="0" x2="100" y2="100">
                            <stop offset="0%" stopColor="var(--accent)" />
                            <stop offset="100%" stopColor="#1f8a3d" />
                        </linearGradient>
                    </defs>
                    <circle
                        cx="50"
                        cy="50"
                        r="45"
                        stroke="url(#bussola-gradient)"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray="220 283"
                        transform="rotate(-90 50 50)"
                    />
                    <path d="M50 30 L64 55 L50 70 L36 55 Z" style={{ fill: 'var(--gh-bg-focus)' }} />
                </svg>

                <div className="flex tracking-tight">
                    <span className="text-4xl font-extrabold text-github-text">Com</span>
                    <span className="text-4xl font-extrabold text-github-btn-green-hover">pass</span>
                </div>
            </div>

            <span className="text-xs text-github-text-muted tracking-[3px] uppercase mt-1">
                Campanhas
            </span>
        </div>
    )
}