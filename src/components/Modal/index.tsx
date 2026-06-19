import { ReactNode } from "react"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-github-bg-card rounded-xl p-6 w-full max-w-lg mx-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        {title && (
          <div className="flex items-center justify-between mb-4 border-b border-gray-700 pb-3">
            <h2 className="text-github-text font-medium text-lg">{title}</h2>
            <button
              onClick={onClose}
              className="text-github-text-muted hover:text-github-text transition-colors"
            >
              ✕
            </button>
          </div>
        )}

        {/* conteúdo */}
        <div className="text-github-text-muted">
          {children}
        </div>
      </div>
    </div>
  )
}