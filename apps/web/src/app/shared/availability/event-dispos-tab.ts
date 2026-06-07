import { Component, computed, effect, inject, input, OnDestroy, output, signal, viewChild } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatButtonToggleModule } from '@angular/material/button-toggle'
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
import type { ParticipantSelector } from '../../core/participants/participant-api.service'
import { summaryParticipantsToSelectors } from './availability-subject-options'
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
  private readonly snack = inject(MatSnackBar)

  readonly seasonId = input.required<string>()
  readonly seasonSlug = input.required<string>()
  readonly troupeSlug = input.required<string>()
  readonly troupeId = input.required<string>()
  readonly event = input.required<EventResponse>()
  readonly currentUserId = input.required<string>()
  readonly canSwitchSubject = input(false)
  readonly canManageComposition = input(false)
  readonly explainabilityEnabled = input(false)

  readonly viewModeChange = output<DisposViewMode>()
  readonly summaryChanged = output<EventAvailabilitySummary>()

  protected readonly loading = signal(true)
  protected readonly loadError = signal(false)
  protected readonly summary = signal<EventAvailabilitySummary | null>(null)
  protected readonly viewMode = signal<DisposViewMode>('moi')
  protected readonly loadingChances = signal(false)
  protected readonly subjectParticipantId = signal<string>('')

  private readonly moiPanel = viewChild(AvailabilityMoiPanel)
  private summaryGeneration = 0
  private chancesLoadGeneration = 0
  private destroyed = false
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

  protected readonly subjectProxyMode = computed(() => {
    const subject = this.subjectParticipant()
    if (!subject || !this.canSwitchSubject()) return false
    return subject.userId !== this.currentUserId()
  })

  /** Event-scoped roster (season + event-only, minus exclusions) — same pool as summary / Tous. */
  protected readonly subjectSelectorOptions = computed((): ParticipantSelector[] =>
    summaryParticipantsToSelectors(this.summary()?.participants ?? []),
  )

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
    this.destroyed = true
    this.summaryGeneration++
    this.chancesLoadGeneration++
  }

  protected async setViewMode(mode: DisposViewMode): Promise<void> {
    if (mode !== 'moi' && mode !== 'tous') {
      return
    }
    const enteringTous = mode === 'tous' && this.viewMode() !== 'tous'
    this.viewMode.set(mode)
    this.viewModeChange.emit(mode)
    if (mode === 'tous' && (enteringTous || !this.summaryHasChancePercents(this.summary()))) {
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
    const next = { ...current, participants }
    this.summary.set(next)
    this.summaryChanged.emit(next)

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
    const generation = ++this.summaryGeneration
    const includeChances = this.viewMode() === 'tous' && this.explainabilityEnabled()
    const summaryResult = await this.availabilityApi.getEventAvailabilitySummary(
      this.seasonId(),
      this.event().id,
      includeChances,
    )

    if (this.destroyed || generation !== this.summaryGeneration) return

    this.loading.set(false)

    if (!summaryResult.ok || !summaryResult.data) {
      this.loadError.set(true)
      this.snack.open('Impossible de charger les disponibilités.', 'OK', { duration: 6000 })
      return
    }

    this.summary.set(summaryResult.data)
    this.summaryChanged.emit(summaryResult.data)
    this.summaryIncludesChances = includeChances

    const selfParticipant = summaryResult.data.participants.find(
      (p) => p.userId === this.currentUserId(),
    )
    if (selfParticipant) {
      this.subjectParticipantId.set(selfParticipant.participantId)
    }
  }

  private async reloadSummaryWithChances(): Promise<void> {
    this.loadingChances.set(true)
    const generation = ++this.chancesLoadGeneration
    try {
      const result = await this.availabilityApi.getEventAvailabilitySummary(
        this.seasonId(),
        this.event().id,
        true,
      )
      if (this.destroyed || generation !== this.chancesLoadGeneration) {
        return
      }
      if (!result.ok || !result.data) {
        this.snack.open('Impossible de charger les pourcentages.', 'OK', { duration: 6000 })
        return
      }
      this.summary.set(result.data)
      this.summaryChanged.emit(result.data)
      this.summaryIncludesChances = true

      const currentId = this.subjectParticipantId()
      const subject = result.data.participants.find((p) => p.participantId === currentId)
      if (subject) {
        queueMicrotask(() => this.moiPanel()?.syncSubject(subject))
      }
    } finally {
      if (generation === this.chancesLoadGeneration) {
        this.loadingChances.set(false)
      }
    }
  }

  private summaryHasChancePercents(summary: EventAvailabilitySummary | null): boolean {
    if (!summary?.roles.length) {
      return false
    }
    return summary.roles.some((role) =>
      role.candidates.some((candidate) => candidate.chancePercent != null),
    )
  }

  private async reloadSummary(includeChances: boolean): Promise<void> {
    const generation = ++this.summaryGeneration
    const result = await this.availabilityApi.getEventAvailabilitySummary(
      this.seasonId(),
      this.event().id,
      includeChances,
    )
    if (this.destroyed || generation !== this.summaryGeneration) return
    if (!result.ok || !result.data) {
      if (includeChances) {
        this.snack.open('Impossible de charger les pourcentages.', 'OK', { duration: 6000 })
      }
      return
    }
    this.summary.set(result.data)
    this.summaryChanged.emit(result.data)
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
