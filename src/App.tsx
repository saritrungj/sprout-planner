import { useState } from 'react'
import { useAppState } from './lib/storage'
import { setTheme } from './lib/store'
import { Tab } from './components/TabBar'
import TabBar from './components/TabBar'
import TodayView from './components/TodayView'
import CalendarView from './components/CalendarView'
import Dashboard from './components/Dashboard'
import ThemeToggle from './components/ThemeToggle'

export default function App() {
  const [state, setState] = useAppState()
  const [tab, setTab] = useState<Tab>('today')

  function toggleTheme() {
    setState(setTheme(state, state.settings.theme === 'dark' ? 'light' : 'dark'))
  }

  return (
    <div className="min-h-screen flex flex-col max-w-2xl mx-auto">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-950 border-b border-sprout-100 dark:border-sprout-900">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌱</span>
          <span className="font-bold text-sprout-700 dark:text-sprout-400 text-lg">Sprout</span>
        </div>
        <ThemeToggle theme={state.settings.theme} onToggle={toggleTheme} />
      </header>

      {/* Tab nav */}
      <TabBar active={tab} onChange={setTab} />

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        {tab === 'today'     && <TodayView state={state} setState={setState} />}
        {tab === 'calendar'  && <CalendarView state={state} setState={setState} />}
        {tab === 'dashboard' && <Dashboard state={state} />}
      </main>
    </div>
  )
}
