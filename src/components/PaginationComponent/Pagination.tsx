import { PaginationType } from "../../interfaces/TParamsCampaign";

type PaginationProps = {
  pagination: PaginationType;
  onPageChange: (page: number) => void;
};

export function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { pageNumber, pageSize, totalCount, totalPages } = pagination;

  if (totalPages <= 0) return null;

  const inicio = (pageNumber - 1) * pageSize + 1;
  const fim = Math.min(pageNumber * pageSize, totalCount);

  const isPrimeira = pageNumber <= 1;
  const isUltima = pageNumber >= totalPages;

  // Gera os números de página visíveis (com "..." quando há muitas páginas)
  const getPageNumbers = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];
    const delta = 1; // quantas páginas mostrar ao redor da atual

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= pageNumber - delta && i <= pageNumber + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }

    return pages;
  };

  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-[--text-faint]">
        Mostrando {inicio}–{fim} de {totalCount.toLocaleString("pt-BR")}
      </span>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(pageNumber - 1)}
          disabled={isPrimeira}
          className="px-3 py-1.5 rounded-md border border-[--other-border] text-[--text-strong]
            disabled:opacity-40 disabled:cursor-not-allowed
            hover:bg-[--gh-bg-hover] transition-colors"
          aria-label="Página anterior"
        >
          ‹
        </button>

        {getPageNumbers().map((page, index) =>
          page === "..." ? (
            <span key={`dots-${index}`} className="px-2 text-[--text-faint]">
              …
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-1.5 rounded-md border transition-colors ${
                page === pageNumber
                  ? "bg-[--accent] border-[--accent] text-[--accent-strong-text] font-medium"
                  : "border-[--other-border] text-[--text-strong] hover:bg-[--gh-bg-hover]"
              }`}
            >
              {page}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(pageNumber + 1)}
          disabled={isUltima}
          className="px-3 py-1.5 rounded-md border border-[--other-border] text-[--text-strong]
            disabled:opacity-40 disabled:cursor-not-allowed
            hover:bg-[--gh-bg-hover] transition-colors"
          aria-label="Próxima página"
        >
          ›
        </button>
      </div>
    </div>
  );
}