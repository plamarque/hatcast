import { BreakpointObserver } from '@angular/cdk/layout'
import { inject, Injectable } from '@angular/core'
import { MatBottomSheet } from '@angular/material/bottom-sheet'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { firstValueFrom } from 'rxjs'

import { CompositionApiService } from '../../core/composition/composition-api.service'
import { ROLE_EMOJIS, ROLE_LABELS, type RoleKey } from '../../core/events/event-types'
import { CHANCE_BREAKDOWN_DESKTOP_MEDIA_QUERY } from './chance-breakdown.constants'
import {
  ChanceBreakdownSheet,
  type ChanceBreakdownSheetData,
} from './chance-breakdown-sheet/chance-breakdown-sheet'
import { CompositionOverlayGateService } from './composition-overlay-gate.service'

export interface ChanceBreakdownOpenContext {
  seasonId: string
  eventId: string
  roleKey: string
  participantId: string
  /** Participant ids linked to the viewer account (for ta/sa copy). */
  viewerParticipantIds?: readonly string[]
  /** Optional banner above waterfall (e.g. draw animation step). */
  stepBanner?: string | null
}

@Injectable({ providedIn: 'root' })
export class ChanceBreakdownService {
  private readonly bottomSheet = inject(MatBottomSheet)
  private readonly dialog = inject(MatDialog)
  private readonly breakpointObserver = inject(BreakpointObserver)
  private readonly compositionApi = inject(CompositionApiService)
  private readonly snack = inject(MatSnackBar)
  private readonly overlayGate = inject(CompositionOverlayGateService)

  isDesktopViewport(): boolean {
    return this.breakpointObserver.isMatched(CHANCE_BREAKDOWN_DESKTOP_MEDIA_QUERY)
  }

  roleHeaderLabel(roleKey: string): string {
    const key = roleKey as RoleKey
    const emoji = ROLE_EMOJIS[key] ?? '•'
    const label = ROLE_LABELS[key] ?? roleKey
    return `${emoji} ${label}`
  }

  async open(context: ChanceBreakdownOpenContext): Promise<void> {
    if (!this.overlayGate.tryAcquireBreakdown()) {
      this.snack.open('Une fiche est déjà ouverte.', 'OK', { duration: 3000 })
      return
    }
    const isDesktop = this.isDesktopViewport()
    try {
      const result = await this.compositionApi.getChanceBreakdown(
        context.seasonId,
        context.eventId,
        context.roleKey,
        context.participantId,
      )
      if (!result.ok || !result.data) {
        this.snack.open(
          result.errorMessage ?? 'Impossible d’afficher le détail de la cote.',
          'OK',
          { duration: 6000 },
        )
        return
      }
      const sheetData: ChanceBreakdownSheetData = {
        seasonId: context.seasonId,
        eventId: context.eventId,
        roleKey: context.roleKey,
        roleHeaderLabel: this.roleHeaderLabel(context.roleKey),
        stepBanner: context.stepBanner ?? null,
        breakdown: result.data,
        isDesktop,
        viewerParticipantIds: [...(context.viewerParticipantIds ?? [])],
      }
      if (isDesktop) {
        await firstValueFrom(
          this.dialog
            .open(ChanceBreakdownSheet, {
              data: sheetData,
              width: 'min(100vw - 2rem, 28rem)',
              maxHeight: '90vh',
              panelClass: 'chance-breakdown-dialog',
              autoFocus: 'first-tabbable',
            })
            .afterClosed(),
        )
      } else {
        await firstValueFrom(
          this.bottomSheet
            .open(ChanceBreakdownSheet, {
              data: sheetData,
              panelClass: 'chance-breakdown-sheet-panel',
            })
            .afterDismissed(),
        )
      }
    } finally {
      this.overlayGate.release()
    }
  }
}
