import { Component, computed, effect, inject, input, OnDestroy, output, signal, viewChild } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatButtonToggleModule } from '@angular/material/button-toggle'
import { MatDialog } from '@angular/material/dialog'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar } from '@angular/material/snack-bar'

import {
  AvailabilityApiService,
  type EventAvailabilitySummary,
  type SummaryParticipant,
} from '../../core/availability/availability-api.service'
import type { EventResponse } from '../../core/events/event-api.service'
import { isEventDraft } from '../../core/events/event-draft'
import type { AvailabilityFormSavedPayload } from './availability-form'
import { ParticipantApiService, type ParticipantSelector } from '../../core/participants/participant-api.service'
import {
  ShareAnnounceDialog,
  type ShareAnnounceDialogData,
} from '../share-announce/share-announce-dialog'
import { AvailabilityMoiPanel } from './availability-moi-panel'
import { AvailabilitySubjectSelector } from './availability-subject-selector'
import { AvailabilityTousPanel } from './availability-tous-panel'

export type DisposViewMode = 'moi' | 'tous'

@Component({
  selector: 'app-event-dispos-tab',
  imports: [
    MatButtonModule,
    MatButtonToggleModule,
    MatProgressSpinnerModule,
    AvailabilityMoiPanel,
    AvailabilitySubjectSelector,
    AvailabilityTousPanel,
  ],
  templateUrl: './event-dispos-tab.html',
  styleUrl: './event-dispos-tab.scss',
})
export class EventDisposTab implements OnDestroy {
  private readonly availabilityApi = inject(AvailabilityApiService)
  private readonly participantApi = inject(ParticipantApiService)
  private readonly snack = inject(MatSnackBar)
  private readonly dialog = inject(MatDialog)

  readonly seasonId = input.required<string>()
  readonly seasonSlug = input.required<string>()
  readonly troupeSlug = input.required<string>()
  readonly troupeId = input.required<string>()
  readonly event = input.required<EventResponse>()
  readonly currentUserId = input.required<string>()
  readonly canSwitchSubject = input(false)
  readonly canManageComposition = input(false)

  readonly viewModeChange = output<DisposViewMode>()

  protected readonly loading = signal(true)
  protected readonly loadError = signal(false)
  protected readonly summary = signal<EventAvailabilitySummary | null>(null)
  protected readonly selectors = signal<ParticipantSelector[]>([])
  protected readonly viewMode = signal<DisposViewMode>('moi')
  protected readonly loadingChances = signal(false)
  protected readonly subjectParticipantId = signal<string>('')

  private readonly moiPanel = viewChild(AvailabilityMoiPanel)
  private loadRequestId = 0
  private summaryIncludesChances = false

  protected readonly subjectParticipant = computed(() => {
    const id = this.subjectParticipantId()
    const s = this.summary()
    if (!s || !id) return null
    return s.participants.find((p) => p.participantId === id) ?? null
  })

  protected readonly subjectReadOnly = computed(() => {
    const subject = this.subjectParticipant()
    if (!subject) return true
    if (subject.userId === this.currentUserId()) return false
    return !this.canSwitchSubject()
  })

  protected readonly draftBlocksMemberDispos = computed(
    () => isEventDraft(this.event()) && !this.canManageComposition(),
  )

  protected readonly canNudgeAvailability = computed(() => {
    if (!this.canManageComposition()) return false
    if (isEventDraft(this.event())) return false
    if (this.event().archived) return false
    const s = this.summary()
    if (!s) return false
    return s.participants.some((p) => p.status === 'unknown')
  })

  protected readonly subjectProxyMode = computed(() => {
    const subject = this.subjectParticipant()
    if (!subject || !this.canSwitchSubject()) return false
    return subject.userId !== this.currentUserId()
  })

  constructor() {
    let previousEventId: string | null = null
    effect(() => {
      const eventId = this.event().id
      if (eventId !== previousEventId) {
        previousEventId = eventId
        this.summary.set(null)
        this.summaryIncludesChances = false
        this.subjectParticipantId.set('')
        this.loadError.set(false)
        void this.load()
      }
    })
  }

  ngOnDestroy(): void {
    this.loadRequestId++
  }

  protected openNudgeDialog(): void {
    if (!this.canNudgeAvailability()) return
    const ev = this.event()
    const ref = this.dialog.open<ShareAnnounceDialog, ShareAnnounceDialogData, boolean | undefined>(
      ShareAnnounceDialog,
      {
        data: {
          intent: 'availability_nudge',
          seasonId: this.seasonId(),
          eventId: ev.id,
          troupeSlug: this.troupeSlug(),
          seasonSlug: this.seasonSlug(),
          eventSlug: ev.slug,
          eventTitle: ev.title,
          eventDateIso: ev.startsAt,
          roleLines: [],
        },
        width: 'min(42rem, 96vw)',
        maxHeight: '92vh',
        autoFocus: 'first-titled-element',
        panelClass: 'share-announce-dialog-panel',
      },
    )
    ref.afterClosed().subscribe((sent) => {
      if (sent) {
        this.snack.open('Rappel envoyé.', 'OK', { duration: 4000 })
      }
    })
  }

