import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'

import type { EventResponse } from '../../core/events/event-api.service'
import type {
  RoleAssignmentLine,
  ShareAnnounceIntent,
} from '../../core/messaging/share-announce-messages'
import {
  ShareAnnounceDialog,
  type ShareAnnounceDialogData,
} from './share-announce-dialog'
import {
  SHARE_ANNOUNCE_SNACK_DURATION_MS,
  shareAnnounceSnackMessage,
  type ShareAnnounceNotifyResult,
} from './share-announce-snack'

export interface OpenShareAnnounceDialogContext {
  intent: ShareAnnounceIntent
  seasonId: string
  seasonSlug: string
  troupeSlug: string
  event: EventResponse
  roleLines?: RoleAssignmentLine[]
  compositionValidatedAt?: string | null
}

export function openShareAnnounceDialog(
  dialog: MatDialog,
  snack: MatSnackBar,
  ctx: OpenShareAnnounceDialogContext,
): void {
  const ev = ctx.event
  const ref = dialog.open<ShareAnnounceDialog, ShareAnnounceDialogData, ShareAnnounceNotifyResult | undefined>(
    ShareAnnounceDialog,
    {
      data: {
        intent: ctx.intent,
        seasonId: ctx.seasonId,
        eventId: ev.id,
        troupeSlug: ctx.troupeSlug,
        seasonSlug: ctx.seasonSlug,
        eventSlug: ev.slug,
        eventTitle: ev.title,
        eventDateIso: ev.startsAt,
        roleLines: ctx.roleLines ?? [],
        availabilityOpenedAt: ev.availabilityOpenedAt ?? null,
        compositionValidatedAt: ctx.compositionValidatedAt ?? null,
      },
      width: 'min(42rem, 96vw)',
      maxHeight: '92vh',
      autoFocus: 'first-titled-element',
    },
  )
  ref.afterClosed().subscribe((result) => {
    if (result) {
      snack.open(shareAnnounceSnackMessage(result), 'OK', {
        duration: SHARE_ANNOUNCE_SNACK_DURATION_MS,
      })
    }
  })
}

export function openEventAnnounceDialog(
  dialog: MatDialog,
  snack: MatSnackBar,
  ctx: Omit<OpenShareAnnounceDialogContext, 'intent' | 'roleLines' | 'compositionValidatedAt'>,
): void {
  openShareAnnounceDialog(dialog, snack, { ...ctx, intent: 'event', roleLines: [] })
}

export function openAvailabilityNudgeDialog(
  dialog: MatDialog,
  snack: MatSnackBar,
  ctx: Omit<OpenShareAnnounceDialogContext, 'intent' | 'roleLines' | 'compositionValidatedAt'>,
): void {
  openShareAnnounceDialog(dialog, snack, { ...ctx, intent: 'availability_nudge', roleLines: [] })
}
