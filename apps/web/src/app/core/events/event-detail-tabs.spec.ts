import { convertToParamMap } from '@angular/router'
import { describe, expect, it } from 'vitest'

import { resolveEventDetailTab, isEventDetailTabParamKnown } from './event-detail-tabs'

describe('resolveEventDetailTab', () => {
  it('defaults to infos when no query params', () => {
    expect(resolveEventDetailTab(convertToParamMap({}))).toBe('infos')
  })

  it.each([
    ['infos', 'infos'],
    ['info', 'infos'],
    ['dispos', 'dispos'],
    ['team', 'dispos'],
    ['equipe', 'equipe'],
    ['compo', 'equipe'],
  ] as const)('maps tab=%s to %s', (tab, expected) => {
    expect(resolveEventDetailTab(convertToParamMap({ tab }))).toBe(expected)
  })

  it('prefers explicit tab over showAvailability', () => {
    expect(
      resolveEventDetailTab(convertToParamMap({ tab: 'infos', showAvailability: 'true' })),
    ).toBe('infos')
  })

  it('prefers explicit tab over showConfirm', () => {
    expect(
      resolveEventDetailTab(convertToParamMap({ tab: 'dispos', showConfirm: 'true' })),
    ).toBe('dispos')
  })

  it('selects dispos when showAvailability=true and tab absent', () => {
    expect(resolveEventDetailTab(convertToParamMap({ showAvailability: 'true' }))).toBe('dispos')
  })

  it('selects equipe when showConfirm=true and tab absent', () => {
    expect(resolveEventDetailTab(convertToParamMap({ showConfirm: 'true' }))).toBe('equipe')
  })

  it('ignores unknown tab values and falls back to convenience flags', () => {
    expect(
      resolveEventDetailTab(convertToParamMap({ tab: 'unknown', showAvailability: 'true' })),
    ).toBe('dispos')
  })

  it('recognizes known tab params including legacy aliases', () => {
    expect(isEventDetailTabParamKnown('infos')).toBe(true)
    expect(isEventDetailTabParamKnown('INFO')).toBe(true)
    expect(isEventDetailTabParamKnown('compo')).toBe(true)
    expect(isEventDetailTabParamKnown('unknown')).toBe(false)
  })
})
