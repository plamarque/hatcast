/** API/query token for spectacles ordinaires (UI label differs). */
export const PRINCIPAL_COMPARTMENT = 'principal'

export type StatsEquityCompartmentOption = {
  slug: string
  label: string
}

export type StatsEquityCompartments =
  | { kind: 'all' }
  | { kind: 'none' }
  | { kind: 'selected'; slugs: string[] }

export function defaultStatsEquityCompartments(): StatsEquityCompartments {
  return { kind: 'all' }
}

export function allCompartmentSlugs(glossarySlugs: string[]): string[] {
  return [PRINCIPAL_COMPARTMENT, ...glossarySlugs]
}

export function compartmentsToQueryValue(compartments: StatsEquityCompartments): string | null {
  if (compartments.kind === 'all') {
    return 'all'
  }
  if (compartments.kind === 'none') {
    return ''
  }
  return compartments.slugs.join(',')
}

export function isSlugSelected(compartments: StatsEquityCompartments, slug: string): boolean {
  if (compartments.kind === 'all') {
    return true
  }
  if (compartments.kind === 'none') {
    return false
  }
  return compartments.slugs.includes(slug)
}

export function toggleAllCompartments(
  compartments: StatsEquityCompartments,
  allSlugs: string[],
  checked: boolean,
): StatsEquityCompartments {
  if (checked) {
    return { kind: 'all' }
  }
  return { kind: 'none' }
}

export function toggleCompartmentSlug(
  compartments: StatsEquityCompartments,
  allSlugs: string[],
  slug: string,
  checked: boolean,
): StatsEquityCompartments {
  const selected =
    compartments.kind === 'selected'
      ? new Set(compartments.slugs)
      : compartments.kind === 'all'
        ? new Set(allSlugs)
        : new Set<string>()

  if (checked) {
    selected.add(slug)
  } else {
    selected.delete(slug)
  }

  if (selected.size === 0) {
    return { kind: 'none' }
  }
  if (selected.size === allSlugs.length) {
    return { kind: 'all' }
  }
  return { kind: 'selected', slugs: [...selected] }
}

export function statsGroupsFilterLabel(
  compartments: StatsEquityCompartments,
  labels: Record<string, string>,
): string {
  if (compartments.kind === 'all') {
    return 'Tous les spectacles'
  }
  if (compartments.kind === 'none') {
    return 'Aucun'
  }
  if (compartments.slugs.length === 1) {
    const slug = compartments.slugs[0]!
    const label =
      slug === PRINCIPAL_COMPARTMENT
        ? 'Spectacles ordinaires'
        : (labels[slug] ?? slug)
    return label
  }
  return `${compartments.slugs.length} groupes`
}

export function statsGroupsExportLabel(
  compartments: StatsEquityCompartments,
  labels: Record<string, string>,
): string {
  if (compartments.kind === 'all') {
    return 'Tous les spectacles'
  }
  if (compartments.kind === 'none') {
    return 'Aucun'
  }
  return compartments.slugs
    .map((slug) =>
      slug === PRINCIPAL_COMPARTMENT ? 'Spectacles ordinaires' : (labels[slug] ?? slug),
    )
    .join(', ')
}
