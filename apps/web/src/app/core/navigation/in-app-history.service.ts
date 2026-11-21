import { Location } from '@angular/common'
import { inject, Injectable } from '@angular/core'
import { NavigationEnd, NavigationStart, Router } from '@angular/router'

const DEPTH_STATE_KEY = 'inAppHistoryDepth'

/**
 * Tracks how many in-app history entries sit behind the current one.
 *
 * `navigationId` from `Location.getState()` is not enough: a `replaceUrl`
 * navigation (e.g. the legacy `/saison/…` redirect after a notification link)
 * raises it without a new history entry, so `Location.back()` leaves the app
 * or does nothing. The depth is stored in each history entry so it survives
 * browser back/forward and reloads.
 */
@Injectable({ providedIn: 'root' })
export class InAppHistoryService {
  private readonly router = inject(Router)
  private readonly location = inject(Location)

  private depth = 0
  private lastUrl: string | undefined
  private restoredDepth: number | undefined

  constructor() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        const restored = event.restoredState?.[DEPTH_STATE_KEY]
        this.restoredDepth = typeof restored === 'number' ? restored : undefined
      } else if (event instanceof NavigationEnd) {
        this.onNavigationEnd(event)
      }
    })
  }

  /** True when `Location.back()` stays inside the app. */
  canGoBack(): boolean {
    return this.depth > 0
  }

  private onNavigationEnd(event: NavigationEnd): void {
    const navigation = this.router.currentNavigation()
    if (!navigation || navigation.extras.skipLocationChange) {
      return
    }

    if (this.restoredDepth !== undefined) {
      this.depth = this.restoredDepth
    } else if (navigation.trigger !== 'imperative') {
      // An entry without a stored depth: a fallback navigation is safe, a
      // `Location.back()` with no entry is not.
      this.depth = 0
    } else if (
      this.lastUrl !== undefined &&
      this.lastUrl !== event.urlAfterRedirects &&
      !navigation.extras.replaceUrl
    ) {
      this.depth += 1
    }
    this.lastUrl = event.urlAfterRedirects

    const state = (this.location.getState() as Record<string, unknown> | null) ?? {}
    this.location.replaceState(this.location.path(true), '', {
      ...state,
      [DEPTH_STATE_KEY]: this.depth,
    })
  }
}
