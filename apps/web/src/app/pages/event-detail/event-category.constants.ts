import type { TroupeCategory } from '../../core/troupes/troupe-api.service'

export const CATEGORY_HELP =
  'Choisis la catégorie dans laquelle ce spectacle comptera pour les statistiques et les tirages.'

/** Libellé affiché quand `category` est absent (= pool principal, ADR 0013). */
export const DEFAULT_CATEGORY_DISPLAY_LABEL = 'Spectacles ordinaires'

/** Slug virtuel renvoyé par l’API pour le compartiment principal (`events.category IS NULL`). */
export const DEFAULT_CATEGORY_SLUG = 'principal'

export function isDefaultCategorySlug(slug: string): boolean {
  return slug === DEFAULT_CATEGORY_SLUG
}

export function defaultCategoryLabelFromGlossary(glossary: TroupeCategory[]): string {
  return (
    glossary.find((t) => t.slug === DEFAULT_CATEGORY_SLUG)?.label ??
    DEFAULT_CATEGORY_DISPLAY_LABEL
  )
}

export interface EventCategoryOption {
  slug: string | null
  label: string
}

/** Ordre : ordinaires → Déplacements → custom A→Z ; inclut slug orphelin si besoin. */
export function buildEventCategoryOptions(
  glossary: TroupeCategory[],
  eventCategorySlug: string | null,
): EventCategoryOption[] {
  const principalLabel = defaultCategoryLabelFromGlossary(glossary)
  const deplacements = glossary.find((t) => t.slug === 'deplacements')
  const custom = glossary
    .filter((t) => t.slug !== 'deplacements' && t.slug !== DEFAULT_CATEGORY_SLUG)
    .sort((a, b) => a.label.localeCompare(b.label, 'fr'))

  const options: EventCategoryOption[] = [
    { slug: null, label: principalLabel },
  ]
  if (deplacements) {
    options.push(deplacements)
  }
  options.push(...custom)

  if (eventCategorySlug && !options.some((o) => o.slug === eventCategorySlug)) {
    const known = glossary.find((t) => t.slug === eventCategorySlug)
    options.push({ slug: eventCategorySlug, label: known?.label ?? eventCategorySlug })
  }

  return options
}
