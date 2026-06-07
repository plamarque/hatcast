import { NgTemplateOutlet } from '@angular/common'
import { Component, computed, effect, inject, input, output, signal, viewChild } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import { MatButtonModule } from '@angular/material/button'
import { MatChipsModule } from '@angular/material/chips'
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'
import { MatTooltip, MatTooltipModule } from '@angular/material/tooltip'

import { MePreferencesApiService } from '../../core/account/me-preferences-api.service'
import { effectiveMemberGender, type MemberGender } from '../../core/account/member-gender'
import { ProductAnalyticsService } from '../../core/analytics/product-analytics.service'
import { computeRawCompositionLifecycle } from '../../core/composition/composition-lifecycle'
import {
  CompositionApiService,
  type CompositionDrawStep,
  type CompositionResponse,
  type CompositionSlot,
  type SlotParticipationUpdateStatus,
} from '../../core/composition/composition-api.service'
import {
  CONSECUTIVE_SHOW_WARNING_SHORT_LABEL,
  formatConsecutiveShowWarningTooltip,
} from '../../core/composition/consecutive-show-warning'
import {
  formatMultiRoleOnEventWarningTooltip,
  MULTI_ROLE_ON_EVENT_WARNING_SHORT_LABEL,
} from '../../core/composition/multi-role-on-event-warning'
import {
  canValidateComposition,
  isEquipePrimaryAction,
  resolveEquipeToolbarLayout,
  type EquipeActionId,
} from '../../core/composition/composition-equipe-actions'
import { computeCompositionPlayerGenderParity } from '../../core/composition/composition-player-gender-parity'
import { canShowCompositionExplainability } from '../../core/composition/composition-explainability'
import { resolveCompositionEquipeStatus } from '../../core/composition/composition-equipe-status'
import { showCompositionDraftBanner } from '../../core/composition/composition-visibility'
import type { EventResponse } from '../../core/events/event-api.service'
import {
  normalizeRoleSlots,
  ROLE_EMOJIS,
  ROLE_LABELS,
  rolesWithSlots,
  type RoleKey,
} from '../../core/events/event-types'
import { auditRoleDisplay } from '../../core/audit/audit-display-labels'
import { getRoleLabel } from '../../shared/event-roles/event-roles'
import { ChanceBreakdownService } from '../../shared/composition/chance-breakdown.service'
import { CompositionDrawAnimation } from '../../shared/composition/composition-draw-animation'
import { CompositionPoolPreview } from '../../shared/composition/composition-pool-preview'
import {
  CompositionParticipationDialog,
  type CompositionParticipationDialogData,
  type CompositionParticipationDialogResult,
} from '../../shared/composition/composition-participation-dialog'
import {
  CompositionSlotPickerDialog,
  type CompositionSlotPickerDialogData,
  type CompositionSlotPickerDialogResult,
} from '../../shared/composition/composition-slot-picker-dialog'
import type {
  RoleAssignmentLine,
  ShareAnnounceIntent,
} from '../../core/messaging/share-announce-messages'
import {
  ShareAnnounceDialog,
  type ShareAnnounceDialogData,
} from '../../shared/share-announce/share-announce-dialog'
import {
  SHARE_ANNOUNCE_SNACK_DURATION_MS,
  shareAnnounceSnackMessage,
  type ShareAnnounceNotifyResult,
} from '../../shared/share-announce/share-announce-snack'
import { UserAvatarComponent } from '../../shared/user-avatar/user-avatar'
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
    NgTemplateOutlet,
    MatButtonModule,
    MatChipsModule,
    MatDialogModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    EventEquipeEmpty,
    CompositionDrawAnimation,
    CompositionPoolPreview,
    UserAvatarComponent,
  ],
  templateUrl: './event-equipe-tab.html',
  styleUrl: './event-equipe-tab.scss',
})
export class EventEquipeTab {
  private readonly compositionApi = inject(CompositionApiService)
  private readonly mePreferencesApi = inject(MePreferencesApiService)
  private readonly analytics = inject(ProductAnalyticsService)
  private readonly snack = inject(MatSnackBar)
  private readonly dialog = inject(MatDialog)
  private readonly chanceBreakdown = inject(ChanceBreakdownService)

  private readonly drawAnimation = viewChild(CompositionDrawAnimation)

