import {
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core'
import { A11yModule } from '@angular/cdk/a11y'
import { MatButtonModule } from '@angular/material/button'
import { MatButtonToggleModule } from '@angular/material/button-toggle'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatSnackBar } from '@angular/material/snack-bar'

import { ProductAnalyticsService } from '../../core/analytics/product-analytics.service'
import { AvailabilityApiService } from '../../core/availability/availability-api.service'
import type { AvailabilityStatus } from '../../core/availability/availability-status'
import {
  candidateRolesForEvent,
  mandatoryVolunteerCoverage,
  normalizeCandidateRoleKeys,
  preferredRoleIntersection,
} from '../../core/availability/availability-role-rules'
import { MemberProfileApiService } from '../../core/member-profile/member-profile-api.service'
import {
  effectiveMemberGender,
  type MemberGender,
} from '../../core/account/member-gender'
import { type RoleKey, type RoleSlots } from '../../core/events/event-types'
import { RoleToggleChipSet } from '../event-roles/role-toggle-chip-set/role-toggle-chip-set'

export const AVAILABILITY_COMMENT_MAX_LENGTH = 500

export type AvailabilityFormSavedPayload = {
  status: AvailabilityStatus
  roleKeys: string[]
  comment: string | null
  scope: 'status' | 'details'
}

@Component({
  selector: 'app-availability-form',
  imports: [
    A11yModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatInputModule,
    RoleToggleChipSet,
  ],
  templateUrl: './availability-form.html',
  styleUrl: './availability-form.scss',
})
export class AvailabilityForm {
  private readonly api = inject(AvailabilityApiService)
  private readonly analytics = inject(ProductAnalyticsService)
  private readonly memberProfileApi = inject(MemberProfileApiService)
  private readonly snack = inject(MatSnackBar)

  readonly seasonId = input.required<string>()
  readonly eventId = input.required<string>()
  readonly troupeId = input.required<string>()
  readonly roleSlots = input.required<RoleSlots>()
  readonly subjectDisplayName = input.required<string>()
  readonly subjectParticipantId = input<string | null>(null)
  readonly subjectGender = input<MemberGender | unknown>('non_specified')
  readonly readOnly = input(false)
  readonly proxyMode = input(false)
  readonly archived = input(false)
  readonly initialStatus = input<AvailabilityStatus>('unknown')
  readonly initialRoleKeys = input<string[] | null | undefined>([])
  readonly initialComment = input<string | null | undefined>(null)
  /** ISO timestamp when the availability window was opened (FR47). */
  readonly availabilityOpenedAt = input<string | null>(null)

  readonly saved = output<AvailabilityFormSavedPayload>()

  protected readonly selected = signal<AvailabilityStatus>('unknown')
  protected readonly savingStatus = signal(false)
  protected readonly savingDetails = signal(false)
  protected readonly selectedRoleKeys = signal<RoleKey[]>([])
  protected readonly savedRoleKeys = signal<RoleKey[]>([])
  protected readonly commentText = signal('')
  protected readonly savedComment = signal('')
  protected readonly commentError = signal<string | null>(null)

  protected readonly detailsDirty = computed(() => {
    if (!roleKeysEqual(this.selectedRoleKeys(), this.savedRoleKeys())) {
      return true
    }
    return this.commentText().trim() !== this.savedComment().trim()
  })

  protected readonly roleChoiceKeys = computed(() => candidateRolesForEvent(this.roleSlots()))
  private preferredRoleKeysPromise: Promise<string[]> | null = null
  private volunteerExplicitlyUnchecked = false
  protected volunteerMandatoryHint = false
  private skipInputEffect = false

  constructor() {
    effect(() => {
      if (this.skipInputEffect) {
        this.skipInputEffect = false
        return
      }
      const roles = normalizeCandidateRoleKeys(this.roleSlots(), this.initialRoleKeys(), false)
      const comment = this.initialComment() ?? ''
      this.selected.set(this.initialStatus())
      this.selectedRoleKeys.set(roles)
      this.savedRoleKeys.set(roles)
      this.commentText.set(comment)
      this.savedComment.set(comment)
      this.commentError.set(null)
    })
  }

  syncFromParent(
    status: AvailabilityStatus,
    roleKeys: string[] | null | undefined,
    comment?: string | null,
  ): void {
    if (this.savingStatus() || this.savingDetails()) return
    const roles = normalizeCandidateRoleKeys(this.roleSlots(), roleKeys, false)
    const commentValue = comment ?? ''
    const preserveDraft = this.detailsDirty()
    this.skipInputEffect = true
    this.selected.set(status)
    this.savedRoleKeys.set(roles)
    this.savedComment.set(commentValue)
    if (!preserveDraft) {
      this.selectedRoleKeys.set(roles)
      this.commentText.set(commentValue)
    }
    this.commentError.set(null)
  }

  protected isSelected(status: AvailabilityStatus): boolean {
    return this.selected() === status
  }

