import { MatDialog } from '@angular/material/dialog'

import { AvailabilityApiService } from '../../core/availability/availability-api.service'
import type { AvailabilityStatus } from '../../core/availability/availability-status'
import type { RoleSlots } from '../../core/events/event-types'
import {
  AvailabilityDialog,
  type AvailabilityDialogData,
  type AvailabilityDialogResult,
} from './availability-dialog'

export interface OpenAgendaAvailabilityDialogParams {
  seasonId: string
  eventId: string
  eventTitle: string
  eventStartsAt: string
  troupeId: string
  roleSlots: RoleSlots
  subjectDisplayName: string
  fallbackStatus: AvailabilityStatus
  availabilityOpenedAt?: string | null
}

export async function openAgendaAvailabilityDialog(
  dialog: MatDialog,
  availabilityApi: AvailabilityApiService,
  params: OpenAgendaAvailabilityDialogParams,
): Promise<AvailabilityDialogResult | undefined> {
  const availability = await availabilityApi.getMyAvailability(params.seasonId, params.eventId)
  const initialStatus =
    availability.ok && availability.data ? availability.data.status : params.fallbackStatus
  const initialRoleKeys = availability.ok && availability.data ? availability.data.roleKeys : []
  const initialComment =
    availability.ok && availability.data ? (availability.data.comment ?? null) : null

  const ref = dialog.open<AvailabilityDialog, AvailabilityDialogData, AvailabilityDialogResult>(
    AvailabilityDialog,
    {
      data: {
        seasonId: params.seasonId,
        eventId: params.eventId,
        eventTitle: params.eventTitle,
        eventStartsAt: params.eventStartsAt,
        subjectDisplayName: params.subjectDisplayName,
        initialStatus,
        troupeId: params.troupeId,
        roleSlots: params.roleSlots,
        initialRoleKeys,
        initialComment,
        availabilityOpenedAt: params.availabilityOpenedAt ?? null,
      },
      width: 'min(100vw - 2rem, 26rem)',
      autoFocus: 'first-tabbable',
    },
  )

  return new Promise((resolve) => {
    ref.afterClosed().subscribe((result) => resolve(result ?? undefined))
  })
}
