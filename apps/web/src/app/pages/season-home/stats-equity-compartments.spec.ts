import { describe, expect, it } from 'vitest'

import {
  PRINCIPAL_COMPARTMENT,
  compartmentsToQueryValue,
  defaultStatsEquityCompartments,
  statsGroupsFilterLabel,
  toggleAllCompartments,
  toggleCompartmentSlug,
} from './stats-equity-compartments'

describe('stats-equity-compartments', () => {
  const allSlugs = [PRINCIPAL_COMPARTMENT, 'deplacements', 'aperock']
  const labels = { deplacements: 'Déplacements', aperock: 'Apérock' }

  it('defaults to all compartments', () => {
    expect(defaultStatsEquityCompartments()).toEqual({ kind: 'all' })
    expect(compartmentsToQueryValue({ kind: 'all' })).toBe('all')
  })

  it('maps none and selected to query values', () => {
    expect(compartmentsToQueryValue({ kind: 'none' })).toBe('')
    expect(
      compartmentsToQueryValue({ kind: 'selected', slugs: ['principal', 'deplacements'] }),
    ).toBe('principal,deplacements')
  })

  it('builds filter labels per UX', () => {
    expect(statsGroupsFilterLabel({ kind: 'all' }, labels)).toBe('Tous les spectacles')
    expect(statsGroupsFilterLabel({ kind: 'none' }, labels)).toBe('Aucun')
    expect(
      statsGroupsFilterLabel({ kind: 'selected', slugs: ['deplacements'] }, labels),
    ).toBe('Déplacements')
    expect(
      statsGroupsFilterLabel({ kind: 'selected', slugs: ['principal', 'deplacements'] }, labels),
    ).toBe('2 groupes')
  })

  it('toggles all and individual slugs', () => {
    expect(toggleAllCompartments({ kind: 'none' }, allSlugs, true)).toEqual({ kind: 'all' })
    expect(toggleAllCompartments({ kind: 'all' }, allSlugs, false)).toEqual({ kind: 'none' })
    const one =
      toggleCompartmentSlug({ kind: 'all' }, allSlugs, 'deplacements', false)
    expect(one).toEqual({
      kind: 'selected',
      slugs: [PRINCIPAL_COMPARTMENT, 'aperock'],
    })
  })
})