  readonly seasonId = input.required<string>()
  readonly seasonSlug = input.required<string>()
  readonly troupeSlug = input.required<string>()
  readonly troupeId = input.required<string>()
  readonly event = input.required<EventResponse>()
  readonly canManageComposition = input(false)
  readonly showConfirmPending = input(false)

  readonly compositionPublished = output<CompositionResponse>()
  readonly compositionInteractionBlockedChange = output<boolean>()

  protected readonly loading = signal(true)
  protected readonly loadError = signal(false)
  protected readonly validating = signal(false)
  protected readonly unlocking = signal(false)
  protected readonly drawing = signal(false)
  protected readonly assigning = signal(false)
  protected readonly restoringDeclineId = signal<string | null>(null)
  protected readonly updatingParticipation = signal(false)
  protected readonly composition = signal<CompositionResponse | null>(null)
  protected readonly showConfirmOpened = signal(false)
  protected readonly declinesExpanded = signal(false)
  protected readonly drawSteps = signal<CompositionDrawStep[]>([])
  protected readonly drawStepIndex = signal(0)
  protected readonly animatingDraw = signal(false)
  private readonly pendingDrawComposition = signal<CompositionResponse | null>(null)
  private drawPrepareSnapshot: CompositionResponse | null = null

  protected readonly prefersReducedMotion = signal(false)
  protected readonly poolPreviewAnchorKey = signal<string | null>(null)
  protected readonly poolPreviewRoleKey = signal<string | null>(null)
  protected readonly poolPreviewSegments = signal<
    import('../../core/composition/composition-api.service').CompositionPoolPreviewSegment[]
  >([])
  protected readonly poolPreviewLoading = signal(false)
  protected readonly poolPreviewError = signal<string | null>(null)
  private poolPreviewGeneration = 0

  /** HTTP draw in flight — show preparing panel before step animation. */
  protected readonly showDrawPreparing = computed(() => this.drawing() && !this.animatingDraw())

  /** Blocks interactions (grid inert, actions disabled). Includes draw animation. */
  protected readonly compositionInteractionBlocked = computed(
    () =>
      this.drawing() ||
      this.assigning() ||
      this.validating() ||
      this.unlocking() ||
      this.updatingParticipation() ||
      this.restoringDeclineId() != null ||
      this.animatingDraw(),
  )

