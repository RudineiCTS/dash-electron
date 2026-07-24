import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme()
    const isDark = theme === 'dark'

    return (
        <button
            onClick={toggleTheme}
            title={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
            className="flex items-center gap-3 text-sm w-5/6 px-4 py-2 rounded-md
                       text-github-text-muted hover:text-github-text hover:bg-github-bg-hover
                       transition-colors duration-200 cursor-pointer"
        >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
            {isDark ? 'Tema claro' : 'Tema escuro'}
        </button>
    )
}
