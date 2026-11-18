import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@shared/context/ThemeContext'

export function ThemeButton() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
      className="flex h-11 w-11 items-center justify-center rounded-lg text-white/80 active:bg-white/10"
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  )
}