  /**
   * Full-tab overlay — not during draw: HTTP wait uses the draw button spinner;
   * step animation uses the roulette (see animatingDraw).
   */
  protected readonly showBusyOverlay = computed(
    () =>
      this.compositionInteractionBlocked() && !this.animatingDraw() && !this.drawing(),
  )

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
    if (this.loading() || this.loadError() || this.animatingDraw() || this.drawing()) {
      return false
    }
    if (this.showOrganizerPlaceholders()) {
      return false
    }
    return this.slotRows().length === 0
  })

  protected readonly hasAssignedSlot = computed(() =>
    (this.composition()?.slots ?? []).some((slot) => slot.participantId != null),
  )

  /** Organizer draft: wrap slots in the same visual language as event draft banner (story 3.21). */
  protected readonly showCompositionDraftZone = computed(() =>
    showCompositionDraftBanner(this.composition(), this.canManageComposition()),
  )

  protected readonly canValidate = computed(() =>
    canValidateComposition({
      canManageComposition: this.canManageComposition(),
      composition: this.composition(),
      compositionInteractionBlocked: this.compositionInteractionBlocked(),
    }),
  )

  protected readonly canUnlock = computed(
    () =>
      this.canManageComposition() &&
      this.isCompositionLocked() &&
      !this.compositionInteractionBlocked(),
  )

  protected readonly hasEmptyRequiredSlot = computed(() =>
    this.slotRows().some((row) => !row.slot?.participantId),
  )

  protected readonly canFillGaps = computed(
    () =>
      this.canManageComposition() &&
      this.isCompositionLocked() &&
      this.hasEmptyRequiredSlot() &&
      !this.compositionInteractionBlocked() &&
      !this.animatingDraw() &&
      !this.loading() &&
      !this.loadError(),
  )

  protected readonly equipeStatus = computed(() => {
    const ev = this.event()
    const comp = this.composition()
    if (this.loading() || this.loadError() || this.animatingDraw() || this.drawing()) {
      return null
    }
    if (this.showEmptyState() && !this.showOrganizerPlaceholders()) {
      return null
    }
    return resolveCompositionEquipeStatus({
      composition: comp,
      canManageComposition: this.canManageComposition(),
      roleSlots: normalizeRoleSlots(ev.roleSlots),
      suppressValidateCtaInGuideline: this.canValidate(),
    })
  })

  protected readonly equipeActionFlags = computed(() => ({
    canValidate: this.canValidate(),
    canFillGaps: this.canFillGaps(),
    canAnnounceComposition: this.canAnnounceComposition(),
    canDraw: this.canDraw(),
    canUnlock: this.canUnlock(),
    canShareDraw: this.canShareDraw(),
    hasAssignedSlot: this.hasAssignedSlot(),
  }))

  protected readonly equipeToolbar = computed(() =>
    resolveEquipeToolbarLayout(this.equipeActionFlags()),
  )

  protected readonly primaryAction = computed(() => this.equipeToolbar().primary)

  protected readonly canDraw = computed(
    () =>
      this.canManageComposition() &&
      !this.isCompositionLocked() &&
      !this.compositionInteractionBlocked() &&
      !this.animatingDraw(),
  )

  protected readonly canShareDraw = computed(
    () =>
      this.canManageComposition() &&
      !this.isCompositionLocked() &&
      this.hasAssignedSlot() &&
      !this.compositionInteractionBlocked() &&
      !this.loading() &&
      !this.loadError(),
  )

  protected readonly canAnnounceComposition = computed(
    () =>
      this.canManageComposition() &&
      this.isCompositionLocked() &&
      this.hasAssignedSlot() &&
      !this.compositionInteractionBlocked() &&
      !this.loading() &&
      !this.loadError(),
  )

  protected readonly canEditSlots = computed(
    () =>
      this.canManageComposition() &&
      !this.isCompositionLocked() &&
      !this.compositionInteractionBlocked() &&
      !this.animatingDraw(),
  )

  protected readonly showActionsToolbar = computed(
    () =>
      this.canShareDraw() ||
      this.canAnnounceComposition() ||
      this.canFillGaps() ||
      this.canDraw() ||
      this.canValidate() ||
      this.canUnlock(),
  )

  /** Draw helper copy — not when validate lead already guides the forward action. */
  protected readonly showDrawActionHint = computed(
    () => this.canDraw() && !this.canValidate(),
  )

  protected readonly showFillActionHint = computed(() => this.canFillGaps())

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

  protected readonly playerGenderParity = computed(() =>
    computeCompositionPlayerGenderParity(this.composition()?.slots ?? []),
  )

  protected readonly visiblePlayerGenderParity = computed(() => {
    if (
      !this.canManageComposition() ||
      this.loading() ||
      this.loadError() ||
      this.animatingDraw() ||
      this.drawing() ||
      this.showEmptyState()
    ) {
      return null
    }
    return this.playerGenderParity()
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
    for (const roleKey of rolesWithSlots(roleSlots)) {
      const count = roleSlots[roleKey] ?? 0
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
      this.compositionInteractionBlockedChange.emit(this.compositionInteractionBlocked())
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
    if (this.compositionInteractionBlocked()) {
      return false
    }
    if (this.loading() || this.loadError()) {
      return false
    }
    const participantId = row.slot?.participantId
    if (!participantId) {
      return false
    }
    if (!this.viewerParticipantIds().has(participantId)) {
      return false
    }
    if (this.isCompositionLocked()) {
      return true
    }
    return this.canManageComposition()
  }

  /** Organizer proxy on any filled slot (foreign slots; own slot uses self-service above). */
  protected canTapProxyParticipationSlot(row: SlotRow): boolean {
    if (this.compositionInteractionBlocked()) {
      return false
    }
    if (!this.canManageComposition() || this.loading() || this.loadError()) {
      return false
    }
    return row.slot?.participantId != null
  }

  protected canTapGapSlot(row: SlotRow): boolean {
    return this.canFillGaps() && !row.slot?.participantId
  }

  protected hasEmptySlotForRole(roleKey: string): boolean {
    return this.slotRows().some(
      (row) => row.roleKey === roleKey && !row.slot?.participantId,
    )
  }

  protected isParticipationSlotTappable(row: SlotRow): boolean {
    return this.canTapParticipationSlot(row) || this.canTapProxyParticipationSlot(row)
  }

  protected isForeignParticipationSlot(row: SlotRow): boolean {
    return (
      this.isCompositionLocked() &&
      row.slot?.participantId != null &&
      this.hasViewerParticipantIdentity() &&
      !this.canTapParticipationSlot(row) &&
      !this.canTapProxyParticipationSlot(row)
    )
  }

  protected isSlotRowTappable(row: SlotRow): boolean {
    return (
      this.canEditSlots() ||
      this.canTapGapSlot(row) ||
      this.isParticipationSlotTappable(row) ||
      this.isForeignParticipationSlot(row)
    )
  }

  protected isSlotRowHitDisabled(row: SlotRow): boolean {
    return this.isParticipationSlotTappable(row) && this.updatingParticipation()
  }

  protected slotRowAriaLabel(row: SlotRow): string {
    const role = this.rolePillLabel(
      row.roleKey,
      row.slot?.participantGender,
      !!row.slot?.participantId,
    )
    const name = row.slot?.participantDisplayName
    if (this.isParticipationSlotTappable(row)) {
      return name ? `Participation de ${name}, ${role}` : role
    }
    if (this.canEditSlots() || this.canTapGapSlot(row)) {
      return name ? `Modifier ${name}, ${role}` : `Assigner ${role}`
    }
    return name ? `${name}, ${role}` : role
  }

  protected readonly consecutiveShowWarningShortLabel = CONSECUTIVE_SHOW_WARNING_SHORT_LABEL

  protected consecutiveWarningTooltip(row: SlotRow): string | null {
    const warning = row.slot?.consecutiveShowWarning
    const name = row.slot?.participantDisplayName
    if (!warning || !name) {
      return null
    }
    return formatConsecutiveShowWarningTooltip(warning, name)
  }

  protected onConsecutiveWarningClick(event: MouseEvent, tooltip: MatTooltip): void {
    event.stopPropagation()
    tooltip.toggle()
  }

  protected readonly multiRoleOnEventWarningShortLabel =
    MULTI_ROLE_ON_EVENT_WARNING_SHORT_LABEL

  protected multiRoleWarningTooltip(row: SlotRow): string | null {
    const warning = row.slot?.multiRoleOnEventWarning
    const name = row.slot?.participantDisplayName
    if (!warning || !name) {
      return null
    }
    return formatMultiRoleOnEventWarningTooltip(
      warning,
      name,
      row.slot?.participantGender,
    )
  }

  protected onSlotRowClick(row: SlotRow): void {
    if (this.isParticipationSlotTappable(row)) {
      if (this.canTapParticipationSlot(row)) {
        void this.openParticipationModal(row, { mode: 'self' })
        return
      }
      if (this.canTapProxyParticipationSlot(row)) {
        void this.openParticipationModal(row, { mode: 'proxy' })
        return
      }
    }
    if (this.canEditSlots() || this.canTapGapSlot(row)) {
      void this.openSlotPicker(row)
      return
    }
    if (this.isForeignParticipationSlot(row)) {
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

  protected isEquipePrimary(actionId: EquipeActionId): boolean {
    return isEquipePrimaryAction(actionId, this.equipeToolbar().primary)
  }

  protected equipeActionInGrid(actionId: EquipeActionId): boolean {
    return this.equipeToolbar().grid.includes(actionId)
  }

  protected equipeActionInOverflow(actionId: EquipeActionId): boolean {
    return this.equipeToolbar().overflow.includes(actionId)
  }

  protected openShareDialog(intent: ShareAnnounceIntent): void {
    if (this.compositionInteractionBlocked()) {
      return
    }
    const ev = this.event()
    const roleLines = this.buildShareRoleLines()
    const ref = this.dialog.open<ShareAnnounceDialog, ShareAnnounceDialogData, ShareAnnounceNotifyResult | undefined>(
      ShareAnnounceDialog,
      {
        data: {
          intent,
          seasonId: this.seasonId(),
          eventId: ev.id,
          troupeSlug: this.troupeSlug(),
          seasonSlug: this.seasonSlug(),
          eventSlug: ev.slug,
          eventTitle: ev.title,
          eventDateIso: ev.startsAt,
          roleLines,
          availabilityOpenedAt: ev.availabilityOpenedAt ?? null,
          compositionValidatedAt:
            intent === 'composition' ? (this.composition()?.validatedAt ?? null) : null,
        },
        width: 'min(42rem, 96vw)',
        maxHeight: '92vh',
        autoFocus: 'first-titled-element',
      },
    )
    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.snack.open(shareAnnounceSnackMessage(result), 'OK', {
          duration: SHARE_ANNOUNCE_SNACK_DURATION_MS,
        })
      }
    })
  }

  private buildShareRoleLines(): RoleAssignmentLine[] {
    const byRole = new Map<string, string[]>()
    for (const row of this.slotRows()) {
      const name = row.slot?.participantDisplayName
      if (!name) continue
      const list = byRole.get(row.roleKey) ?? []
      list.push(name)
      byRole.set(row.roleKey, list)
    }
    const gendersByRole = new Map<string, (string | undefined)[]>()
    for (const row of this.slotRows()) {
      const name = row.slot?.participantDisplayName
      if (!name) continue
      const list = gendersByRole.get(row.roleKey) ?? []
      list.push(row.slot?.participantGender ?? undefined)
      gendersByRole.set(row.roleKey, list)
    }
    return [...byRole.entries()].map(([roleKey, displayNames]) => ({
      roleKey: roleKey as RoleKey,
      displayNames,
      participantGenders: gendersByRole.get(roleKey),
    }))
  }

  protected readonly emptySlotPlaceholder = 'À pourvoir'

  /** Inclusive label for empty slots; gender-aware when a participant is assigned. */
  protected rolePillLabel(
    roleKey: string,
    participantGender?: MemberGender | null,
    hasAssignee = false,
  ): string {
    const key = roleKey as RoleKey
    if (hasAssignee) {
      const emoji = ROLE_EMOJIS[key] ?? '•'
      return `${emoji} ${getRoleLabel(key, participantGender)}`
    }
    return auditRoleDisplay(roleKey)
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

  private viewerGenderLoad: Promise<MemberGender | undefined> | null = null

  private loadViewerGender(): Promise<MemberGender | undefined> {
    if (!this.viewerGenderLoad) {
      this.viewerGenderLoad = this.mePreferencesApi.getPreferences().then((prefs) => {
        const gender = prefs.ok ? prefs.data?.gender : undefined
        return gender === 'male' || gender === 'female' ? gender : undefined
      })
    }
    return this.viewerGenderLoad
  }

  private async resolveParticipationRoleGender(
    mode: 'self' | 'proxy',
    slotGender: MemberGender | null | undefined,
  ): Promise<MemberGender | undefined> {
    if (mode === 'proxy') {
      return slotGender ?? undefined
    }
    const viewerGender = await this.loadViewerGender()
    if (viewerGender === 'male' || viewerGender === 'female') {
      return viewerGender
    }
    return slotGender ?? undefined
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
    const roleGender = await this.resolveParticipationRoleGender(
      options.mode,
      slot.participantGender,
    )
    const dialogRef = this.dialog.open<
      CompositionParticipationDialog,
      CompositionParticipationDialogData,
      CompositionParticipationDialogResult | undefined
    >(CompositionParticipationDialog, {
      data: {
        eventTitle: ev.title,
        eventDate: ev.startsAt,
        roleLabel: getRoleLabel(row.roleKey as RoleKey, roleGender),
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
    this.applyCompositionUpdate(result.data)
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

  protected async fillGaps(): Promise<void> {
    if (!this.canFillGaps()) {
      return
    }
    this.drawing.set(true)
    this.beginDrawPrepare({ preserveExistingSlots: true })
    const seasonId = this.seasonId()
    const eventId = this.event().id
    const result = await this.compositionApi.drawComposition(seasonId, eventId, 'fillEmpty')
    this.drawing.set(false)
    if (this.event().id !== eventId) {
      this.restoreDrawPrepareSnapshot()
      return
    }
    if (!result.ok || !result.data) {
      this.restoreDrawPrepareSnapshot()
      const message =
        result.status === 403
          ? 'Vous ne pouvez pas compléter cette composition.'
          : result.status === 409
            ? 'Aucun créneau à compléter ou composition verrouillée.'
            : 'Complétion impossible.'
      this.snack.open(message, 'OK', { duration: 6000 })
      return
    }

    if (this.prefersReducedMotion() || result.data.steps.length === 0) {
      this.clearDrawPrepareSnapshot()
      this.applyCompositionUpdate(result.data.composition)
      this.snack.open('Créneaux complétés.', 'OK', { duration: 4000 })
      return
    }

    this.startDrawAnimation(result.data.composition, result.data.steps, { preserveExistingSlots: true })
  }

  protected async restoreDecline(declineId: string): Promise<void> {
    if (!this.canFillGaps() || this.restoringDeclineId() != null) {
      return
    }
    this.restoringDeclineId.set(declineId)
    const seasonId = this.seasonId()
    const eventId = this.event().id
    const result = await this.compositionApi.restoreDeclinedParticipant(
      seasonId,
      eventId,
      declineId,
    )
    this.restoringDeclineId.set(null)
    if (this.event().id !== eventId) {
      return
    }
    if (!result.ok || !result.data) {
      this.snack.open(
        this.restoreErrorMessage(result.status, result.errorMessage),
        'OK',
        { duration: 6000 },
      )
      return
    }
    this.applyCompositionUpdate(result.data)
    this.snack.open('Participant remis en composition.', 'OK', { duration: 4000 })
  }

  protected async draw(): Promise<void> {
    if (!this.canDraw()) {
      return
    }
    this.drawing.set(true)
    this.beginDrawPrepare({ preserveExistingSlots: false })
    const seasonId = this.seasonId()
    const eventId = this.event().id
    const result = await this.compositionApi.drawComposition(seasonId, eventId, 'full')
    this.drawing.set(false)
    if (this.event().id !== eventId) {
      this.restoreDrawPrepareSnapshot()
      return
    }
    if (!result.ok || !result.data) {
      this.restoreDrawPrepareSnapshot()
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
      this.clearDrawPrepareSnapshot()
      this.applyCompositionUpdate(result.data.composition)
      return
    }

    this.startDrawAnimation(result.data.composition, result.data.steps)
  }

  protected onDrawStepFinished(): void {
    const step = this.currentDrawStep()
    if (step) {
      this.applyDrawStepToComposition(step)
    }

    const next = this.drawStepIndex() + 1
    if (next < this.drawSteps().length) {
      this.drawStepIndex.set(next)
      return
    }
    this.animatingDraw.set(false)
    this.drawSteps.set([])
    const composition = this.pendingDrawComposition()
    this.pendingDrawComposition.set(null)
    if (composition) {
      this.applyCompositionUpdate(composition)
    }
  }

  private beginDrawPrepare(options: { preserveExistingSlots?: boolean }): void {
    const current = this.composition()
    this.drawPrepareSnapshot = current ? { ...current, slots: [...current.slots] } : null
    const shell: CompositionResponse = current ?? {
      publishedAt: null,
      validatedAt: null,
      visibility: 'organizerDraft',
      slots: [],
    }
    const initialSlots = options.preserveExistingSlots ? [...shell.slots] : []
    this.composition.set({ ...shell, slots: initialSlots })
  }

  private restoreDrawPrepareSnapshot(): void {
    if (this.drawPrepareSnapshot) {
      this.composition.set(this.drawPrepareSnapshot)
    }
    this.drawPrepareSnapshot = null
  }

  private clearDrawPrepareSnapshot(): void {
    this.drawPrepareSnapshot = null
  }

  private startDrawAnimation(
    finalComposition: CompositionResponse,
    steps: CompositionDrawStep[],
    options: { preserveExistingSlots?: boolean } = {},
  ): void {
    this.clearDrawPrepareSnapshot()
    const initialSlots = options.preserveExistingSlots
      ? [...(this.composition()?.slots ?? [])]
      : []
    this.pendingDrawComposition.set(finalComposition)
    this.composition.set({ ...finalComposition, slots: initialSlots })
    this.drawSteps.set(steps)
    this.drawStepIndex.set(0)
    this.animatingDraw.set(true)
  }

  /** Reveal one slot in the grid when its draw step animation completes. */
  private applyDrawStepToComposition(step: CompositionDrawStep): void {
    const comp = this.composition()
    if (!comp) {
      return
    }
    const participantId = step.selectedParticipantId
    if (!participantId) {
      return
    }
    const selectedCandidate = step.candidates.find((c) => c.participantId === participantId)
    const pendingSlot = this.pendingDrawComposition()?.slots.find(
      (s) => s.roleKey === step.roleKey && s.slotIndex === step.slotIndex,
    )
    const displayName =
      selectedCandidate?.displayName ?? pendingSlot?.participantDisplayName ?? null
    const slots = [...comp.slots]
    const existingIndex = slots.findIndex(
      (s) => s.roleKey === step.roleKey && s.slotIndex === step.slotIndex,
    )
    const slot: CompositionSlot = {
      roleKey: step.roleKey,
      slotIndex: step.slotIndex,
      participantId,
      participantDisplayName: displayName,
      participantAvatarUrl: pendingSlot?.participantAvatarUrl ?? null,
      participantGender:
        pendingSlot?.participantGender ??
        (selectedCandidate?.gender != null
          ? effectiveMemberGender(selectedCandidate.gender)
          : null),
      participationStatus: 'pending',
      consecutiveShowWarning: pendingSlot?.consecutiveShowWarning ?? null,
      multiRoleOnEventWarning: pendingSlot?.multiRoleOnEventWarning ?? null,
    }
    if (existingIndex >= 0) {
      slots[existingIndex] = slot
    } else {
      slots.push(slot)
    }
    this.composition.set({ ...comp, slots })
  }

  protected canShowChanceBreakdown(): boolean {
    return canShowCompositionExplainability(this.canManageComposition(), this.composition())
  }

  protected canOpenRolePoolPreview(): boolean {
    return this.canManageComposition() && this.rolesWithCandidates().length > 0
  }

  protected rolesWithCandidates(): string[] {
    const slots = normalizeRoleSlots(this.event().roleSlots)
    return rolesWithSlots(slots)
  }

  protected rolePoolPreviewAnchorKey(row: SlotRow): string {
    return row.roleKey
  }

  protected isRolePoolPreviewOpen(row: SlotRow): boolean {
    return this.poolPreviewAnchorKey() === this.rolePoolPreviewAnchorKey(row)
  }

  protected rolePoolPreviewAriaLabel(row: SlotRow): string {
    const role = this.rolePillLabel(
      row.roleKey,
      row.slot?.participantGender,
      !!row.slot?.participantId,
    )
    return this.isRolePoolPreviewOpen(row)
      ? `Masquer le pool du tirage pour ${role}`
      : `Voir le pool du tirage pour ${role}`
  }

  protected async toggleRolePoolPreview(event: Event, row: SlotRow): Promise<void> {
    event.stopPropagation()
    if (!this.canOpenRolePoolPreview()) {
      return
    }
    const anchorKey = this.rolePoolPreviewAnchorKey(row)
    if (this.poolPreviewAnchorKey() === anchorKey) {
      this.poolPreviewAnchorKey.set(null)
      return
    }
    this.poolPreviewAnchorKey.set(anchorKey)
    this.poolPreviewRoleKey.set(row.roleKey)
    await this.loadPoolPreview(row.roleKey)
  }

  private async loadPoolPreview(roleKey: string): Promise<void> {
    const generation = ++this.poolPreviewGeneration
    this.poolPreviewLoading.set(true)
    this.poolPreviewError.set(null)
    try {
      const result = await this.compositionApi.getPoolPreview(
        this.seasonId(),
        this.event().id,
        roleKey,
      )
      if (generation !== this.poolPreviewGeneration) {
        return
      }
      if (result.ok && result.data) {
        this.poolPreviewSegments.set(result.data.segments)
      } else {
        this.poolPreviewSegments.set([])
        this.poolPreviewError.set(
          result.errorMessage ?? 'Impossible de charger le pool pour ce rôle.',
        )
      }
    } finally {
      if (generation === this.poolPreviewGeneration) {
        this.poolPreviewLoading.set(false)
      }
    }
  }

  protected async onPoolPreviewSegmentTap(event: {
    participantId: string
    chancePercent: number
  }): Promise<void> {
    const roleKey = this.poolPreviewRoleKey()
    if (!roleKey || !this.canShowChanceBreakdown()) {
      return
    }
    await this.chanceBreakdown.open({
      seasonId: this.seasonId(),
      eventId: this.event().id,
      roleKey,
      participantId: event.participantId,
      viewerParticipantIds: [...this.viewerParticipantIds()],
    })
  }

  protected async onDrawSegmentTap(event: {
    participantId: string
    chancePercent: number
  }): Promise<void> {
    const step = this.currentDrawStep()
    if (!step || !this.canShowChanceBreakdown()) {
      return
    }
    await this.chanceBreakdown.open({
      seasonId: this.seasonId(),
      eventId: this.event().id,
      roleKey: step.roleKey,
      participantId: event.participantId,
      viewerParticipantIds: [...this.viewerParticipantIds()],
      stepBanner: `Étape ${this.drawStepIndex() + 1}/${this.drawSteps().length} — ${getRoleLabel(step.roleKey as RoleKey)}`,
    })
  }

  protected async openSlotChanceBreakdown(event: Event, row: SlotRow): Promise<void> {
    event.stopPropagation()
    const slot = row.slot
    if (!slot?.participantId || slot.chancePercent == null || !this.canShowChanceBreakdown()) {
      return
    }
    await this.chanceBreakdown.open({
      seasonId: this.seasonId(),
      eventId: this.event().id,
      roleKey: row.roleKey,
      participantId: slot.participantId,
      viewerParticipantIds: [...this.viewerParticipantIds()],
    })
  }

  protected showSlotTrailing(row: SlotRow): boolean {
    return (
      this.canShowChanceBreakdown() &&
      row.slot?.chancePercent != null &&
      !!row.slot?.participantId
    )
  }

  protected slotBreakdownAriaLabel(row: SlotRow): string | null {
    const slot = row.slot
    if (!slot?.participantDisplayName || slot.chancePercent == null) {
      return null
    }
    return `Voir le détail de la cote : ${slot.participantDisplayName}, ${slot.chancePercent} pourcent`
  }

  protected async openSlotPicker(row: SlotRow): Promise<void> {
    if (!this.canEditSlots() && !this.canTapGapSlot(row)) {
      return
    }
    const seasonId = this.seasonId()
    const eventId = this.event().id
    const dialogRef = this.dialog.open<
      CompositionSlotPickerDialog,
      CompositionSlotPickerDialogData,
      CompositionSlotPickerDialogResult | undefined
    >(CompositionSlotPickerDialog, {
      data: {
        roleLabel: getRoleLabel(
          row.roleKey as RoleKey,
          row.slot?.participantGender,
        ),
        roleKey: row.roleKey,
        seasonId,
        eventId,
        explainabilityEnabled: this.canShowChanceBreakdown(),
        viewerParticipantIds: [...this.viewerParticipantIds()],
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
    this.applyCompositionUpdate(result.data)
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

  private restoreErrorMessage(status: number, apiMessage?: string): string {
    if (apiMessage) {
      return apiMessage
    }
    switch (status) {
      case 403:
        return 'Vous ne pouvez pas remettre ce participant en composition.'
      case 404:
        return 'Déclin introuvable.'
      case 409:
        return 'Aucun créneau vide pour ce rôle ou composition non verrouillée.'
      default:
        return 'Remise en composition impossible.'
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
    this.applyCompositionUpdate(result.data)
    this.analytics.captureCompositionValidated(
      this.analytics.eventContext(eventId, seasonId, this.troupeId()),
      { validated_at: result.data.validatedAt ?? new Date().toISOString() },
    )
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
    this.applyCompositionUpdate(result.data)
    this.snack.open('Composition déverrouillée.', 'OK', { duration: 4000 })
  }

  private applyCompositionUpdate(next: CompositionResponse): void {
    const prev = this.composition()
    const roleSlots = normalizeRoleSlots(this.event().roleSlots)
    const prevLifecycle = computeRawCompositionLifecycle(prev, roleSlots)
    this.composition.set(next)
    this.compositionPublished.emit(next)
    const nextLifecycle = computeRawCompositionLifecycle(next, roleSlots)
    if (nextLifecycle === 'complete' && prevLifecycle !== 'complete') {
      this.analytics.captureCompositionAllConfirmationsReceived(
        this.analytics.eventContext(this.event().id, this.seasonId(), this.troupeId()),
        {
          validated_at: next.validatedAt ?? null,
          completed_at: new Date().toISOString(),
        },
      )
    }
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
    this.poolPreviewAnchorKey.set(null)
    this.poolPreviewRoleKey.set(null)
    this.poolPreviewSegments.set([])
    this.poolPreviewError.set(null)
  }
}
