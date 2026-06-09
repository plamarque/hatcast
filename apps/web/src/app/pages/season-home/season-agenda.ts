import { Component, input, output } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'

import type { MemberGender } from '../../core/account/member-gender'
import type { AvailabilityStatus } from '../../core/availability/availability-status'
import { isEventDraft } from '../../core/events/event-draft'
import type { MonthEventGroup } from './season-events.utils'
import { getEventTypeIcon } from '../../core/events/event-types'
import { CompositionStatusBadge } from '../../shared/composition/composition-status-badge'
import { AgendaParticipationStatus } from '../../shared/participation/agenda-participation-status'
import {
  agendaParticipationStatusAriaLabel,
  agendaParticipationStatusFromEvent,
} from '../../shared/participation/agenda-participation-status.utils'
import {
  isDeclinedParticipationFocus,
  participantFocusFromEvent,
  type ParticipantFocusSummary,
} from './season-participant-focus'

@Component({
  selector: 'app-season-agenda',
  imports: [
    MatButtonModule,
    CompositionStatusBadge,
    AgendaParticipationStatus,
  ],
  templateUrl: './season-agenda.html',
  styleUrl: './season-agenda.scss',
})
export class SeasonAgenda {
  /** agenda = upcoming with actions ; history = past read-only cards (story 3.6b). */
  readonly variant = input<'agenda' | 'history'>('agenda')
  readonly monthGroups = input.required<MonthEventGroup[]>()
  readonly loading = input(false)
  readonly truncated = input(false)
  readonly totalElements = input(0)
  readonly loadedEventsCount = input(0)
  readonly canManageEvents = input(false)
  readonly canEditAvailability = input(false)
  /** When filters exclude every card (Historique). */
  readonly filtersExcludeAll = input(false)
  /** Slug → display label for category badges (story 17.8). */
  readonly categoryLabels = input<Record<string, string>>({})
  /** Preloaded viewer gender — avoids per-card preferences fetch (PERF-01). */
  readonly viewerGender = input<MemberGender | undefined>(undefined)

  readonly eventClick = output<string>()
  readonly loadMoreClick = output<void>()
  readonly availabilityClick = output<{ eventId: string; status: AvailabilityStatus }>()
  readonly participationClick = output<{ eventId: string }>()

  protected openEvent(id: string): void {
    this.eventClick.emit(id)
  }

  protected onStatusAvailabilityClick(eventId: string, status: AvailabilityStatus): void {
    this.availabilityClick.emit({ eventId, status })
  }

  protected onStatusParticipationClick(eventId: string): void {
    this.participationClick.emit({ eventId })
  }

  protected dispoStatus(ev: { myAvailabilityStatus?: AvailabilityStatus }): AvailabilityStatus {
    return ev.myAvailabilityStatus ?? 'unknown'
  }

  protected canEditAvailabilityOnCard(ev: {
    myAvailabilityStatus?: AvailabilityStatus | null
    participantFocus?: ParticipantFocusSummary | null
  }): boolean {
    const focus = participantFocusFromEvent(ev)
    return (
      this.variant() === 'agenda' &&
      this.canEditAvailability() &&
      !focus.inTeam &&
      !isDeclinedParticipationFocus(focus)
    )
  }

  protected canConfirmParticipationOnCard(ev: {
    participantFocus?: ParticipantFocusSummary | null
  }): boolean {
    const focus = participantFocusFromEvent(ev)
    return this.variant() === 'agenda' && focus.inTeam && !!focus.compositionRoleKey
  }

  protected historyCardAriaLabel(ev: {
    title: string
    dayNumber: number
    dayName: string
    myAvailabilityStatus?: AvailabilityStatus | null
    participantFocus?: ParticipantFocusSummary | null
  }): string {
    const statusLabel = agendaParticipationStatusAriaLabel(
      agendaParticipationStatusFromEvent(ev, false),
    )
    return `${ev.title}, ${ev.dayNumber} ${ev.dayName}, ${statusLabel}`
  }

  protected typeIcon(templateType: string): string {
    return getEventTypeIcon(templateType)
  }

  protected readonly isEventDraft = isEventDraft

  protected categoryBadgeLabel(ev: { category?: string | null }): string | null {
    const slug = ev.category
    if (!slug) {
      return null
    }
    return this.categoryLabels()[slug] ?? slug
  }
}
