import { describe, expect, it } from 'vitest'

import {
  applyTemplate,
  detectTemplateFromRoles,
  jeuSubColumn,
  normalizeRoleSlots,
  rolesRequiredForEvent,
  ROLE_TEMPLATES,
} from './event-types'

describe('event-types', () => {
  it('applyTemplate returns cabaret defaults', () => {
    const slots = applyTemplate('cabaret')
    expect(slots['player']).toBe(5)
    expect(slots['mc']).toBe(1)
    expect(slots['dj']).toBe(1)
    expect(slots['referee']).toBe(0)
  })

  it('detectTemplateFromRoles recognizes match', () => {
    expect(detectTemplateFromRoles(ROLE_TEMPLATES.match)).toBe('match')
  })

  it('detectTemplateFromRoles falls back to custom', () => {
    const custom = { ...ROLE_TEMPLATES.cabaret, player: 6 }
    expect(detectTemplateFromRoles(custom)).toBe('custom')
  })

  it('rolesRequiredForEvent lists roles with count > 0 in draw order', () => {
    expect(rolesRequiredForEvent(ROLE_TEMPLATES.deplacement)).toEqual(['player'])
    expect(rolesRequiredForEvent(ROLE_TEMPLATES.match)).toEqual([
      'referee',
      'mc',
      'player',
      'assistant_referee',
      'volunteer',
    ])
  })

  it('jeuSubColumn maps types for historique categories', () => {
    expect(jeuSubColumn('match')).toBe('match')
    expect(jeuSubColumn('cabaret')).toBe('cabaret')
    expect(jeuSubColumn('deplacement')).toBeNull()
    expect(jeuSubColumn('catch')).toBe('autre')
  })

  it('normalizeRoleSlots fills missing keys with zero', () => {
    const n = normalizeRoleSlots({ player: 3 })
    expect(n['player']).toBe(3)
    expect(n['mc']).toBe(0)
  })
})
