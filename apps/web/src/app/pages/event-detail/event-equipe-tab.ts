import { Component, computed, effect, inject, input, output, signal, viewChild } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import { MatButtonModule } from '@angular/material/button'
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { MatIconModule } from '@angular/material/icon'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'

import {
  CompositionApiService,
  type CompositionDrawStep,
  type CompositionResponse,
  type CompositionSlot,
  type SlotParticipationUpdateStatus,
} from '../../core/composition/composition-api.service'
import { resolveCompositionEquipeStatus } from '../../core/composition/composition-equipe-status'
import { showPublishButton } from '../../core/composition/composition-visibility'
import type { EventResponse } from '../../core/events/event-api.service'
import {
  normalizeRoleSlots,
  ROLE_DISPLAY_ORDER,
  ROLE_EMOJIS,
  ROLE_LABELS,
  type RoleKey,
} from '../../core/events/event-types'
import { CompositionDrawAnimation } from '../../shared/composition/composition-draw-animation'
import {
  CompositionParticipationDialog,
  type CompositionParticipationDialogData,
  type CompositionParticipationDialogResult,
} from '../../shared/composition/composition-participation-dialog'
import {
  CompositionSlotPickerDialog,
  type CompositionSlotPickerDialogResult,
} from '../../shared/composition/composition-slot-picker-dialog'
import { ConfirmDialog, type ConfirmDialogData } from '../seasons-list/confirm-dialog'
import { EventEquipeEmpty } from './event-equipe-empty'

interface SlotRow {
  roleKey: string
  slotIndex: number
  roleLabel: string
  roleEmoji: string
  slot: CompositionSlot | null
}

@Component({
  selector: 'app-event-equipe-tab',
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    EventEquipeEmpty,
    CompositionDrawAnimation,
  ],
  templateUrl: './event-equipe-tab.html',
  styleUrl: './event-equipe-tab.scss',
})
export class EventEquipeTab {
  private readonly compositionApi = inject(CompositionApiService)
  private readonly snack = inject(MatSnackBar)
  private readonly dialog = inject(MatDialog)

  private readonly drawAnimation = viewChild(CompositionDrawAnimation)

  readonly seasonId = input.required<string>()
  readonly event = input.required<EventResponse>()
  readonly canManageComposition = input(false)
  readonly showConfirmPending = input(false)

  readonly compositionPublished = output<void>()

  protected readonly loading = signal(true)
  protected readonly loadError = signal(false)
  protected readonly publishing = signal(false)
  protected readonly validating = signal(false)
  protected readonly unlocking = signal(false)
  protected readonly drawing = signal(false)
  protected readonly assigning = signal(false)
  protected readonly updatingParticipation = signal(false)
  protected readonly composition = signal<CompositionResponse | null>(null)
  protected readonly showConfirmOpened = signal(false)
  protected readonly declinesExpanded = signal(false)
  protected readonly drawSteps = signal<CompositionDrawStep[]>([])
  protected readonly drawStepIndex = signal(0)
  protected readonly animatingDraw = signal(false)

  protected readonly prefersReducedMotion = signal(false)

  protected readonly isCompositionLocked = computed(
    () => this.composition()?.validatedAt != null,
  )

  protected readonly showOrganizerPlaceholders = computed(
    () =>
      this.canManageComposition() &&
      !this.isCompositionLocked() &&
      !this.loading() &&
      !this.loadError(),
  )

  protected readonly showEmptyState = computed(() => {
    if (this.loading() || this.loadError() || this.animatingDraw()) {
      return false
    }
    if (this.showOrganizerPlaceholders()) {
      return false
    }
    return this.slotRows().length === 0
  })

  protected readonly showDraftBanner = computed(() => {
    const comp = this.composition()
    return this.canManageComposition() && comp?.visibility === 'organizerDraft'
  })

  protected readonly canPublish = computed(() =>
    showPublishButton(this.composition(), this.canManageComposition()),
  )

  protected readonly hasAssignedSlot = computed(() =>
    (this.composition()?.slots ?? []).some((slot) => slot.participantId != null),
  )

  protected readonly canValidate = computed(
    () =>
      this.canManageComposition() &&
      !this.isCompositionLocked() &&
      this.hasAssignedSlot() &&
      !this.validating() &&
      !this.unlocking() &&
      !this.publishing(),
  )

  protected readonly canUnlock = computed(
    () =>
      this.canManageComposition() &&
      this.isCompositionLocked() &&
      !this.validating() &&
      !this.unlocking() &&
      !this.publishing(),
  )

