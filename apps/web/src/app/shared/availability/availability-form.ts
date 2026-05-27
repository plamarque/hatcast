import {
  Component,
  computed,
  effect,
  inject,
  input,
  OnDestroy,
  output,
  signal,
} from '@angular/core'
import { A11yModule } from '@angular/cdk/a11y'
import { MatButtonToggleModule } from '@angular/material/button-toggle'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatSnackBar } from '@angular/material/snack-bar'

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
  ROLE_EMOJIS,
  ROLE_LABELS,
  type RoleKey,
  type RoleSlots,
} from '../../core/events/event-types'

export const AVAILABILITY_COMMENT_MAX_LENGTH = 500

@Component({
  selector: 'app-availability-form',
  imports: [
    A11yModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './availability-form.html',
  styleUrl: './availability-form.scss',
})
export class AvailabilityForm implements OnDestroy {
  private readonly api = inject(AvailabilityApiService)
  private readonly memberProfileApi = inject(MemberProfileApiService)
  private readonly snack = inject(MatSnackBar)

  readonly seasonId = input.required<string>()
  readonly eventId = input.required<string>()
  readonly troupeId = input.required<string>()
  readonly roleSlots = input.required<RoleSlots>()
  readonly subjectDisplayName = input.required<string>()
  readonly subjectParticipantId = input<string | null>(null)
  readonly readOnly = input(false)
  readonly proxyMode = input(false)
  readonly archived = input(false)
  readonly initialStatus = input<AvailabilityStatus>('unknown')
  readonly initialRoleKeys = input<string[] | null | undefined>([])
  readonly initialComment = input<string | null | undefined>(null)

  readonly saved = output<{
    status: AvailabilityStatus
    roleKeys: string[]
    comment: string | null
  }>()

  protected readonly selected = signal<AvailabilityStatus>('unknown')
  protected readonly saving = signal(false)
  protected readonly selectedRoleKeys = signal<RoleKey[]>([])
  protected readonly commentText = signal('')
  protected readonly commentError = signal<string | null>(null)

  protected readonly roleChoices = computed(() =>
    candidateRolesForEvent(this.roleSlots()).map((key) => ({
      key,
      emoji: ROLE_EMOJIS[key],
      label: ROLE_LABELS[key],
    })),
  )
  private preferredRoleKeysPromise: Promise<string[]> | null = null
  private volunteerExplicitlyUnchecked = false
  protected volunteerMandatoryHint = false
  private skipInputEffect = false
  private commentSaveTimer: ReturnType<typeof setTimeout> | null = null

  constructor() {
    effect(() => {
      if (this.skipInputEffect) {
        this.skipInputEffect = false
        return
      }
      this.selected.set(this.initialStatus())
      this.selectedRoleKeys.set(
        normalizeCandidateRoleKeys(this.roleSlots(), this.initialRoleKeys(), false),
      )
      this.commentText.set(this.initialComment() ?? '')
      this.commentError.set(null)
    })
  }

  syncFromParent(
    status: AvailabilityStatus,
    roleKeys: string[] | null | undefined,
    comment?: string | null,
  ): void {
    if (this.saving()) return
    this.skipInputEffect = true
    this.selected.set(status)
    this.selectedRoleKeys.set(normalizeCandidateRoleKeys(this.roleSlots(), roleKeys, false))
    this.commentText.set(comment ?? '')
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
    return this.selected() === 'available' && this.roleChoices().length > 0
  }

  protected shouldShowCommentBlock(): boolean {
    return this.selected() !== 'unknown' || !!this.commentText().trim()
  }

  protected isRoleSelected(roleKey: RoleKey): boolean {
    return this.selectedRoleKeys().includes(roleKey)
  }

  protected shouldShowVolunteerMandatoryHint(): boolean {
    return this.volunteerMandatoryHint
  }

  ngOnDestroy(): void {
    if (this.commentSaveTimer) {
      clearTimeout(this.commentSaveTimer)
      this.commentSaveTimer = null
    }
  }

  protected onCommentInput(value: string): void {
    if (this.readOnly() || this.archived()) return
    this.commentText.set(value)
    this.commentError.set(null)
    this.scheduleCommentSave()
  }

  protected async onStatusChange(status: AvailabilityStatus): Promise<void> {
    if (this.saving() || this.readOnly() || this.archived()) return
    if (status === this.selected()) return
    await this.choose(status)
  }

  protected async choose(status: AvailabilityStatus): Promise<void> {
    if (this.saving() || this.readOnly() || this.archived()) return
    this.selected.set(status)
    if (status === 'available') {
      if (this.selectedRoleKeys().length === 0) {
        await this.applyPreferredPrecheck()
      }
      await this.persist(status)
    } else {
      this.volunteerExplicitlyUnchecked = false
      this.volunteerMandatoryHint = false
      this.selectedRoleKeys.set([])
      await this.persist(status)
    }
  }

  protected async toggleRole(roleKey: RoleKey, checked: boolean): Promise<void> {
    if (this.saving() || this.readOnly() || this.archived() || this.selected() !== 'available') {
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
    await this.persist('available')
  }

  private async applyPreferredPrecheck(): Promise<void> {
    if (this.roleChoices().length === 0 || this.readOnly() || this.proxyMode()) return
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

  private scheduleCommentSave(): void {
    if (this.commentSaveTimer) {
      clearTimeout(this.commentSaveTimer)
    }
    this.commentSaveTimer = setTimeout(() => {
      this.commentSaveTimer = null
      void this.persist(this.selected())
    }, 400)
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

  private async persist(status: AvailabilityStatus): Promise<void> {
    if (!this.validateCommentLocally()) {
      return
    }
    this.saving.set(true)
    const roleKeys = status === 'available' ? this.selectedRoleKeys() : []
    const body = {
      status,
      roleKeys,
      applyVolunteerRule: this.shouldApplyVolunteerRule(),
      comment: this.normalizedComment(),
    }
    const participantId = this.subjectParticipantId()
    const r =
      this.proxyMode() && participantId
        ? await this.api.setParticipantAvailability(
            this.seasonId(),
            this.eventId(),
            participantId,
            body,
          )
        : await this.api.setMyAvailability(this.seasonId(), this.eventId(), body)
    this.saving.set(false)
    if (!r.ok || !r.data) {
      if (r.status === 400) {
        this.commentError.set(
          `Le commentaire ne peut pas dépasser ${AVAILABILITY_COMMENT_MAX_LENGTH} caractères.`,
        )
        return
      }
      this.snack.open('Enregistrement impossible.', 'OK', { duration: 5000 })
      return
    }
    this.selected.set(r.data.status)
    this.selectedRoleKeys.set(
      normalizeCandidateRoleKeys(this.roleSlots(), r.data.roleKeys, false),
    )
    this.commentText.set(r.data.comment ?? '')
    this.saved.emit({
      status: r.data.status,
      roleKeys: r.data.roleKeys,
      comment: r.data.comment ?? null,
    })
  }

  currentState(): { status: AvailabilityStatus; roleKeys: string[]; comment: string | null } {
    return {
      status: this.selected(),
      roleKeys: this.selectedRoleKeys(),
      comment: this.normalizedComment(),
    }
  }
}