  protected async setViewMode(mode: DisposViewMode): Promise<void> {
    const enteringTous = mode === 'tous' && this.viewMode() !== 'tous'
    this.viewMode.set(mode)
    this.viewModeChange.emit(mode)
    if (enteringTous && !this.summaryIncludesChances) {
      await this.reloadSummaryWithChances()
    }
  }

  protected onSubjectChange(participantId: string): void {
    this.subjectParticipantId.set(participantId)
    const subject = this.summary()?.participants.find((p) => p.participantId === participantId)
    if (subject) {
      queueMicrotask(() => this.moiPanel()?.syncSubject(subject))
    }
  }

  protected onParticipantFromTous(participant: SummaryParticipant): void {
    if (!this.canSwitchSubject()) return
    this.subjectParticipantId.set(participant.participantId)
    void this.setViewMode('moi')
    queueMicrotask(() => this.moiPanel()?.syncSubject(participant))
  }

  protected onSaved(payload: AvailabilityFormSavedPayload): void {
    this.patchSubjectInSummary(payload)
    const needsFullReload =
      this.viewMode() === 'tous' ||
      this.summaryIncludesChances ||
      payload.scope === 'details'
    if (needsFullReload) {
      void this.reloadSummary(this.viewMode() === 'tous' || this.summaryIncludesChances)
    }
  }

  private patchSubjectInSummary(payload: AvailabilityFormSavedPayload): void {
    const participantId = this.subjectParticipantId()
    const current = this.summary()
    if (!participantId || !current) return

    const participants = current.participants.map((p) =>
      p.participantId === participantId
        ? {
            ...p,
            status: payload.status,
            roleKeys: payload.roleKeys,
            comment: payload.comment,
          }
        : p,
    )
    this.summary.set({ ...current, participants })

    const subject = participants.find((p) => p.participantId === participantId)
    if (subject) {
      queueMicrotask(() => this.moiPanel()?.syncSubject(subject))
    }
  }

  protected async retryLoad(): Promise<void> {
    this.loadError.set(false)
    await this.load()
  }

  private async load(): Promise<void> {
    if (this.draftBlocksMemberDispos()) {
      this.loading.set(false)
      this.loadError.set(false)
      this.summary.set(null)
      return
    }
    this.loading.set(true)
    const requestId = ++this.loadRequestId
    const [summaryResult, selectorsResult] = await Promise.all([
      this.availabilityApi.getEventAvailabilitySummary(this.seasonId(), this.event().id, false),
      this.participantApi.listSeasonParticipantSelectors(this.seasonId()),
    ])

    if (requestId !== this.loadRequestId) return

    this.loading.set(false)

    if (!summaryResult.ok || !summaryResult.data) {
      this.loadError.set(true)
      this.snack.open('Impossible de charger les disponibilités.', 'OK', { duration: 6000 })
      return
    }

    this.summary.set(summaryResult.data)
    this.summaryIncludesChances = false
    if (selectorsResult.ok && selectorsResult.data) {
      this.selectors.set(selectorsResult.data)
    }

    const selfParticipant = summaryResult.data.participants.find(
      (p) => p.userId === this.currentUserId(),
    )
    if (selfParticipant) {
      this.subjectParticipantId.set(selfParticipant.participantId)
    }
  }

  private async reloadSummaryWithChances(): Promise<void> {
    this.loadingChances.set(true)
    await this.reloadSummary(true)
    this.loadingChances.set(false)
  }

  private async reloadSummary(includeChances: boolean): Promise<void> {
    const requestId = ++this.loadRequestId
    const result = await this.availabilityApi.getEventAvailabilitySummary(
      this.seasonId(),
      this.event().id,
      includeChances,
    )
    if (requestId !== this.loadRequestId) return
    if (!result.ok || !result.data) return
    this.summary.set(result.data)
    this.summaryIncludesChances = includeChances

    const currentId = this.subjectParticipantId()
    const subject = result.data.participants.find((p) => p.participantId === currentId)
    if (subject) {
      queueMicrotask(() => this.moiPanel()?.syncSubject(subject))
    } else if (currentId) {
      const self = result.data.participants.find((p) => p.userId === this.currentUserId())
      this.subjectParticipantId.set(self?.participantId ?? '')
    }
  }
}
