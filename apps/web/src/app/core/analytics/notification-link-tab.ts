import type { ParamMap } from '@angular/router'

import type { Fr47NotificationLinkTab } from './fr47-event-names'

/**
 * Detects notification deep-link query params (email/push templates).
 * Returns null when no notification-specific tab signal is present.
 */
export function resolveNotificationLinkTab(params: ParamMap): Fr47NotificationLinkTab | null {
  if (params.get('showConfirm') === 'true') {
    return 'confirm'
  }
  const tabParam = params.get('tab')
  if (tabParam) {
    const normalized = tabParam.toLowerCase()
    if (normalized === 'dispos' || normalized === 'team') {
      return 'dispos'
    }
    if (normalized === 'equipe' || normalized === 'compo') {
      return 'equipe'
    }
  }
  if (params.get('showAvailability') === 'true') {
    return 'dispos'
  }
  return null
}
