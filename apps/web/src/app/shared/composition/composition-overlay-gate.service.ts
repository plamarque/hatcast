import { Injectable } from '@angular/core'

/**
 * Coordinates MatDialog / MatBottomSheet overlays.
 * Breakdown uses the base layer; general help may stack once on top (link from breakdown sheet).
 */
@Injectable({ providedIn: 'root' })
export class CompositionOverlayGateService {
  private depth = 0

  tryAcquireBreakdown(): boolean {
    if (this.depth > 0) {
      return false
    }
    this.depth += 1
    return true
  }

  tryAcquireHelp(): boolean {
    if (this.depth >= 2) {
      return false
    }
    this.depth += 1
    return true
  }

  release(): void {
    this.depth = Math.max(0, this.depth - 1)
  }
}
