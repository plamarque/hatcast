import { describe, expect, it } from 'vitest'

import {
  PRINCIPAL_CATEGORY,
  categoriesToQueryValue,
  defaultStatsCategoryFilter,
  statsCategoriesFilterLabel,
  toggleAllCategories,
  toggleCategorySlug,
} from './stats-categories'

describe('stats-categories', () => {
  const allSlugs = [PRINCIPAL_CATEGORY, 'deplacements', 'aperock']
  const labels = { deplacements: 'Déplacements', aperock: 'Apérock' }

  it('defaults to all compartments', () => {
    expect(defaultStatsCategoryFilter()).toEqual({ kind: 'all' })
    expect(categoriesToQueryValue({ kind: 'all' })).toBe('all')
  })

  it('maps none and selected to query values', () => {
    expect(categoriesToQueryValue({ kind: 'none' })).toBe('')
    expect(
      categoriesToQueryValue({ kind: 'selected', slugs: ['principal', 'deplacements'] }),
    ).toBe('principal,deplacements')
  })

  it('builds filter labels per UX', () => {
    expect(statsCategoriesFilterLabel({ kind: 'all' }, labels)).toBe('Tous les spectacles')
    expect(statsCategoriesFilterLabel({ kind: 'none' }, labels)).toBe('Aucun')
    expect(
      statsCategoriesFilterLabel({ kind: 'selected', slugs: ['deplacements'] }, labels),
    ).toBe('Déplacements')
    expect(
      statsCategoriesFilterLabel({ kind: 'selected', slugs: ['principal', 'deplacements'] }, labels),
    ).toBe('2 catégories')
  })

  it('toggles all and individual slugs', () => {
    expect(toggleAllCategories({ kind: 'none' }, allSlugs, true)).toEqual({ kind: 'all' })
    expect(toggleAllCategories({ kind: 'all' }, allSlugs, false)).toEqual({ kind: 'none' })
    const one =
      toggleCategorySlug({ kind: 'all' }, allSlugs, 'deplacements', false)
    expect(one).toEqual({
      kind: 'selected',
      slugs: [PRINCIPAL_CATEGORY, 'aperock'],
    })
  })
})
