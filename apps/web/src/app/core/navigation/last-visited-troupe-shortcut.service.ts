import { computed, Injectable, signal } from '@angular/core'

import { getLastVisitedTroupeSlug } from './last-visited-troupe-storage'

/** Nav « Ma troupe » → hub (`/troupes/:slug`) or list fallback. */
@Injectable({ providedIn: 'root' })
export class LastVisitedTroupeShortcutService {
  readonly troupeSlug = signal<string | null>(null)

  readonly link = computed(() => {
    const slug = this.troupeSlug()
    return slug ? `/troupes/${slug}` : '/troupes'
  })

  refresh(): void {
    this.troupeSlug.set(getLastVisitedTroupeSlug())
  }

  /** True on troupe hub and troupe admin routes — not on `/troupes` list. */
  isTroupeTabActive(path: string): boolean {
    const normalized = path.trim() || '/'
    if (normalized === '/troupes') {
      return false
    }
    return /^\/troupes\/[^/]+(?:\/admin(?:\/[^/]+)*)?$/.test(normalized)
  }
}
