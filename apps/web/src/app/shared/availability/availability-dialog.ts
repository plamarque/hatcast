import { Component, inject, signal } from '@angular/core'
import { A11yModule } from '@angular/cdk/a11y'
import { MatButtonModule } from '@angular/material/button'
import { MatCheckboxModule } from '@angular/material/checkbox'
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'

import {
  AvailabilityApiService,
} from '../../core/availability/availability-api.service'
import {
  type AvailabilityStatus,
} from '../../core/availability/availability-status'
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
import { AGENDA_TIME_ZONE } from '../../pages/season-home/season-events.utils'

export interface AvailabilityDialogData {
  seasonId: string
  eventId: string
  eventTitle: string
  eventStartsAt: string
  subjectDisplayName: string
  initialStatus: AvailabilityStatus
  troupeId: string
  roleSlots: RoleSlots
  initialRoleKeys?: string[] | null
}

export interface AvailabilityDialogResult {
  status: AvailabilityStatus
  roleKeys: string[]
}

@Component({
  selector: 'app-availability-dialog',
  imports: [A11yModule, MatButtonModule, MatCheckboxModule, MatDialogModule],
  templateUrl: './availability-dialog.html',
  styleUrl: './availability-dialog.scss',
})
export class AvailabilityDialog {
  private readonly api = inject(AvailabilityApiService)
  private readonly memberProfileApi = inject(MemberProfileApiService)
  private readonly dialogRef = inject(MatDialogRef<AvailabilityDialog, AvailabilityDialogResult>)
  private readonly snack = inject(MatSnackBar)
  readonly data = inject<AvailabilityDialogData>(MAT_DIALOG_DATA)

  protected readonly selected = signal<AvailabilityStatus>(this.data.initialStatus)
  protected readonly saving = signal(false)
  protected readonly selectedRoleKeys = signal<RoleKey[]>(
    normalizeCandidateRoleKeys(this.data.roleSlots, this.data.initialRoleKeys, false),
  )

  protected readonly formattedDate = formatEventDate(this.data.eventStartsAt)
  protected readonly roleChoices = candidateRolesForEvent(this.data.roleSlots).map((key) => ({
    key,
    emoji: ROLE_EMOJIS[key],
    label: ROLE_LABELS[key],
  }))
  private readonly hasRoleChoices = this.roleChoices.length > 0
  private preferredRoleKeysPromise: Promise<string[]> | null = null
  private volunteerExplicitlyUnchecked = false
  protected volunteerMandatoryHint = false

  constructor() {
    if (this.selected() === 'available' && this.selectedRoleKeys().length === 0) {
      void this.applyPreferredPrecheck()
    }
  }

  protected isSelected(status: AvailabilityStatus): boolean {
    return this.selected() === status
  }

  protected feedbackText(): string | null {
    const s = this.selected()
    if (s === 'unknown') {
      return 'Tu n\'as pas renseigné de dispo.'
    }
    if (s === 'unavailable') {
      return 'Tu n\'es pas disponible pour cet événement.'
    }
    return null
  }

  protected shouldShowRoleBlock(): boolean {
    return this.selected() === 'available' && this.hasRoleChoices
  }

  protected isRoleSelected(roleKey: RoleKey): boolean {
    return this.selectedRoleKeys().includes(roleKey)
  }

  protected shouldShowVolunteerMandatoryHint(): boolean {
    return this.volunteerMandatoryHint
  }

  protected async choose(status: AvailabilityStatus): Promise<void> {
    if (this.saving()) {
      return
    }
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
    if (this.saving() || this.selected() !== 'available') {
      return
    }
    const current = this.selectedRoleKeys()
    let next = checked
      ? [...current, roleKey]
      : current.filter((key) => key !== roleKey)
    if (roleKey === 'volunteer') {
      this.volunteerExplicitlyUnchecked = !checked
      this.volunteerMandatoryHint = false
    }
    if (roleKey === 'player' && checked) {
      this.volunteerExplicitlyUnchecked = false
    }
    const hadVolunteer = current.includes('volunteer')
    next = normalizeCandidateRoleKeys(
      this.data.roleSlots,
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

  protected close(): void {
    this.dialogRef.close({
      status: this.selected(),
      roleKeys: this.selectedRoleKeys(),
    })
  }

  private async applyPreferredPrecheck(): Promise<void> {
    if (!this.hasRoleChoices) {
      return
    }
    const preferred = await this.loadPreferredRoleKeys()
    this.selectedRoleKeys.set(preferredRoleIntersection(this.data.roleSlots, preferred))
    this.volunteerExplicitlyUnchecked = false
    const keys = this.selectedRoleKeys()
    this.volunteerMandatoryHint =
      keys.includes('player') &&
      keys.includes('volunteer') &&
      mandatoryVolunteerCoverage(this.data.roleSlots)
  }

  private async loadPreferredRoleKeys(): Promise<string[]> {
    if (!this.preferredRoleKeysPromise) {
      this.preferredRoleKeysPromise = this.memberProfileApi
        .getPreferredRoles(this.data.troupeId)
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

  private async persist(status: AvailabilityStatus): Promise<void> {
    this.saving.set(true)
    const roleKeys = status === 'available' ? this.selectedRoleKeys() : []
    const r = await this.api.setMyAvailability(this.data.seasonId, this.data.eventId, {
      status,
      roleKeys,
      applyVolunteerRule: this.shouldApplyVolunteerRule(),
    })
    this.saving.set(false)
    if (!r.ok || !r.data) {
      this.snack.open('Enregistrement impossible.', 'OK', { duration: 5000 })
      return
    }
    this.selected.set(r.data.status)
    this.selectedRoleKeys.set(
      normalizeCandidateRoleKeys(this.data.roleSlots, r.data.roleKeys, false),
    )
  }
}

function formatEventDate(iso: string): string {
  const d = new Date(iso)
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: AGENDA_TIME_ZONE,
  }).format(d)
}
