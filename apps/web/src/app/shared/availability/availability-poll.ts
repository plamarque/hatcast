import {
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatSnackBar } from '@angular/material/snack-bar'

import type { CompositionPoolPreviewSegment } from '../../core/composition/composition-api.service'
import {
  AvailabilityApiService,
  type EventAvailabilitySummary,
  type SummaryParticipant,
  type SummaryRoleCandidate,
} from '../../core/availability/availability-api.service'
import {
  candidateRolesForEvent,
  mandatoryVolunteerCoverage,
} from '../../core/availability/availability-role-rules'
import {
  effectiveMemberGender,
  type MemberGender,
} from '../../core/account/member-gender'
import {
  ROLE_EMOJIS,
  totalSlots,
  type RoleKey,
  type RoleSlots,
} from '../../core/events/event-types'
import { getRoleLabel, roleEmoji } from '../event-roles/event-roles'
import { ChanceBreakdownService } from '../composition/chance-breakdown.service'
import {
  AVAILABILITY_COMMENT_MAX_LENGTH,
  AvailabilityPersistService,
} from './availability-persist.service'
import { AvailabilityPollRow } from './availability-poll-row'
import {
  checkedRoleKeysFromSubject,
  computeVoteFromChecks,
  flatAvailableCount,
  flatUnavailableCount,
  isRoleChecked,
  isSubjectAvailableFlat,
  isSubjectUnavailable,
  patchSummaryOptimistic,
  roleGaugeFillPercent,
  toggleRoleCheck,
} from './availability-vote.utils'

export type AvailabilityPollSavedPayload = {
  status: 'available' | 'unavailable' | 'unknown'
  roleKeys: string[]
  comment: string | null
  scope: 'status' | 'details'
}

