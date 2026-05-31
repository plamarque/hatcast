/** API/query token for spectacles ordinaires (UI label differs). */
export const PRINCIPAL_CATEGORY = 'principal'

export type StatsSpectacleCategoryOption = {
  slug: string
  label: string
}

export type StatsCategoryFilter =
  | { kind: 'all' }
  | { kind: 'none' }
  | { kind: 'selected'; slugs: string[] }

export function defaultStatsCategoryFilter(): StatsCategoryFilter {
  return { kind: 'all' }
}

export function allCategorySlugs(glossarySlugs: string[]): string[] {
  return [PRINCIPAL_CATEGORY, ...glossarySlugs]
}

export function categoriesToQueryValue(compartments: StatsCategoryFilter): string | null {
  if (compartments.kind === 'all') {
    return 'all'
  }
  if (compartments.kind === 'none') {
    return ''
  }
  return compartments.slugs.join(',')
}

export function isSlugSelected(compartments: StatsCategoryFilter, slug: string): boolean {
  if (compartments.kind === 'all') {
    return true
  }
  if (compartments.kind === 'none') {
    return false
  }
  return compartments.slugs.includes(slug)
}

export function toggleAllCategories(
  compartments: StatsCategoryFilter,
  allSlugs: string[],
  checked: boolean,
): StatsCategoryFilter {
  if (checked) {
    return { kind: 'all' }
  }
  return { kind: 'none' }
}

export function toggleCategorySlug(
  compartments: StatsCategoryFilter,
  allSlugs: string[],
  slug: string,
  checked: boolean,
): StatsCategoryFilter {
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

export function statsCategoriesFilterLabel(
  compartments: StatsCategoryFilter,
  labels: Record<string, string>,
): string {
  if (compartments.kind === 'all') {
    return 'Toutes'
  }
  if (compartments.kind === 'none') {
    return 'Aucun'
  }
  if (compartments.slugs.length === 1) {
    const slug = compartments.slugs[0]!
    const label =
      slug === PRINCIPAL_CATEGORY
        ? 'Spectacles ordinaires'
        : (labels[slug] ?? slug)
    return label
  }
  return `${compartments.slugs.length} catégories`
}

export function statsCategoriesExportLabel(
  compartments: StatsCategoryFilter,
  labels: Record<string, string>,
): string {
  if (compartments.kind === 'all') {
    return 'Toutes'
  }
  if (compartments.kind === 'none') {
    return 'Aucun'
  }
  return compartments.slugs
    .map((slug) =>
      slug === PRINCIPAL_CATEGORY ? 'Spectacles ordinaires' : (labels[slug] ?? slug),
    )
    .join(', ')
}
