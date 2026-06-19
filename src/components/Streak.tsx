import { Flame } from 'lucide-react'
import { StreakInfo } from '../lib/status'

type Props = { streak: StreakInfo }

export default function Streak({ streak }: Props) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-sprout-50 dark:border-sprout-950 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${streak.current > 0 ? 'bg-orange-100 dark:bg-orange-950' : 'bg-gray-100 dark:bg-gray-800'}`}>
        <Flame size={24} className={streak.current > 0 ? 'text-orange-500' : 'text-gray-300'} />
      </div>
      <div className="flex-1">
        <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide font-medium">Current streak</p>
        <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          {streak.current} <span className="text-sm font-normal text-gray-400">day{streak.current !== 1 ? 's' : ''}</span>
        </p>
      </div>
      <div className="text-right">
        <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide font-medium">Best</p>
        <p className="text-lg font-bold text-sprout-600 dark:text-sprout-400">{streak.best}d</p>
      </div>
    </div>
  )
}
