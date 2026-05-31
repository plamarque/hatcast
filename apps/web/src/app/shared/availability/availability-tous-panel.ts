import { Component, effect, input, output, signal } from '@angular/core'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatListModule } from '@angular/material/list'

import type {
  EventAvailabilitySummary,
  SummaryParticipant,
  SummaryRoleCandidate,
} from '../../core/availability/availability-api.service'
import { chanceColorClass } from '../../core/availability/availability-chances'
import {
  ROLE_EMOJIS,
  ROLE_LABELS,
  totalSlots,
  type RoleKey,
} from '../../core/events/event-types'

@Component({
  selector: 'app-availability-tous-panel',
  imports: [MatExpansionModule, MatListModule],
  templateUrl: './availability-tous-panel.html',
  styleUrl: './availability-tous-panel.scss',
})
export class AvailabilityTousPanel {
  readonly summary = input.required<EventAvailabilitySummary>()
  readonly loadingChances = input(false)
  readonly canSelectSubject = input(false)

  readonly participantSelected = output<SummaryParticipant>()

  protected readonly expandedRoles = signal<Set<string>>(new Set())

  constructor() {
    effect(() => {
      const roles = this.summary().roles.map((r) => r.roleKey)
      this.expandedRoles.set(new Set(roles))
    })
  }

  protected hasRoles(): boolean {
    return totalSlots(this.summary().roleSlots) > 0
  }

  protected flatParticipants(): SummaryParticipant[] {
    return this.summary().participants
  }

  protected flatAvailableCount(): number {
    return this.flatParticipants().filter((p) => p.status === 'available').length
  }

  protected roleLabel(roleKey: string): string {
    return ROLE_LABELS[roleKey as RoleKey] ?? roleKey
  }

  protected roleEmoji(roleKey: string): string {
    return ROLE_EMOJIS[roleKey as RoleKey] ?? '•'
  }

  /** M3 tokens — inline color beats mat-list-item meta defaults. */
  protected chanceColorVar(percent: number): string {
    return `var(--hatcast-chance-${chanceColorClass(percent)})`
  }

  protected statusLabel(status: SummaryParticipant['status']): string {
    switch (status) {
      case 'available':
        return 'Dispo'
      case 'unavailable':
        return 'Pas dispo'
      default:
        return 'Non renseigné'
    }
  }

  protected participantAriaLabel(candidate: SummaryRoleCandidate | SummaryParticipant): string {
    const name = candidate.displayName
    if (!this.canSelectSubject()) {
      return `Voir la disponibilité de ${name}`
    }
    return `Modifier la disponibilité de ${name}`
  }

  protected onParticipantClick(participantId: string): void {
    if (!this.canSelectSubject()) return
    const participant = this.summary().participants.find((p) => p.participantId === participantId)
    if (participant) {
      this.participantSelected.emit(participant)
    }
  }

  protected isRoleExpanded(roleKey: string): boolean {
    return this.expandedRoles().has(roleKey)
  }
}
