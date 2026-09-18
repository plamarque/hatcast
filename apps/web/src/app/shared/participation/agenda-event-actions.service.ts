import { Injectable, inject } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { AuthApiService } from '../../core/auth/auth-api.service'
import type { UserAgendaItem } from '../../core/agenda/user-agenda-api.service'
import type { MemberGender } from '../../core/account/member-gender'
import { AvailabilityApiService } from '../../core/availability/availability-api.service'
import { CompositionApiService } from '../../core/composition/composition-api.service'
import { EventApiService } from '../../core/events/event-api.service'
import { normalizeRoleSlots } from '../../core/events/event-types'
import { TroupeContextService } from '../../core/troupes/troupe-context.service'
import { applyAvailabilityUpdateToAgendaEvent, applyParticipationUpdateToAgendaEvent, isDeclinedParticipationFocus, participantFocusFromEvent } from '../../pages/season-home/season-participant-focus'
import { openAgendaAvailabilityDialog } from '../availability/open-agenda-availability-dialog'
import { openAgendaParticipationDialog } from '../composition/open-agenda-participation-dialog'

export type AgendaEventActionResult = false | { kind: 'saved' | 'refresh'; item: UserAgendaItem }

@Injectable({ providedIn: 'root' })
export class AgendaEventActionsService {
  private readonly auth = inject(AuthApiService)
  private readonly troupes = inject(TroupeContextService)
  private readonly events = inject(EventApiService)
  private readonly availability = inject(AvailabilityApiService)
  private readonly composition = inject(CompositionApiService)
  private readonly dialog = inject(MatDialog)
  private readonly snack = inject(MatSnackBar)
  private readonly opening = new Set<string>()

  canEditAvailability(item: UserAgendaItem): boolean {
    const focus = participantFocusFromEvent(item)
    return this.troupes.activeTroupes().some(t => t.id === item.troupeId && t.membership.status === 'ACTIVE')
      && !focus.inTeam && !isDeclinedParticipationFocus(focus)
  }

  canConfirmParticipation(item: UserAgendaItem): boolean {
    const focus = participantFocusFromEvent(item)
    return focus.inTeam && !!focus.compositionRoleKey
  }

  async openAvailability(item: UserAgendaItem): Promise<AgendaEventActionResult> {
    if (!this.canEditAvailability(item) || this.opening.has(item.eventId)) return false
    this.opening.add(item.eventId)
    try {
      const event = await this.events.getEvent(item.seasonId, item.eventId)
      if (!event.ok || !event.data) throw new Error('event-load')
      if (event.data.archived) {
        this.snack.open('Cet événement est archivé : la disponibilité ne peut plus être modifiée.', 'OK', { duration: 5000 })
        return false
      }
      // Recheck team state from the fresh event before opening an availability editor.
      if (event.data.participantFocus && !this.canEditAvailability({ ...item, participantFocus: event.data.participantFocus })) {
        this.snack.open("Ta participation a changé. La carte est actualisée ; utilise son badge pour la modifier.", 'OK', { duration: 5000 })
        return { kind: 'refresh', item: { ...item, participantFocus: event.data.participantFocus, myAvailabilityStatus: event.data.myAvailabilityStatus ?? item.myAvailabilityStatus } }
      }
      const result = await openAgendaAvailabilityDialog(this.dialog, this.availability, {
        seasonId: item.seasonId,
        eventId: item.eventId,
        eventTitle: item.title,
        eventStartsAt: item.startsAt,
        troupeId: item.troupeId,
        roleSlots: normalizeRoleSlots(event.data.roleSlots),
        subjectDisplayName: this.troupes.currentUserDisplayLabel(this.auth.sessionUser()),
        fallbackStatus: item.myAvailabilityStatus ?? 'unknown',
        availabilityOpenedAt: event.data.availabilityOpenedAt ?? null,
      })
      return result ? { kind: 'saved', item: applyAvailabilityUpdateToAgendaEvent(item, result.status) } : false
    } catch {
      this.snack.open('Impossible de charger la disponibilité. Réessaie dans un instant.', 'OK', { duration: 5000 })
      return false
    } finally {
      this.opening.delete(item.eventId)
    }
  }

  async openParticipation(item: UserAgendaItem, viewerGender?: MemberGender): Promise<AgendaEventActionResult> {
    const focus = participantFocusFromEvent(item)
    if (!this.canConfirmParticipation(item) || this.opening.has(item.eventId)) return false
    this.opening.add(item.eventId)
    try {
      const result = await openAgendaParticipationDialog(this.dialog, this.composition, this.snack, {
        seasonId: item.seasonId,
        eventId: item.eventId,
        eventTitle: item.title,
        eventStartsAt: item.startsAt,
        roleKey: focus.compositionRoleKey!,
        currentStatus: focus.slotParticipationStatus ?? 'pending',
        viewerGender,
      })
      return result ? { kind: 'saved', item: applyParticipationUpdateToAgendaEvent(item, result.status) } : false
    } finally {
      this.opening.delete(item.eventId)
    }
  }
}