  protected readonly equipeStatus = computed(() => {
    const ev = this.event()
    const comp = this.composition()
    if (this.loading() || this.loadError() || this.animatingDraw()) {
      return null
    }
    if (this.showEmptyState() && !this.showOrganizerPlaceholders()) {
      return null
    }
    return resolveCompositionEquipeStatus({
      composition: comp,
      canManageComposition: this.canManageComposition(),
      roleSlots: normalizeRoleSlots(ev.roleSlots),
    })
  })

  protected readonly canDraw = computed(
    () =>
      this.canManageComposition() &&
      !this.isCompositionLocked() &&
      !this.publishing() &&
      !this.drawing() &&
      !this.animatingDraw() &&
      !this.assigning(),
  )

  protected readonly canEditSlots = computed(
    () =>
      this.canManageComposition() &&
      !this.isCompositionLocked() &&
      !this.publishing() &&
      !this.drawing() &&
      !this.animatingDraw() &&
      !this.assigning(),
  )

  protected readonly viewerParticipantIds = computed(
    () => new Set(this.composition()?.viewerParticipantIds ?? []),
  )

  protected readonly declines = computed(() => this.composition()?.declines ?? [])

  protected readonly declineBadgeLabel = computed(() => {
    const count = this.declines().length
    if (count === 0) {
      return null
    }
    return count === 1 ? '1 personne a décliné' : `${count} personnes ont décliné`
  })

  protected readonly currentDrawStep = computed(() => {
    const steps = this.drawSteps()
    const index = this.drawStepIndex()
    return steps[index] ?? null
  })

  protected readonly slotRows = computed((): SlotRow[] => {
    const ev = this.event()
    const comp = this.composition()
    const roleSlots = normalizeRoleSlots(ev.roleSlots)
    const hasRequiredSlots = Object.values(roleSlots).some((n) => n > 0)
    if (!hasRequiredSlots) {
      return []
    }

    const showPlaceholders = this.showOrganizerPlaceholders()
    if (!comp && !showPlaceholders) {
      return []
    }
    if (comp && comp.slots.length === 0 && !showPlaceholders && !this.isCompositionLocked()) {
      return []
    }

    const slotsByKey = new Map<string, CompositionSlot>()
    for (const slot of comp?.slots ?? []) {
      slotsByKey.set(`${slot.roleKey}:${slot.slotIndex}`, slot)
    }

    const rows: SlotRow[] = []
    for (const roleKey of ROLE_DISPLAY_ORDER) {
      const count = roleSlots[roleKey] ?? 0
      if (count <= 0) continue
      const label = ROLE_LABELS[roleKey as RoleKey] ?? roleKey
      const emoji = ROLE_EMOJIS[roleKey as RoleKey] ?? '•'
      for (let index = 0; index < count; index++) {
        rows.push({
          roleKey,
          slotIndex: index,
          roleLabel: label,
          roleEmoji: emoji,
          slot: slotsByKey.get(`${roleKey}:${index}`) ?? null,
        })
      }
    }
    return rows
  })

  private loadRequestId = 0

  constructor() {
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      this.prefersReducedMotion.set(
        window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      )
    }

    let previousEventId: string | null = null
    effect(() => {
      const eventId = this.event().id
      const seasonId = this.seasonId()
      if (eventId !== previousEventId) {
        previousEventId = eventId
        void this.load(seasonId, eventId)
      }
    })

    effect(() => {
      const step = this.currentDrawStep()
      const anim = this.drawAnimation()
      if (!step || !anim || !this.animatingDraw()) {
        return
      }
      queueMicrotask(() => anim.play())
    })