  protected feedbackText(): string | null {
    const s = this.selected()
    const name = this.subjectDisplayName()
    const thirdPerson = this.readOnly() || this.proxyMode()
    if (s === 'unknown') {
      return thirdPerson
        ? `${name} n'a pas renseigné de dispo.`
        : 'Tu n\'as pas renseigné de dispo.'
    }
    if (s === 'unavailable') {
      return thirdPerson
        ? `${name} n'est pas disponible pour cet événement.`
        : 'Tu n\'es pas disponible pour cet événement.'
    }
    return null
  }

  protected shouldShowRoleBlock(): boolean {
    return this.selected() === 'available' && this.roleChoiceKeys().length > 0
  }

  protected roleSelectionGender(): MemberGender {
    return effectiveMemberGender(this.subjectGender())
  }

  protected shouldShowCommentBlock(): boolean {
    return this.selected() !== 'unknown' || !!this.commentText().trim()
  }

  protected shouldShowVolunteerMandatoryHint(): boolean {
    return this.volunteerMandatoryHint
  }

  protected onCommentInput(value: string): void {
    if (this.readOnly() || this.archived()) return
    this.commentText.set(value)
    this.commentError.set(null)
  }

  protected onStatusClick(status: AvailabilityStatus): void {
    if (this.savingStatus() || this.readOnly() || this.archived()) return
    if (status === this.selected()) return
    void this.choose(status)
  }

  protected async choose(status: AvailabilityStatus): Promise<void> {
    if (this.savingStatus() || this.readOnly() || this.archived()) return
    this.selected.set(status)
    if (status === 'available') {
      if (this.selectedRoleKeys().length === 0 && this.savedRoleKeys().length === 0) {
        await this.applyPreferredPrecheck()
      }
      await this.persistStatus(status)
    } else {
      this.volunteerExplicitlyUnchecked = false
      this.volunteerMandatoryHint = false
      this.selectedRoleKeys.set([])
      await this.persistStatus(status)
    }
  }

  protected toggleRole(roleKey: RoleKey, checked: boolean): void {
    if (this.savingDetails() || this.readOnly() || this.archived() || this.selected() !== 'available') {
      return
    }
    const current = this.selectedRoleKeys()
    let next = checked ? [...current, roleKey] : current.filter((key) => key !== roleKey)
    if (roleKey === 'volunteer') {
      this.volunteerExplicitlyUnchecked = !checked
      this.volunteerMandatoryHint = false
    }
    if (roleKey === 'player' && checked) {
      this.volunteerExplicitlyUnchecked = false
    }
    const hadVolunteer = current.includes('volunteer')
    next = normalizeCandidateRoleKeys(
      this.roleSlots(),
      next,
      this.shouldApplyVolunteerRule(next),
    )
    if (roleKey === 'player' && checked && !hadVolunteer && next.includes('volunteer')) {
      this.volunteerMandatoryHint = true
    }
    if (!next.includes('player')) {
      this.volunteerMandatoryHint = false
    }
    this.selectedRoleKeys.set(next)
  }

  protected async saveDetails(): Promise<void> {
    if (
      this.savingDetails() ||
      this.savingStatus() ||
      this.readOnly() ||
      this.archived() ||
      !this.detailsDirty()
    ) {
      return
    }
    await this.persistDetails(this.selected())
  }

  protected shouldShowDetailsSave(): boolean {
    return !this.readOnly() && !this.archived() && this.selected() !== 'unknown'
  }

  private async applyPreferredPrecheck(): Promise<void> {
    if (this.roleChoiceKeys().length === 0 || this.readOnly() || this.proxyMode()) return
    const preferred = await this.loadPreferredRoleKeys()
    this.selectedRoleKeys.set(preferredRoleIntersection(this.roleSlots(), preferred))
    this.volunteerExplicitlyUnchecked = false
    const keys = this.selectedRoleKeys()
    this.volunteerMandatoryHint =
      keys.includes('player') &&
      keys.includes('volunteer') &&
      mandatoryVolunteerCoverage(this.roleSlots())
  }

  private async loadPreferredRoleKeys(): Promise<string[]> {
    if (!this.preferredRoleKeysPromise) {
      this.preferredRoleKeysPromise = this.memberProfileApi
        .getPreferredRoles(this.troupeId())
        .then((r) => (r.ok && r.data ? r.data.preferredRoleKeys : []))
    }
    return this.preferredRoleKeysPromise
  }

  private shouldApplyVolunteerRule(roleKeys = this.selectedRoleKeys()): boolean {
    return !(
      this.volunteerExplicitlyUnchecked &&
      roleKeys.includes('player') &&
      !roleKeys.includes('volunteer')
    )
  }

  private normalizedComment(): string | null {
    const trimmed = this.commentText().trim()
    return trimmed.length > 0 ? trimmed : null
  }

  private validateCommentLocally(): boolean {
    if (this.commentText().length > AVAILABILITY_COMMENT_MAX_LENGTH) {
      this.commentError.set(
        `Le commentaire ne peut pas dépasser ${AVAILABILITY_COMMENT_MAX_LENGTH} caractères.`,
      )
      return false
    }
    this.commentError.set(null)
    return true
  }

