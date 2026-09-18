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
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatButtonToggleModule } from '@angular/material/button-toggle'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatIconModule } from '@angular/material/icon'
import { MatSnackBar } from '@angular/material/snack-bar'

import { ProductAnalyticsService } from '../../core/analytics/product-analytics.service'
import { AvailabilityApiService } from '../../core/availability/availability-api.service'
import type { AvailabilityStatus } from '../../core/availability/availability-status'
import {
  candidateRolesForEvent,
  normalizeCandidateRoleKeys,
} from '../../core/availability/availability-role-rules'
import {
  effectiveMemberGender,
  type MemberGender,
} from '../../core/account/member-gender'
import { type RoleKey, type RoleSlots } from '../../core/events/event-types'
import { getRoleLabel } from '../event-roles/event-roles'

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
    MatCheckboxModule,
    MatIconModule,
  ],
  templateUrl: './availability-form.html',
  styleUrl: './availability-form.scss',
})
export class AvailabilityForm {
  private readonly api = inject(AvailabilityApiService)
  private readonly analytics = inject(ProductAnalyticsService)
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
  readonly externalSubmit = input(false)
  readonly initialStatus = input<AvailabilityStatus>('unknown')
  readonly initialRoleKeys = input<string[] | null | undefined>([])
  readonly initialComment = input<string | null | undefined>(null)
  /** ISO timestamp when the availability window was opened (FR47). */
  readonly availabilityOpenedAt = input<string | null>(null)

  readonly saved = output<AvailabilityFormSavedPayload>()

  protected readonly selected = signal<AvailabilityStatus>('unknown')
  readonly saving = signal(false)
  readonly error = signal<string | null>(null)
  private readonly savedStatus = signal<AvailabilityStatus>('unknown')
  protected readonly selectedRoleKeys = signal<RoleKey[]>([])
  protected readonly savedRoleKeys = signal<RoleKey[]>([])
  protected readonly commentText = signal('')
  protected readonly savedComment = signal('')
  protected readonly commentError = signal<string | null>(null)

  readonly validationMessage = computed(() => this.commentError() ?? this.error())

  readonly detailsDirty = computed(() => {
    if (this.selected() !== this.savedStatus()) return true
    if (!roleKeysEqual(this.selectedRoleKeys(), this.savedRoleKeys())) {
      return true
    }
    return this.commentText().trim() !== this.savedComment().trim()
  })

  protected readonly roleChoiceKeys = computed(() => candidateRolesForEvent(this.roleSlots()))
  protected readonly volunteerHelpOpen = signal(false)
  private skipInputEffect = false

  constructor() {
    effect(() => {
      const roles = normalizeCandidateRoleKeys(this.roleSlots(), this.initialRoleKeys(), false)
      const comment = this.initialComment() ?? ''
      const status = this.initialStatus()
      if (this.skipInputEffect) {
        this.skipInputEffect = false
        return
      }
      this.selected.set(status)
      this.savedStatus.set(status)
      this.selectedRoleKeys.set(this.draftRoles(status, roles))
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
    if (this.saving()) return
    const roles = normalizeCandidateRoleKeys(this.roleSlots(), roleKeys, false)
    const commentValue = comment ?? ''
    const preserveDraft = this.detailsDirty()
    this.skipInputEffect = true
    this.savedStatus.set(status)
    if (!preserveDraft) this.selected.set(status)
    this.savedRoleKeys.set(roles)
    this.savedComment.set(commentValue)
    if (!preserveDraft) {
      this.selectedRoleKeys.set(this.draftRoles(status, roles))
      this.commentText.set(commentValue)
    }
    this.commentError.set(null)
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

  protected onCommentInput(value: string): void {
    if (this.readOnly() || this.archived()) return
    this.commentText.set(value)
    this.commentError.set(null)
  }

  protected onStatusClick(status: AvailabilityStatus): void {
    if (this.saving() || this.readOnly() || this.archived()) return
    if (status === this.selected()) return
    void this.choose(status)
  }

  protected async choose(status: AvailabilityStatus): Promise<void> {
    if (this.saving() || this.readOnly() || this.archived()) return
    this.selected.set(status)
    if (status === 'available') this.selectedRoleKeys.set(normalizeCandidateRoleKeys(this.roleSlots(), this.selectedRoleKeys()))
    this.error.set(null)
  }

  protected roleLabel(key: RoleKey): string {
    return getRoleLabel(key, this.roleSelectionGender())
  }

  protected toggleRole(roleKey: RoleKey, checked: boolean): void {
    if (this.saving() || this.readOnly() || this.archived() || this.selected() !== 'available') {
      return
    }
    if (roleKey === 'volunteer' && !checked) return
    const current = this.selectedRoleKeys()
    const next = checked ? [...current, roleKey] : current.filter(key => key !== roleKey)
    this.selectedRoleKeys.set(normalizeCandidateRoleKeys(this.roleSlots(), next))
    this.error.set(null)
  }

  async submit(): Promise<void> {
    if (this.saving() || this.readOnly() || this.archived()) return
    this.error.set(null)
    if (this.selected() === 'available' && this.roleChoiceKeys().length > 0 && this.selectedRoleKeys().length === 0) {
      this.error.set('Choisis au moins un rôle pour enregistrer ta disponibilité.')
      return
    }
    await this.persistDetails(this.selected())
  }

  protected shouldShowDetailsSave(): boolean {
    return !this.externalSubmit() && !this.readOnly() && !this.archived()
  }

  private draftRoles(status: AvailabilityStatus, roles: RoleKey[]): RoleKey[] {
    return status === 'available' && !this.readOnly() && !this.archived()
      ? normalizeCandidateRoleKeys(this.roleSlots(), roles)
      : roles
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

  private async persistDetails(status: AvailabilityStatus): Promise<void> {
    const wasFirstSubmission = this.savedStatus() === 'unknown' && status !== 'unknown'
    if (!this.validateCommentLocally()) {
      return
    }
    this.saving.set(true)
    const roleKeys = status === 'available' ? this.selectedRoleKeys() : []
    const body = {
      status,
      roleKeys,
      applyVolunteerRule: true,
      comment: this.normalizedComment(),
    }
    let r
    try {
      r = await this.putAvailability(body)
    } catch {
      this.handlePersistError(0)
      return
    } finally {
      this.saving.set(false)
    }
    if (!r.ok || !r.data) {
      this.handlePersistError(r.status)
      return
    }
    this.applyServerResponse(r.data)
    this.trackAvailabilityFirstSubmissionIfNeeded(wasFirstSubmission)
    this.snack.open('Disponibilité enregistrée.', 'OK', { duration: 3000 })
    this.saved.emit({
      status: r.data.status,
      roleKeys: r.data.roleKeys,
      comment: r.data.comment ?? null,
      scope: 'details',
    })
  }

  private applyServerResponse(
    data: { status: AvailabilityStatus; roleKeys: string[]; comment?: string | null },
  ): void {
    const serverRoles = normalizeCandidateRoleKeys(this.roleSlots(), data.roleKeys, false)
    const serverComment = data.comment ?? ''
    this.selected.set(data.status)
    this.savedStatus.set(data.status)
    this.savedRoleKeys.set(serverRoles)
    this.savedComment.set(serverComment)
    this.selectedRoleKeys.set(serverRoles)
    this.commentText.set(serverComment)
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
    this.error.set(status === 400
      ? 'Réponse invalide. Vérifie les rôles et le commentaire.'
      : 'Enregistrement impossible. Réessaie en conservant tes modifications.')
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
