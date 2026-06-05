import { describe, expect, it } from 'vitest'

import {
  formatMultiRoleOnEventWarningMessage,
  type MultiRoleOnEventWarning,
} from './multi-role-on-event-warning'

describe('formatMultiRoleOnEventWarningMessage', () => {
  it('formats a single other role', () => {
    const warning: MultiRoleOnEventWarning = { otherRoleKeys: ['dj'] }
    expect(formatMultiRoleOnEventWarningMessage(warning)).toBe(
      'Attention : cette personne est aussi composée comme DJ.',
    )
  })

  it('formats multiple other roles', () => {
    const warning: MultiRoleOnEventWarning = { otherRoleKeys: ['dj', 'player'] }
    expect(formatMultiRoleOnEventWarningMessage(warning)).toMatch(/DJ/)
    expect(formatMultiRoleOnEventWarningMessage(warning)).toMatch(/Comédien/)
  })
})
