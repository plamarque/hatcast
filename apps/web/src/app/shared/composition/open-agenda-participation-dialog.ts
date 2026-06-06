import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { firstValueFrom } from 'rxjs'

import type { MemberGender } from '../../core/account/member-gender'
import {
  CompositionApiService,
  type SlotParticipationUpdateStatus,
} from '../../core/composition/composition-api.service'
import {
  ConfirmDialog,
  type ConfirmDialogData,
} from '../../pages/seasons-list/confirm-dialog'
import { getRoleLabel, roleEmoji, type RoleKey } from '../event-roles/event-roles'
import { findViewerParticipationSlot } from './agenda-participation-slot'
import {
  CompositionParticipationDialog,
  type CompositionParticipationDialogData,
  type CompositionParticipationDialogResult,
} from './composition-participation-dialog'

export interface OpenAgendaParticipationDialogParams {
  seasonId: string
  eventId: string
  eventTitle: string
  eventStartsAt: string
  roleKey: string
  currentStatus: 'pending' | 'confirmed' | 'declined'
  viewerGender?: MemberGender
}

export interface AgendaParticipationDialogResult {
  status: SlotParticipationUpdateStatus
}

function participationErrorMessage(status: number, apiMessage?: string): string {
  if (apiMessage) {
    return apiMessage
  }
  switch (status) {
    case 403:
      return 'Vous ne pouvez pas modifier cette participation.'
    case 409:
      return 'Les confirmations ne sont pas encore ouvertes.'
    default:
      return 'Impossible de mettre à jour la participation.'
  }
}

export async function openAgendaParticipationDialog(
  dialog: MatDialog,
  compositionApi: CompositionApiService,
  snack: MatSnackBar,
  params: OpenAgendaParticipationDialogParams,
): Promise<AgendaParticipationDialogResult | undefined> {
  const compositionResult = await compositionApi.getComposition(params.seasonId, params.eventId)
  if (!compositionResult.ok || !compositionResult.data) {
    snack.open('Impossible de charger la composition.', 'OK', { duration: 6000 })
    return undefined
  }

  const slot = findViewerParticipationSlot(compositionResult.data, params.roleKey)
  if (!slot) {
    snack.open('Aucun rôle assigné trouvé pour ce spectacle.', 'OK', { duration: 6000 })
    return undefined
  }

  const roleKey = params.roleKey as RoleKey
  const roleGender =
    params.viewerGender === 'male' || params.viewerGender === 'female'
      ? params.viewerGender
      : (slot.participantGender ?? undefined)
  const dialogRef = dialog.open<
    CompositionParticipationDialog,
    CompositionParticipationDialogData,
    CompositionParticipationDialogResult | undefined
  >(CompositionParticipationDialog, {
    data: {
      eventTitle: params.eventTitle,
      eventDate: params.eventStartsAt,
      roleLabel: getRoleLabel(roleKey, roleGender),
      roleEmoji: roleEmoji(roleKey),
      currentStatus: slot.participationStatus,
      mode: 'self',
    },
    autoFocus: 'first-titled-element',
  })

  const result = await firstValueFrom(dialogRef.afterClosed())
  if (!result) {
    return undefined
  }

  if (result.status === 'declined') {
    const confirmed = await firstValueFrom(
      dialog
        .open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
          data: {
            title: 'Décliner la participation',
            message: 'Confirmer votre désistement pour ce rôle ?',
            confirmLabel: 'Décliner',
            destructive: true,
          },
        })
        .afterClosed(),
    )
    if (!confirmed) {
      return undefined
    }
  }

  const updateResult = await compositionApi.updateSlotParticipation(
    params.seasonId,
    params.eventId,
    slot.roleKey,
    slot.slotIndex,
    result.status,
    result.note,
  )
  if (!updateResult.ok) {
    snack.open(
      participationErrorMessage(updateResult.status, updateResult.errorMessage),
      'OK',
      { duration: 6000 },
    )
    return undefined
  }

  const message =
    result.status === 'confirmed'
      ? 'Participation confirmée.'
      : result.status === 'declined'
        ? 'Participation déclinée.'
        : 'Participation remise en attente.'
  snack.open(message, 'OK', { duration: 4000 })
  return { status: result.status }
}
