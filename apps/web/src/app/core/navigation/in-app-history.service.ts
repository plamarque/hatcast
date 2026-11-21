import { inject, Injectable } from '@angular/core'
import { NavigationEnd, NavigationStart, Router } from '@angular/router'

/**
 * Tracks how many in-app history entries sit behind the current one.
 *
 * `navigationId` from `Location.getState()` is not enough: a `replaceUrl`
 * navigation (e.g. the legacy `/saison/…` redirect after a notification link)
 * raises it without a new history entry, so `Location.back()` leaves the app
 * or does nothing.
 */
@Injectable({ providedIn: 'root' })
export class InAppHistoryService {
  private readonly router = inject(Router)

  private depth = 0
  private readonly depthByNavigationId = new Map<number, number>()
  private restoredNavigationId: number | undefined

  constructor() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.restoredNavigationId = event.restoredState?.navigationId
      } else if (event instanceof NavigationEnd) {
        this.onNavigationEnd(event.id)
      }
    })
  }

  /** True when `Location.back()` stays inside the app. */
  canGoBack(): boolean {
    return this.depth > 0
  }

  private onNavigationEnd(navigationId: number): void {
    const navigation = this.router.currentNavigation()
    if (navigation?.extras.skipLocationChange) {
      return
    }

    if (navigation?.trigger === 'popstate' || navigation?.trigger === 'hashchange') {
      // Unknown entries (e.g. from before a reload) fall back to 0: a fallback
      // navigation is safe, a `Location.back()` with no entry is not.
      const restoredId = this.restoredNavigationId
      this.depth = restoredId === undefined ? 0 : (this.depthByNavigationId.get(restoredId) ?? 0)
    } else if (!navigation?.previousNavigation) {
      this.depth = 0
    } else if (!navigation.extras.replaceUrl && !this.isSameUrl(navigation)) {
      this.depth += 1
    }

    this.depthByNavigationId.set(navigationId, this.depth)
  }

  private isSameUrl(navigation: NonNullable<ReturnType<Router['currentNavigation']>>): boolean {
    const previousUrl = navigation.previousNavigation?.finalUrl
    const url = navigation.finalUrl
    return !!previousUrl && !!url && this.router.serializeUrl(previousUrl) === this.router.serializeUrl(url)
  }
}
