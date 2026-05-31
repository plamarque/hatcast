const periodFormatter = new Intl.DateTimeFormat('fr-FR', {
  month: 'short',
  year: 'numeric',
})

function parseIsoDateOnly(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d, 12, 0, 0, 0)
}

/** Période saison en mois courts FR (ex. « sept. 2025 – juin 2026 »). */
export function formatSeasonPeriod(start: string | null, end: string | null): string | null {
  if (!start && !end) {
    return null
  }
  if (start && end) {
    return `${periodFormatter.format(parseIsoDateOnly(start))} – ${periodFormatter.format(parseIsoDateOnly(end))}`
  }
  if (start) {
    return `À partir de ${periodFormatter.format(parseIsoDateOnly(start))}`
  }
  return `Jusqu’à ${periodFormatter.format(parseIsoDateOnly(end!))}`
}
