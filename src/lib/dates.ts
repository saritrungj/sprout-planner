export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export function monthKey(date: string): string {
  return date.slice(0, 7)
}

export function formatMonthLabel(month: string): string {
  const [y, m] = month.split('-')
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export function formatDayLabel(date: string): string {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

// Returns a 6-row × 7-col grid of ISO date strings (or null for padding)
export function buildMonthGrid(month: string): (string | null)[][] {
  const [y, m] = month.split('-').map(Number)
  const firstDay = new Date(y, m - 1, 1).getDay() // 0=Sun
  const daysInMonth = new Date(y, m, 0).getDate()

  const cells: (string | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(`${month}-${String(d).padStart(2, '0')}`)
  }
  while (cells.length % 7 !== 0) cells.push(null)

  const rows: (string | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7))
  return rows
}

export function prevMonth(month: string): string {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(y, m - 2, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function nextMonth(month: string): string {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(y, m, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

// Build array of ISO dates for the past N weeks (Mon–Sun), newest last
export function buildHeatmapDates(weeks = 26): string[] {
  const today = new Date()
  const dates: string[] = []
  // Start from (weeks * 7) days ago, aligned to Sunday
  const start = new Date(today)
  start.setDate(start.getDate() - today.getDay() - (weeks - 1) * 7)
  for (let i = 0; i < weeks * 7; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    dates.push(d.toISOString().slice(0, 10))
  }
  return dates
}

export function currentMonth(): string {
  return todayISO().slice(0, 7)
}
