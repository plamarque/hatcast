import { Injectable } from '@angular/core'

/** Prevents stacking MatDialog / MatBottomSheet overlays (breakdown + help). */
@Injectable({ providedIn: 'root' })
export class CompositionOverlayGateService {
  private depth = 0

  tryAcquire(): boolean {
    if (this.depth > 0) {
      return false
    }
    this.depth += 1
    return true
  }

  release(): void {
    this.depth = Math.max(0, this.depth - 1)
  }
}
