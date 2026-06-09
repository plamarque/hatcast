import { MatDialog } from '@angular/material/dialog'

import type { EventResponse } from '../../core/events/event-api.service'
import type {
  RoleAssignmentLine,
  ShareAnnounceIntent,
} from '../../core/messaging/share-announce-messages'
import {
  ShareAnnounceDialog,
  type ShareAnnounceDialogData,
} from './share-announce-dialog'

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
  ctx: OpenShareAnnounceDialogContext,
): void {
  const ev = ctx.event
  dialog.open<ShareAnnounceDialog, ShareAnnounceDialogData, void>(
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
}

export function openEventAnnounceDialog(
  dialog: MatDialog,
  ctx: Omit<OpenShareAnnounceDialogContext, 'intent' | 'roleLines' | 'compositionValidatedAt'>,
): void {
  openShareAnnounceDialog(dialog, { ...ctx, intent: 'event', roleLines: [] })
}

export function openAvailabilityNudgeDialog(
  dialog: MatDialog,
  ctx: Omit<OpenShareAnnounceDialogContext, 'intent' | 'roleLines' | 'compositionValidatedAt'>,
): void {
  openShareAnnounceDialog(dialog, { ...ctx, intent: 'availability_nudge', roleLines: [] })
}
