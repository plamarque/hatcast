import { convertToParamMap } from '@angular/router'
import { describe, expect, it } from 'vitest'

import { resolveNotificationLinkTab } from './notification-link-tab'

describe('resolveNotificationLinkTab (ParamMap)', () => {
  it('returns dispos for tab=dispos and legacy team alias', () => {
    expect(resolveNotificationLinkTab(convertToParamMap({ tab: 'dispos' }))).toBe('dispos')
    expect(resolveNotificationLinkTab(convertToParamMap({ tab: 'team' }))).toBe('dispos')
    expect(resolveNotificationLinkTab(convertToParamMap({ showAvailability: 'true' }))).toBe(
      'dispos',
    )
  })

  it('returns equipe for tab=equipe and compo alias', () => {
    expect(resolveNotificationLinkTab(convertToParamMap({ tab: 'equipe' }))).toBe('equipe')
    expect(resolveNotificationLinkTab(convertToParamMap({ tab: 'compo' }))).toBe('equipe')
  })

  it('returns confirm for showConfirm=true', () => {
    expect(resolveNotificationLinkTab(convertToParamMap({ showConfirm: 'true' }))).toBe('confirm')
  })

  it('returns null when no notification deep-link signal', () => {
    expect(resolveNotificationLinkTab(convertToParamMap({ tab: 'infos' }))).toBeNull()
    expect(resolveNotificationLinkTab(convertToParamMap({}))).toBeNull()
  })
})
