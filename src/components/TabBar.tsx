import { CalendarDays, LayoutDashboard, ListChecks, LucideIcon } from 'lucide-react'

export type Tab = 'today' | 'calendar' | 'dashboard'

type Props = {
  active: Tab
  onChange: (tab: Tab) => void
}

const tabs: { id: Tab; label: string; Icon: LucideIcon }[] = [
  { id: 'today',     label: 'Today',     Icon: ListChecks },
  { id: 'calendar',  label: 'Calendar',  Icon: CalendarDays },
  { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
]

export default function TabBar({ active, onChange }: Props) {
  return (
    <nav className="flex border-b border-sprout-100 dark:border-sprout-900 bg-white dark:bg-gray-950">
      {tabs.map(({ id, label, Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors
            ${active === id
              ? 'text-sprout-600 dark:text-sprout-400 border-b-2 border-sprout-600 dark:border-sprout-400'
              : 'text-gray-400 dark:text-gray-500 hover:text-sprout-500'
            }`}
        >
          <Icon size={20} />
          {label}
        </button>
      ))}
    </nav>
  )
}
