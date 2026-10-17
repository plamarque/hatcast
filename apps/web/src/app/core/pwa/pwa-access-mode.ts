export type PwaAccessMode = 'standalone' | 'web'

/**
 * Reads browser state only. Stored installation hints are intentionally excluded:
 * they support UX but are not evidence of the current access mode.
 */
export function resolvePwaAccessMode(): PwaAccessMode {
  if (typeof window === 'undefined') {
    return 'web'
  }
  if (window.matchMedia?.('(display-mode: standalone)').matches) {
    return 'standalone'
  }
  const navigatorWithStandalone = window.navigator as Navigator & { standalone?: boolean }
  return navigatorWithStandalone.standalone === true ? 'standalone' : 'web'
}
