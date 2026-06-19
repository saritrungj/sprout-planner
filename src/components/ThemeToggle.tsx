import { Sun, Moon } from 'lucide-react'

type Props = {
  theme: 'light' | 'dark'
  onToggle: () => void
}

export default function ThemeToggle({ theme, onToggle }: Props) {
  return (
    <button
      onClick={onToggle}
      className="p-2 rounded-xl text-sprout-700 dark:text-sprout-300 hover:bg-sprout-100 dark:hover:bg-sprout-900 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  )
}
