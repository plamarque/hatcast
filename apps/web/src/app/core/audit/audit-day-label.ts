/** Local calendar day key for grouping audit rows. */
export function auditLocalDayKey(iso: string): string {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Pill label: Aujourd'hui, Hier, or `d MMMM yyyy` (fr-FR). */
export function auditDayLabel(iso: string, referenceDate = new Date()): string {
  const d = new Date(iso)
  const refStart = startOfLocalDay(referenceDate)
  const dayStart = startOfLocalDay(d)
  const diffDays = Math.round((refStart.getTime() - dayStart.getTime()) / 86_400_000)
  if (diffDays === 0) return "Aujourd'hui"
  if (diffDays === 1) return 'Hier'
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d)
}

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}