    effect(() => {
      if (
        !this.showConfirmPending() ||
        this.showConfirmOpened() ||
        this.loading() ||
        this.loadError() ||
        !this.isCompositionLocked()
      ) {
        return
      }
      const row = this.findOwnAssignedParticipationRow()
      if (!row) {
        return
      }
      this.showConfirmOpened.set(true)
      queueMicrotask(() => void this.openParticipationModal(row, { mode: 'self' }))
    })
  }

  protected readonly hasViewerParticipantIdentity = computed(
    () => this.viewerParticipantIds().size > 0,
  )

  /** Own-slot confirmation when locked — organizers use self-service copy on own slot. */
  protected canTapParticipationSlot(row: SlotRow): boolean {
    if (this.updatingParticipation()) {
      return false
    }
    if (!this.isCompositionLocked() || this.loading() || this.loadError()) {
      return false
    }
    const participantId = row.slot?.participantId
    if (!participantId) {
      return false
    }
    return this.viewerParticipantIds().has(participantId)
  }

  /** Organizer proxy on any filled locked slot (foreign slots; own slot uses self-service above). */
  protected canTapProxyParticipationSlot(row: SlotRow): boolean {
    if (this.updatingParticipation()) {
      return false
    }
    if (!this.canManageComposition() || !this.isCompositionLocked() || this.loading() || this.loadError()) {
      return false
    }
    return row.slot?.participantId != null
  }

  protected isParticipationSlotTappable(row: SlotRow): boolean {
    return this.canTapParticipationSlot(row) || this.canTapProxyParticipationSlot(row)
  }

  protected onSlotRowClick(row: SlotRow): void {
    if (this.canEditSlots()) {
      void this.openSlotPicker(row)
      return
    }
    if (this.canTapParticipationSlot(row)) {
      void this.openParticipationModal(row, { mode: 'self' })
      return
    }
    if (this.canTapProxyParticipationSlot(row)) {
      void this.openParticipationModal(row, { mode: 'proxy' })
      return
    }
    if (
      this.isCompositionLocked() &&
      row.slot?.participantId &&
      this.hasViewerParticipantIdentity() &&
      !this.viewerParticipantIds().has(row.slot.participantId)
    ) {
      this.onForeignParticipationSlotTap()
    }
  }

  protected onForeignParticipationSlotTap(): void {
    this.snack.open('Vous ne pouvez confirmer que votre propre participation.', 'OK', {
      duration: 4000,
    })
  }

  protected toggleDeclinesList(): void {
    this.declinesExpanded.update((open) => !open)
  }

  protected declineRoleLabel(roleKey: string): string {
    return ROLE_LABELS[roleKey as RoleKey] ?? roleKey
  }

  protected declineRoleEmoji(roleKey: string): string {
    return ROLE_EMOJIS[roleKey as RoleKey] ?? '•'
  }

  private findOwnAssignedParticipationRow(): SlotRow | null {
    const viewerIds = this.viewerParticipantIds()
    for (const row of this.slotRows()) {
      const slot = row.slot
      if (slot?.participantId && viewerIds.has(slot.participantId)) {
        return row
      }
    }
    return null
  }

  protected async openParticipationModal(
    row: SlotRow,
    options: { mode: 'self' | 'proxy' },
  ): Promise<void> {
    if (this.updatingParticipation()) {
      return
    }
    const slot = row.slot
    if (!slot?.participantId) {
      return
    }
    if (options.mode === 'self' && !this.canTapParticipationSlot(row)) {
      return
    }
    if (options.mode === 'proxy' && !this.canTapProxyParticipationSlot(row)) {
      return
    }
    const ev = this.event()
    const assigneeName = slot.participantDisplayName ?? 'ce participant'
    const dialogRef = this.dialog.open<
      CompositionParticipationDialog,
      CompositionParticipationDialogData,
      CompositionParticipationDialogResult | undefined
    >(CompositionParticipationDialog, {
      data: {
        eventTitle: ev.title,
        eventDate: ev.startsAt,
        roleLabel: row.roleLabel,
        roleEmoji: row.roleEmoji,
        currentStatus: slot.participationStatus,
        mode: options.mode,
        assigneeDisplayName: options.mode === 'proxy' ? assigneeName : undefined,
      },
      autoFocus: 'first-titled-element',
    })

    const result = await firstValueFrom(dialogRef.afterClosed())
    if (!result) {
      return
    }
    if (result.status === 'declined') {
      const declineMessage =
        options.mode === 'proxy'
          ? `Confirmer le désistement de ${assigneeName} pour ce rôle ?`
          : 'Confirmer votre désistement pour ce rôle ?'
      const confirmed = await firstValueFrom(
        this.dialog
          .open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
            data: {
              title: 'Décliner la participation',
              message: declineMessage,
              confirmLabel: 'Décliner',
              destructive: true,
            },
          })
          .afterClosed(),
      )
      if (!confirmed) {
        return
      }
    }
    await this.submitParticipation(row, result.status, result.note)
  }

  private async submitParticipation(
    row: SlotRow,
    status: SlotParticipationUpdateStatus,
    note?: string | null,
  ): Promise<void> {
    if (this.updatingParticipation()) {
      return
    }
    this.updatingParticipation.set(true)
    const seasonId = this.seasonId()
    const eventId = this.event().id
    const result = await this.compositionApi.updateSlotParticipation(
      seasonId,
      eventId,
      row.roleKey,
      row.slotIndex,
      status,
      note,
    )
    this.updatingParticipation.set(false)
    if (this.event().id !== eventId) {
      return
    }
    if (!result.ok || !result.data) {
      this.snack.open(
        this.participationErrorMessage(result.status, result.errorMessage),
        'OK',
        { duration: 6000 },
      )
      return
    }
    this.composition.set(result.data)
    this.compositionPublished.emit()
    const message =
      status === 'confirmed'
        ? 'Participation confirmée.'
        : status === 'declined'
          ? 'Participation déclinée.'
          : 'Participation remise en attente.'
    this.snack.open(message, 'OK', { duration: 4000 })
  }

  private participationErrorMessage(status: number, apiMessage?: string): string {
    if (apiMessage) {
      return apiMessage
    }
    switch (status) {
      case 403:
        return 'Vous ne pouvez pas modifier cette participation.'
      case 409:
        return 'Les confirmations ne sont pas encore ouvertes.'
      default:
        return 'Mise à jour impossible.'
    }
  }

  protected async draw(): Promise<void> {
    if (!this.canDraw()) {
      return
    }
    this.drawing.set(true)
    const seasonId = this.seasonId()
    const eventId = this.event().id
    const result = await this.compositionApi.drawComposition(seasonId, eventId, 'full')
    this.drawing.set(false)
    if (this.event().id !== eventId) {
      return
    }
    if (!result.ok || !result.data) {
      const message =
        result.status === 403
          ? 'Vous ne pouvez pas lancer le tirage au sort.'
          : result.status === 409
            ? 'La composition est verrouillée.'
            : 'Tirage au sort impossible.'
      this.snack.open(message, 'OK', { duration: 6000 })
      return
    }

    if (this.prefersReducedMotion() || result.data.steps.length === 0) {
      this.composition.set(result.data.composition)
      return
    }

    this.drawSteps.set(result.data.steps)
    this.drawStepIndex.set(0)
    this.animatingDraw.set(true)
  }

  protected onDrawStepFinished(): void {
    const next = this.drawStepIndex() + 1
    if (next < this.drawSteps().length) {
      this.drawStepIndex.set(next)
      return
    }
    this.animatingDraw.set(false)
    this.drawSteps.set([])
    void this.load(this.seasonId(), this.event().id)
  }

  protected async openSlotPicker(row: SlotRow): Promise<void> {
    if (!this.canEditSlots()) {
      return
    }
    const seasonId = this.seasonId()
    const eventId = this.event().id
    const dialogRef = this.dialog.open<
      CompositionSlotPickerDialog,
      {
        roleLabel: string
        candidates: []
        loading: boolean
        error: string | null
      },
      CompositionSlotPickerDialogResult | undefined
    >(CompositionSlotPickerDialog, {
      data: {
        roleLabel: row.roleLabel,
        candidates: [],
        loading: true,
        error: null,
      },
      autoFocus: 'first-titled-element',
    })

    const candidatesResult = await this.compositionApi.getCompositionCandidates(
      seasonId,
      eventId,
      row.roleKey,
      row.slotIndex,
    )
    if (this.event().id !== eventId) {
      dialogRef.close()
      return
    }

    const component = dialogRef.componentInstance
    if (!candidatesResult.ok || !candidatesResult.data) {
      component.updateState(
        [],
        false,
        this.candidatesErrorMessage(candidatesResult.status, candidatesResult.errorMessage),
      )
      return
    }

    component.updateState(candidatesResult.data.candidates, false, null)

    const pick = await firstValueFrom(dialogRef.afterClosed())
    if (!pick?.participantId || this.event().id !== eventId) {
      return
    }

    await this.assignSlot(row, pick.participantId)
  }

  protected async clearSlot(row: SlotRow, event: Event): Promise<void> {
    event.stopPropagation()
    if (!this.canEditSlots() || !row.slot?.participantId) {
      return
    }
    await this.assignSlot(row, null)
  }

  private async assignSlot(row: SlotRow, participantId: string | null): Promise<void> {
    if (this.assigning()) {
      return
    }
    this.assigning.set(true)
    const seasonId = this.seasonId()
    const eventId = this.event().id
    const result = await this.compositionApi.assignCompositionSlot(
      seasonId,
      eventId,
      row.roleKey,
      row.slotIndex,
      participantId,
    )
    this.assigning.set(false)
    if (this.event().id !== eventId) {
      return
    }
    if (!result.ok || !result.data) {
      this.snack.open(
        this.assignErrorMessage(result.status, result.errorMessage),
        'OK',
        { duration: 6000 },
      )
      return
    }
    this.composition.set(result.data)
    this.compositionPublished.emit()
  }

  private candidatesErrorMessage(status: number, apiMessage?: string): string {
    if (apiMessage) {
      return apiMessage
    }
    switch (status) {
      case 403:
        return 'Accès refusé.'
      case 409:
        return 'La composition est verrouillée.'
      default:
        return 'Impossible de charger les candidats.'
    }
  }

  private assignErrorMessage(status: number, apiMessage?: string): string {
    if (apiMessage) {
      return apiMessage
    }
    switch (status) {
      case 403:
        return 'Vous ne pouvez pas modifier cette composition.'
      case 409:
        return 'Assignation impossible (composition verrouillée ou candidat non éligible).'
      default:
        return 'Assignation impossible.'
    }
  }

  protected async publish(): Promise<void> {
    if (this.publishing() || !this.canPublish()) {
      return
    }
    this.publishing.set(true)
    const seasonId = this.seasonId()
    const eventId = this.event().id
    const result = await this.compositionApi.publishComposition(seasonId, eventId)
    this.publishing.set(false)
    if (this.event().id !== eventId) {
      return
    }
    if (!result.ok || !result.data) {
      const message =
        result.status === 403
          ? 'Vous ne pouvez pas publier cette composition.'
          : result.status === 409
            ? 'Rien à publier pour le moment.'
            : 'Publication impossible.'
      this.snack.open(message, 'OK', { duration: 6000 })
      return
    }
    this.composition.set(result.data)
    this.compositionPublished.emit()
    this.snack.open('Composition publiée.', 'OK', { duration: 4000 })
  }

  protected async validate(): Promise<void> {
    if (!this.canValidate()) {
      return
    }
    this.validating.set(true)
    const seasonId = this.seasonId()
    const eventId = this.event().id
    const result = await this.compositionApi.validateComposition(seasonId, eventId)
    this.validating.set(false)
    if (this.event().id !== eventId) {
      return
    }
    if (!result.ok || !result.data) {
      this.snack.open(this.validateUnlockErrorMessage('validate', result.status, result.errorMessage), 'OK', {
        duration: 6000,
      })
      return
    }
    this.composition.set(result.data)
    this.compositionPublished.emit()
    this.snack.open('Composition validée.', 'OK', { duration: 4000 })
  }

  protected async unlock(): Promise<void> {
    if (!this.canUnlock()) {
      return
    }
    this.unlocking.set(true)
    const seasonId = this.seasonId()
    const eventId = this.event().id
    const result = await this.compositionApi.unlockComposition(seasonId, eventId)
    this.unlocking.set(false)
    if (this.event().id !== eventId) {
      return
    }
    if (!result.ok || !result.data) {
      this.snack.open(this.validateUnlockErrorMessage('unlock', result.status, result.errorMessage), 'OK', {
        duration: 6000,
      })
      return
    }
    this.composition.set(result.data)
    this.compositionPublished.emit()
    this.snack.open('Composition déverrouillée.', 'OK', { duration: 4000 })
  }

  private validateUnlockErrorMessage(
    action: 'validate' | 'unlock',
    status: number,
    apiMessage?: string,
  ): string {
    if (apiMessage) {
      return apiMessage
    }
    if (status === 403) {
      return action === 'validate'
        ? 'Vous ne pouvez pas valider cette composition.'
        : 'Vous ne pouvez pas déverrouiller cette composition.'
    }
    if (status === 409) {
      return action === 'validate'
        ? 'Rien à valider pour le moment.'
        : 'La composition n\'est pas verrouillée.'
    }
    return action === 'validate' ? 'Validation impossible.' : 'Déverrouillage impossible.'
  }

  private async load(seasonId: string, eventId: string): Promise<void> {
    const requestId = ++this.loadRequestId
    this.loading.set(true)
    this.loadError.set(false)
    this.composition.set(null)
    const result = await this.compositionApi.getComposition(seasonId, eventId)
    if (requestId !== this.loadRequestId) {
      return
    }
    this.loading.set(false)
    if (!result.ok || !result.data) {
      this.loadError.set(true)
      return
    }
    this.composition.set(result.data)
  }
}
