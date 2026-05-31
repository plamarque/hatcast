/** Aligné sur V1 — `localeCompare(..., 'fr', { sensitivity: 'base' })`. */
export function compareFrenchDisplayName(a: string, b: string): number {
  return a.localeCompare(b, 'fr', { sensitivity: 'base' })
}
