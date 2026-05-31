const periodFormatter = new Intl.DateTimeFormat('fr-FR', {
  month: 'short',
  year: 'numeric',
})

function parseIsoDateOnly(iso: string): Date | null {
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) {
    return null
  }
  const parsed = new Date(y, m - 1, d, 12, 0, 0, 0)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function formatDatePart(date: Date | null): string | null {
  if (!date) {
    return null
  }
  return periodFormatter.format(date)
}

/** Période saison en mois courts FR (ex. « sept. 2025 – juin 2026 »). */
export function formatSeasonPeriod(start: string | null, end: string | null): string | null {
  if (!start && !end) {
    return null
  }
  if (start && end) {
    const startDate = parseIsoDateOnly(start)
    const endDate = parseIsoDateOnly(end)
    const startLabel = formatDatePart(startDate)
    const endLabel = formatDatePart(endDate)
    if (!startLabel || !endLabel) {
      return null
    }
    return `${startLabel} – ${endLabel}`
  }
  if (start) {
    const startLabel = formatDatePart(parseIsoDateOnly(start))
    return startLabel ? `À partir de ${startLabel}` : null
  }
  const endLabel = formatDatePart(parseIsoDateOnly(end!))
  return endLabel ? `Jusqu’en ${endLabel}` : null
}
