import { describe, expect, it } from 'vitest'

import {
  formatMultiRoleOnEventWarningMessage,
  formatMultiRoleOnEventWarningTooltip,
  MULTI_ROLE_ON_EVENT_WARNING_SHORT_LABEL,
  type MultiRoleOnEventWarning,
} from './multi-role-on-event-warning'

describe('multiRoleOnEventWarning copy', () => {
  it('exposes compact row label', () => {
    expect(MULTI_ROLE_ON_EVENT_WARNING_SHORT_LABEL).toBe('Deux rôles le même soir')
  })

  it('formats tooltip for a single other role', () => {
    const warning: MultiRoleOnEventWarning = { otherRoleKeys: ['dj'] }
    expect(formatMultiRoleOnEventWarningTooltip(warning, 'Patrice')).toBe(
      'Patrice est également DJ dans cette compo.',
    )
  })

  it('formats tooltip with gender-aware role label', () => {
    const warning: MultiRoleOnEventWarning = { otherRoleKeys: ['player'] }
    expect(formatMultiRoleOnEventWarningTooltip(warning, 'Patrice', 'female')).toBe(
      'Patrice est également Comédienne dans cette compo.',
    )
  })

  it('formats tooltip for multiple other roles', () => {
    const warning: MultiRoleOnEventWarning = { otherRoleKeys: ['dj', 'player'] }
    expect(formatMultiRoleOnEventWarningTooltip(warning, 'Patrice')).toMatch(/DJ/)
    expect(formatMultiRoleOnEventWarningTooltip(warning, 'Patrice')).toMatch(/Comédien/)
    expect(formatMultiRoleOnEventWarningTooltip(warning, 'Patrice')).toContain('dans cette compo.')
  })

  it('keeps legacy long message for deprecated formatter', () => {
    const warning: MultiRoleOnEventWarning = { otherRoleKeys: ['dj'] }
    expect(formatMultiRoleOnEventWarningMessage(warning)).toBe(
      'Attention : cette personne est aussi composée comme DJ.',
    )
  })
})