@Component({
  selector: 'app-availability-poll',
  imports: [
    AvailabilityPollRow,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  templateUrl: './availability-poll.html',
  styleUrl: './availability-poll.scss',
})
export class AvailabilityPoll {
  private readonly api = inject(AvailabilityApiService)
  private readonly persist = inject(AvailabilityPersistService)
  private readonly chanceBreakdown = inject(ChanceBreakdownService)
  private readonly snack = inject(MatSnackBar)

  readonly seasonId = input.required<string>()
  readonly eventId = input.required<string>()
  readonly troupeId = input.required<string>()
  readonly roleSlots = input.required<RoleSlots>()
  readonly summary = input.required<EventAvailabilitySummary>()
  readonly subject = input.required<SummaryParticipant>()
  readonly readOnly = input(false)
  readonly proxyMode = input(false)
  readonly archived = input(false)
  readonly explainabilityEnabled = input(false)
  readonly currentUserId = input('')
  readonly availabilityOpenedAt = input<string | null>(null)

  readonly summaryPatch = output<EventAvailabilitySummary>()
  readonly saved = output<AvailabilityPollSavedPayload>()

  protected readonly expandedRowKey = signal<string | null>(null)
  protected readonly savingRowKey = signal<string | null>(null)
  protected readonly loadingChances = signal(false)
  protected readonly commentText = signal('')
  protected readonly savedComment = signal('')
  protected readonly commentError = signal<string | null>(null)
  protected readonly savingComment = signal(false)
  protected readonly summaryIncludesChances = signal(false)

  private readonly initialStatus = signal<'available' | 'unavailable' | 'unknown'>('unknown')
  private volunteerExplicitlyUnchecked = false
  private chancesLoadGeneration = 0

  protected readonly hasRoles = computed(() => totalSlots(this.roleSlots()) > 0)

  protected readonly roleRows = computed(() => {
    const summary = this.summary()
    return summary.roles.filter((role) => role.requiredCount > 0)
  })

  protected readonly subjectGender = computed((): MemberGender =>
    effectiveMemberGender(this.subject().gender),
  )

  protected readonly rolesDisabled = computed(() => this.readOnly() || this.archived())

  protected readonly commentDirty = computed(
    () => this.commentText().trim() !== this.savedComment().trim(),
  )

  protected readonly showCommentBlock = computed(() => {
    const subject = this.subject()
    return subject.status !== 'unknown' || !!this.commentText().trim()
  })

  protected readonly canEdit = computed(() => !this.readOnly() && !this.archived())

  constructor() {
    effect(() => {
      const subject = this.subject()
      this.commentText.set(subject.comment ?? '')
      this.savedComment.set(subject.comment ?? '')
      this.commentError.set(null)
      this.initialStatus.set(subject.status)
      this.volunteerExplicitlyUnchecked = false
    })
  }

  protected unavailableCount(): number {
    return flatUnavailableCount(this.summary().participants)
  }

  protected unavailableFillPercent(): number {
    const total = this.summary().participants.length
    return roleGaugeFillPercent(this.unavailableCount(), total)
  }

  protected flatAvailableCountValue(): number {
    return flatAvailableCount(this.summary().participants)
  }

  protected flatAvailableFillPercent(): number {
    const total = this.summary().participants.length
    return roleGaugeFillPercent(this.flatAvailableCountValue(), total)
  }

  protected unavailableAvatars(): SummaryRoleCandidate[] {
    return this.summary()
      .participants.filter((p) => p.status === 'unavailable')
      .map((p) => ({
        participantId: p.participantId,
        displayName: p.displayName,
        avatarUrl: p.avatarUrl ?? null,
        gender: p.gender,
      }))
  }

  protected flatAvailableAvatars(): SummaryRoleCandidate[] {
    return this.summary()
      .participants.filter((p) => p.status === 'available')
      .map((p) => ({
        participantId: p.participantId,
        displayName: p.displayName,
        avatarUrl: p.avatarUrl ?? null,
        gender: p.gender,
      }))
  }

  protected roleLabel(roleKey: string): string {
    return getRoleLabel(roleKey as RoleKey, this.subjectGender())
  }

  protected roleEmojiFor(roleKey: string): string {
    return ROLE_EMOJIS[roleKey as RoleKey] ?? roleEmoji(roleKey as RoleKey)
  }

  protected isUnavailableChecked(): boolean {
    return isSubjectUnavailable(this.subject())
  }

  protected isAvailableFlatChecked(): boolean {
    return isSubjectAvailableFlat(this.subject())
  }

  protected isRoleRowChecked(roleKey: string): boolean {
    return isRoleChecked(this.roleSlots(), this.subject(), roleKey as RoleKey)
  }

  protected roleFillPercent(roleKey: string): number {
    const role = this.summary().roles.find((r) => r.roleKey === roleKey)
    if (!role) return 0
    return roleGaugeFillPercent(role.candidates.length, role.requiredCount)
  }

  protected roleCounterText(roleKey: string): string {
    const role = this.summary().roles.find((r) => r.roleKey === roleKey)
    if (!role) return '0/0'
    return `${role.candidates.length}/${role.requiredCount}`
  }

  protected roleAvatars(roleKey: string): SummaryRoleCandidate[] {
    return this.summary().roles.find((r) => r.roleKey === roleKey)?.candidates ?? []
  }

  protected isRowExpanded(rowKey: string): boolean {
    return this.expandedRowKey() === rowKey
  }

  protected isRowSaving(rowKey: string): boolean {
    return this.savingRowKey() === rowKey
  }

  protected chanceSourceHint(): string | null {
    const source = this.summary().chanceSource
    if (source === 'estimated') {
      return 'Pourcentages au moment du tirage estimés.'
    }
    if (source === 'snapshot') {
      return 'Pourcentages capturés au moment du tirage.'
    }
    return null
  }

  protected poolSegments(roleKey: string): CompositionPoolPreviewSegment[] {
    return this.candidatesToPoolSegments(this.roleAvatars(roleKey))
  }

  protected unavailablePoolSegments(): CompositionPoolPreviewSegment[] {
    return this.candidatesToPoolSegments(this.unavailableAvatars())
  }

  protected flatAvailablePoolSegments(): CompositionPoolPreviewSegment[] {
    return this.candidatesToPoolSegments(this.flatAvailableAvatars())
  }

  protected poolInteractive(roleKey: string): boolean {
    return this.explainabilityEnabled() && this.roleAvatars(roleKey).length > 0
  }

  private candidatesToPoolSegments(
    candidates: SummaryRoleCandidate[],
  ): CompositionPoolPreviewSegment[] {
    if (candidates.length === 0) {
      return []
    }
    return candidates.map((candidate) => ({
      participantId: candidate.participantId,
      displayName: candidate.displayName,
      chancePercent: candidate.chancePercent ?? 0,
      weight: candidate.chancePercent ?? 1,
      avatarUrl: candidate.avatarUrl ?? null,
      gender: candidate.gender ?? this.participantGender(candidate.participantId),
    }))
  }

  protected async onUnavailableToggle(checked: boolean): Promise<void> {
    if (!this.canEdit()) return
    const currentRoles = checkedRoleKeysFromSubject(this.roleSlots(), this.subject())
    const vote = computeVoteFromChecks({
      hasRoles: this.hasRoles(),
      unavailableChecked: checked,
      availableChecked: false,
      checkedRoleKeys: checked ? [] : currentRoles,
    })
    await this.persistVote('unavailable', vote.status, vote.roleKeys)
  }

  protected async onAvailableFlatToggle(checked: boolean): Promise<void> {
    if (!this.canEdit()) return
    const vote = computeVoteFromChecks({
      hasRoles: false,
      unavailableChecked: false,
      availableChecked: checked,
      checkedRoleKeys: [],
    })
    await this.persistVote('available-flat', vote.status, vote.roleKeys)
  }

  protected async onRoleToggle(roleKey: string, checked: boolean): Promise<void> {
    if (!this.canEdit() || this.rolesDisabled()) return

    let currentKeys = checkedRoleKeysFromSubject(this.roleSlots(), this.subject())

    const hadVolunteer = currentKeys.includes('volunteer')
    if (roleKey === 'volunteer' && !checked) {
      this.volunteerExplicitlyUnchecked = true
    }
    if (roleKey === 'player' && checked) {
      this.volunteerExplicitlyUnchecked = false
    }

    const nextKeys = toggleRoleCheck(
      this.roleSlots(),
      currentKeys,
      roleKey as RoleKey,
      checked,
      this.shouldApplyVolunteerRule(currentKeys),
    )

    if (
      roleKey === 'player' &&
      checked &&
      !hadVolunteer &&
      nextKeys.includes('volunteer') &&
      mandatoryVolunteerCoverage(this.roleSlots())
    ) {
      this.snack.open('Bénévole ajouté (obligatoire sur ce format)', 'OK', { duration: 3000 })
    }

    const vote = computeVoteFromChecks({
      hasRoles: true,
      unavailableChecked: false,
      availableChecked: false,
      checkedRoleKeys: nextKeys,
    })
    await this.persistVote(`role:${roleKey}`, vote.status, vote.roleKeys)
  }

  protected async onPoolTrigger(rowKey: string): Promise<void> {
    const next = this.expandedRowKey() === rowKey ? null : rowKey
    this.expandedRowKey.set(next)
    if (
      next?.startsWith('role:') &&
      this.explainabilityEnabled() &&
      !this.summaryIncludesChances()
    ) {
      await this.ensureChancesLoaded()
    }
  }

  protected async onPoolSegmentTap(
    event: { participantId: string; chancePercent: number },
    roleKey: string,
  ): Promise<void> {
    const candidate = this.summary()
      .roles.find((role) => role.roleKey === roleKey)
      ?.candidates.find((row) => row.participantId === event.participantId)
    if (!candidate || candidate.chancePercent == null) {
      return
    }
    await this.chanceBreakdown.open({
      seasonId: this.seasonId(),
      eventId: this.eventId(),
      roleKey,
      participantId: event.participantId,
      viewerParticipantIds: this.viewerParticipantIds(),
    })
  }

  protected onCommentInput(value: string): void {
    if (!this.canEdit()) return
    this.commentText.set(value)
    this.commentError.set(null)
  }

  protected async saveComment(): Promise<void> {
    if (!this.canEdit() || !this.commentDirty() || this.savingComment()) {
      return
    }
    if (this.commentText().length > AVAILABILITY_COMMENT_MAX_LENGTH) {
      this.commentError.set(
        `Le commentaire ne peut pas dépasser ${AVAILABILITY_COMMENT_MAX_LENGTH} caractères.`,
      )
      return
    }

    const subject = this.subject()
    const roleKeys = checkedRoleKeysFromSubject(this.roleSlots(), subject)
    this.savingComment.set(true)
    const result = await this.persist.saveCommentOnly({
      seasonId: this.seasonId(),
      eventId: this.eventId(),
      subjectParticipantId: subject.participantId,
      proxyMode: this.proxyMode(),
      status: subject.status,
      roleKeys,
      applyVolunteerRule: this.shouldApplyVolunteerRule(roleKeys),
      comment: this.commentText().trim() ? this.commentText().trim() : null,
    })
    this.savingComment.set(false)

    if (!result.ok || !result.data) {
      if (result.status === 400) {
        this.commentError.set(
          `Le commentaire ne peut pas dépasser ${AVAILABILITY_COMMENT_MAX_LENGTH} caractères.`,
        )
      }
      return
    }

    const comment = result.data.comment ?? null
    this.savedComment.set(comment ?? '')
    this.commentText.set(comment ?? '')
    this.saved.emit({
      status: result.data.status,
      roleKeys: result.data.roleKeys,
      comment,
      scope: 'details',
    })
  }

  private async persistVote(
    rowKey: string,
    status: 'available' | 'unavailable' | 'unknown',
    roleKeys: RoleKey[],
  ): Promise<void> {
    const subject = this.subject()
    const previousSummary = this.summary()
    const optimistic = patchSummaryOptimistic(
      previousSummary,
      subject.participantId,
      status,
      roleKeys,
    )
    this.summaryPatch.emit(optimistic)
    this.savingRowKey.set(rowKey)

    const result = await this.persist.saveVote({
      seasonId: this.seasonId(),
      eventId: this.eventId(),
      troupeId: this.troupeId(),
      roleSlots: this.roleSlots(),
      subjectParticipantId: subject.participantId,
      proxyMode: this.proxyMode(),
      status,
      roleKeys,
      applyVolunteerRule: this.shouldApplyVolunteerRule(roleKeys),
      savedComment: this.savedComment(),
      initialStatus: this.initialStatus(),
      availabilityOpenedAt: this.availabilityOpenedAt(),
    })

    this.savingRowKey.set(null)

    if (!result.ok || !result.data) {
      this.summaryPatch.emit(previousSummary)
      return
    }

    const savedRoleKeys = this.persist.normalizeSavedRoleKeys(this.roleSlots(), result.data.roleKeys)
    this.saved.emit({
      status: result.data.status,
      roleKeys: savedRoleKeys,
      comment: result.data.comment ?? null,
      scope: 'status',
    })
  }

  private shouldApplyVolunteerRule(roleKeys: RoleKey[]): boolean {
    return !(
      this.volunteerExplicitlyUnchecked &&
      roleKeys.includes('player') &&
      !roleKeys.includes('volunteer')
    )
  }

  private async ensureChancesLoaded(): Promise<void> {
    this.loadingChances.set(true)
    const generation = ++this.chancesLoadGeneration
    try {
      const result = await this.api.getEventAvailabilitySummary(
        this.seasonId(),
        this.eventId(),
        true,
      )
      if (generation !== this.chancesLoadGeneration) {
        return
      }
      if (!result.ok || !result.data) {
        this.snack.open('Impossible de charger les pourcentages.', 'OK', { duration: 6000 })
        return
      }
      this.summaryIncludesChances.set(true)
      this.summaryPatch.emit(result.data)
    } finally {
      if (generation === this.chancesLoadGeneration) {
        this.loadingChances.set(false)
      }
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

  protected roleChoiceKeys(): RoleKey[] {
    return candidateRolesForEvent(this.roleSlots())
  }
}
