import { useState, useEffect } from 'react'
import { AppState, defaultState } from './store'

const KEY = 'sprout-planner:v1'

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaultState
    return { ...defaultState, ...JSON.parse(raw) }
  } catch {
    return defaultState
  }
}

export function saveState(state: AppState): void {
  localStorage.setItem(KEY, JSON.stringify(state))
}

export function useAppState() {
  const [state, setStateRaw] = useState<AppState>(loadState)

  useEffect(() => {
    saveState(state)
  }, [state])

  // Apply theme class to <html>
  useEffect(() => {
    const root = document.documentElement
    if (state.settings.theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [state.settings.theme])

  return [state, setStateRaw] as const
}