  private roleKeysForStatusSave(status: AvailabilityStatus): RoleKey[] {
    if (status !== 'available') {
      return []
    }
    return this.savedRoleKeys()
  }

  private commentForStatusSave(): string | null {
    const trimmed = this.savedComment().trim()
    return trimmed.length > 0 ? trimmed : null
  }

  private async persistStatus(status: AvailabilityStatus): Promise<void> {
    const wasFirstSubmission = this.initialStatus() === 'unknown'
    this.savingStatus.set(true)
    const body = {
      status,
      roleKeys: this.roleKeysForStatusSave(status),
      applyVolunteerRule: this.shouldApplyVolunteerRule(this.roleKeysForStatusSave(status)),
      comment: this.commentForStatusSave(),
    }
    const r = await this.putAvailability(body)
    this.savingStatus.set(false)
    if (!r.ok || !r.data) {
      this.handlePersistError(r.status)
      return
    }
    this.applyServerResponse(r.data, 'status')
    this.trackAvailabilityFirstSubmissionIfNeeded(wasFirstSubmission)
    this.saved.emit({
      status: r.data.status,
      roleKeys: r.data.roleKeys,
      comment: r.data.comment ?? null,
      scope: 'status',
    })
  }

  private async persistDetails(status: AvailabilityStatus): Promise<void> {
    const wasFirstSubmission = this.initialStatus() === 'unknown'
    if (!this.validateCommentLocally()) {
      return
    }
    this.savingDetails.set(true)
    const roleKeys = status === 'available' ? this.selectedRoleKeys() : []
    const body = {
      status,
      roleKeys,
      applyVolunteerRule: this.shouldApplyVolunteerRule(roleKeys),
      comment: this.normalizedComment(),
    }
    const r = await this.putAvailability(body)
    this.savingDetails.set(false)
    if (!r.ok || !r.data) {
      this.handlePersistError(r.status)
      return
    }
    this.applyServerResponse(r.data, 'details')
    this.trackAvailabilityFirstSubmissionIfNeeded(wasFirstSubmission)
    this.snack.open('Rôles et commentaire enregistrés.', 'OK', { duration: 3000 })
    this.saved.emit({
      status: r.data.status,
      roleKeys: r.data.roleKeys,
      comment: r.data.comment ?? null,
      scope: 'details',
    })
  }

  private applyServerResponse(
    data: { status: AvailabilityStatus; roleKeys: string[]; comment?: string | null },
    scope: 'status' | 'details',
  ): void {
    const preserveDraft = scope === 'status' && this.detailsDirty()
    const serverRoles = normalizeCandidateRoleKeys(this.roleSlots(), data.roleKeys, false)
    const serverComment = data.comment ?? ''
    this.selected.set(data.status)
    this.savedRoleKeys.set(serverRoles)
    this.savedComment.set(serverComment)
    if (!preserveDraft) {
      this.selectedRoleKeys.set(serverRoles)
      this.commentText.set(serverComment)
    }
  }

  private trackAvailabilityFirstSubmissionIfNeeded(wasFirstSubmission: boolean): void {
    const openedAt = this.availabilityOpenedAt()?.trim()
    if (!wasFirstSubmission || !openedAt) {
      return
    }
    this.analytics.captureAvailabilityFirstSubmission(
      this.analytics.eventContext(this.eventId(), this.seasonId(), this.troupeId()),
      {
        is_proxy: this.proxyMode(),
        opened_at: openedAt,
        submitted_at: new Date().toISOString(),
      },
    )
  }

  private handlePersistError(status: number): void {
    if (status === 400) {
      this.commentError.set(
        `Le commentaire ne peut pas dépasser ${AVAILABILITY_COMMENT_MAX_LENGTH} caractères.`,
      )
      return
    }
    this.snack.open('Enregistrement impossible.', 'OK', { duration: 5000 })
  }

  private async putAvailability(body: {
    status: AvailabilityStatus
    roleKeys: RoleKey[]
    applyVolunteerRule: boolean
    comment: string | null
  }) {
    const participantId = this.subjectParticipantId()
    return this.proxyMode() && participantId
      ? await this.api.setParticipantAvailability(
          this.seasonId(),
          this.eventId(),
          participantId,
          body,
        )
      : await this.api.setMyAvailability(this.seasonId(), this.eventId(), body)
  }

  currentState(): { status: AvailabilityStatus; roleKeys: string[]; comment: string | null } {
    return {
      status: this.selected(),
      roleKeys: this.selectedRoleKeys(),
      comment: this.normalizedComment(),
    }
  }
}

function roleKeysEqual(a: RoleKey[], b: RoleKey[]): boolean {
  if (a.length !== b.length) return false
  const sortedA = [...a].sort()
  const sortedB = [...b].sort()
  return sortedA.every((key, index) => key === sortedB[index])
}
