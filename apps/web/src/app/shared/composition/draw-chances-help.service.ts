import { BreakpointObserver } from '@angular/cdk/layout'
import { inject, Injectable } from '@angular/core'
import { MatBottomSheet } from '@angular/material/bottom-sheet'
import { MatDialog } from '@angular/material/dialog'
import { firstValueFrom } from 'rxjs'

import { CHANCE_BREAKDOWN_DESKTOP_MEDIA_QUERY } from './chance-breakdown.constants'
import { CompositionOverlayGateService } from './composition-overlay-gate.service'
import {
  DrawChancesHelpDialog,
  type DrawChancesHelpData,
} from './draw-chances-help/draw-chances-help-dialog'

@Injectable({ providedIn: 'root' })
export class DrawChancesHelpService {
  private readonly bottomSheet = inject(MatBottomSheet)
  private readonly dialog = inject(MatDialog)
  private readonly breakpointObserver = inject(BreakpointObserver)
  private readonly overlayGate = inject(CompositionOverlayGateService)

  async open(): Promise<void> {
    if (!this.overlayGate.tryAcquireHelp()) {
      return
    }
    const isDesktop = this.breakpointObserver.isMatched(CHANCE_BREAKDOWN_DESKTOP_MEDIA_QUERY)
    const data: DrawChancesHelpData = { isMobile: !isDesktop }

    try {
      if (isDesktop) {
        await firstValueFrom(
          this.dialog
            .open(DrawChancesHelpDialog, {
              data,
              width: 'min(100vw - 2rem, 42rem)',
              maxHeight: '90vh',
              panelClass: 'draw-chances-help-dialog-panel',
              autoFocus: 'first-tabbable',
            })
            .afterClosed(),
        )
        return
      }

      await firstValueFrom(
        this.bottomSheet
          .open(DrawChancesHelpDialog, {
            data,
            panelClass: 'draw-chances-help-sheet-panel',
          })
          .afterDismissed(),
      )
    } finally {
      this.overlayGate.release()
    }
  }
}
