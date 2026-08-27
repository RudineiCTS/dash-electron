interface TitleBarProps {
  contextoAtual?: string; // ex: "Campanhas · #1327 Kimberly"
  ambiente: 'PROD' | 'HOMOLOG' | 'DEV';
  versao: string;
}

export function TitleBar({ contextoAtual, ambiente, versao }: TitleBarProps) {
  const corAmbiente = ambiente === 'PROD' ? '#5DCAA5' : ambiente === 'HOMOLOG' ? '#EF9F27' : '#888780';

  return (
    <div
      className="h-11 bg-[#32307B] flex items-center pl-3 pr-[140px] gap-2 text-white select-none"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* Logo */}
      <div className="w-6 h-6 rounded-md bg-[#DD8100] flex items-center justify-center text-xs font-semibold shrink-0">
        S
      </div>

      {/* Nome do app + contexto */}
      <span className="text-sm font-semibold whitespace-nowrap">Solfarma Comercial</span>
      {contextoAtual && (
        <>
          <span className="text-white/40 text-sm">—</span>
          <span className="text-sm text-white/70 truncate">{contextoAtual}</span>
        </>
      )}

      {/* Status à direita */}
      <div className="ml-auto flex items-center gap-3 text-xs text-white/70 shrink-0">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: corAmbiente }} />
          GS300GP · {ambiente}
        </span>
        <span>v{versao}</span>
      </div>
    </div>
  );
}