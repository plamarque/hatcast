import { Component, effect, inject, input, output, signal } from '@angular/core'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatIconModule } from '@angular/material/icon'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatTooltipModule } from '@angular/material/tooltip'

import type { CompositionPoolPreviewSegment } from '../../core/composition/composition-api.service'
import type {
  ChanceSource,
  EventAvailabilitySummary,
  SummaryParticipant,
  SummaryRoleCandidate,
} from '../../core/availability/availability-api.service'
import { CompositionPoolPreview } from '../composition/composition-pool-preview'
import { ChanceBreakdownService } from '../composition/chance-breakdown.service'
import { UserAvatarComponent } from '../user-avatar/user-avatar'
import {
  ROLE_EMOJIS,
  ROLE_LABELS,
  totalSlots,
  type RoleKey,
} from '../../core/events/event-types'

@Component({
  selector: 'app-availability-tous-panel',
  imports: [
    MatExpansionModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    CompositionPoolPreview,
    UserAvatarComponent,
  ],
  templateUrl: './availability-tous-panel.html',
  styleUrl: './availability-tous-panel.scss',
})
export class AvailabilityTousPanel {
  private readonly chanceBreakdown = inject(ChanceBreakdownService)

  readonly summary = input.required<EventAvailabilitySummary>()
  readonly seasonId = input<string | null>(null)
  readonly eventId = input<string | null>(null)
  readonly explainabilityEnabled = input(false)
  readonly loadingChances = input(false)
  readonly chanceSource = input<ChanceSource | null>(null)
  readonly canSelectSubject = input(false)
  readonly currentUserId = input('')

  readonly participantSelected = output<SummaryParticipant>()

  protected readonly expandedRoles = signal<Set<string>>(new Set())

  constructor() {
    effect(() => {
      const roles = this.summary().roles.map((r) => r.roleKey)
      if (roles.length === 0) {
        return
      }
      if (this.expandedRoles().size === 0) {
        this.expandedRoles.set(new Set(roles))
      }
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

  protected readonly partialRoleTooltip =
    'Certains pourcentages de ce rôle sont estimés (pas capturés au tirage pour ces candidats).'

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

  protected roleHasChancePool(role: { candidates: SummaryRoleCandidate[] }): boolean {
    return role.candidates.some((candidate) => candidate.chancePercent != null)
  }

  protected poolSegments(candidates: SummaryRoleCandidate[]): CompositionPoolPreviewSegment[] {
    return candidates
      .filter((candidate) => candidate.chancePercent != null)
      .map((candidate) => ({
        participantId: candidate.participantId,
        displayName: candidate.displayName,
        chancePercent: candidate.chancePercent!,
        weight: candidate.chancePercent!,
        avatarUrl: candidate.avatarUrl ?? null,
        gender: candidate.gender ?? this.participantGender(candidate.participantId),
      }))
  }

  protected poolInteractive(): boolean {
    return this.explainabilityEnabled()
  }

  protected canOpenBreakdown(candidate: SummaryRoleCandidate): boolean {
    return (
      this.explainabilityEnabled() &&
      candidate.chancePercent != null &&
      !!this.seasonId() &&
      !!this.eventId()
    )
  }

  protected async onPoolSegmentTap(
    event: { participantId: string; chancePercent: number },
    roleKey: string,
  ): Promise<void> {
    const candidate = this.summary()
      .roles.find((role) => role.roleKey === roleKey)
      ?.candidates.find((row) => row.participantId === event.participantId)
    if (!candidate) {
      return
    }
    if (this.canOpenBreakdown(candidate)) {
      const seasonId = this.seasonId()
      const eventId = this.eventId()
      if (!seasonId || !eventId) {
        return
      }
      await this.chanceBreakdown.open({
        seasonId,
        eventId,
        roleKey,
        participantId: event.participantId,
        viewerParticipantIds: this.viewerParticipantIds(),
      })
      return
    }
    if (this.canSelectSubject()) {
      this.onParticipantClick(event.participantId)
    }
  }

  private participantGender(participantId: string) {
    return this.summary().participants.find((row) => row.participantId === participantId)?.gender
  }

  private viewerParticipantIds(): string[] {
    const userId = this.currentUserId().trim()
    if (!userId) {
      return []
    }
    return this.summary()
      .participants.filter((participant) => participant.userId === userId)
      .map((participant) => participant.participantId)
  }
}
