import { Component, computed, effect, inject, input, OnDestroy, output, signal, viewChild } from '@angular/core'
import { MatButtonToggleModule } from '@angular/material/button-toggle'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar } from '@angular/material/snack-bar'

import {
  AvailabilityApiService,
  type EventAvailabilitySummary,
  type SummaryParticipant,
} from '../../core/availability/availability-api.service'
import type { EventResponse } from '../../core/events/event-api.service'
import { ParticipantApiService, type ParticipantSelector } from '../../core/participants/participant-api.service'
import { AvailabilityMoiPanel } from './availability-moi-panel'
import { AvailabilitySubjectSelector } from './availability-subject-selector'
import { AvailabilityTousPanel } from './availability-tous-panel'

export type DisposViewMode = 'moi' | 'tous'

@Component({
  selector: 'app-event-dispos-tab',
  imports: [
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

  readonly seasonId = input.required<string>()
  readonly troupeId = input.required<string>()
  readonly event = input.required<EventResponse>()
  readonly currentUserId = input.required<string>()
  readonly canSwitchSubject = input(false)

  readonly viewModeChange = output<DisposViewMode>()

  protected readonly loading = signal(true)
  protected readonly loadError = signal(false)
  protected readonly summary = signal<EventAvailabilitySummary | null>(null)
  protected readonly selectors = signal<ParticipantSelector[]>([])
  protected readonly viewMode = signal<DisposViewMode>('moi')
  protected readonly subjectParticipantId = signal<string>('')

  private readonly moiPanel = viewChild(AvailabilityMoiPanel)
  private loadRequestId = 0

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

  protected readonly subjectProxyMode = computed(() => {
    const subject = this.subjectParticipant()
    if (!subject || !this.canSwitchSubject()) return false
    return subject.userId !== this.currentUserId()
  })

  constructor() {
    // Reload whenever the event identity changes (e.g. intra-route navigation).
    let previousEventId: string | null = null
    effect(() => {
      const eventId = this.event().id
      if (eventId !== previousEventId) {
        previousEventId = eventId
        this.summary.set(null)
        this.subjectParticipantId.set('')
        this.loadError.set(false)
        void this.load()
      }
    })
  }

  ngOnDestroy(): void {
    // Invalidate any in-flight request.
    this.loadRequestId++
  }

  protected setViewMode(mode: DisposViewMode): void {
    this.viewMode.set(mode)
    this.viewModeChange.emit(mode)
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
    this.setViewMode('moi')
    queueMicrotask(() => this.moiPanel()?.syncSubject(participant))
  }

  protected async onSaved(): Promise<void> {
    await this.reloadSummary()
  }

  protected async retryLoad(): Promise<void> {
    this.loadError.set(false)
    await this.load()
  }

  private async load(): Promise<void> {
    this.loading.set(true)
    const requestId = ++this.loadRequestId
    const [summaryResult, selectorsResult] = await Promise.all([
      this.availabilityApi.getEventAvailabilitySummary(this.seasonId(), this.event().id),
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
    if (selectorsResult.ok && selectorsResult.data) {
      this.selectors.set(selectorsResult.data)
    }

    const selfParticipant = summaryResult.data.participants.find(
      (p) => p.userId === this.currentUserId(),
    )
    if (selfParticipant) {
      this.subjectParticipantId.set(selfParticipant.participantId)
    }
    // No fallback to participants[0]: if the current user has no linked participant,
    // leave subjectParticipantId empty so the Moi panel shows an empty state.
  }

  private async reloadSummary(): Promise<void> {
    const requestId = ++this.loadRequestId
    const result = await this.availabilityApi.getEventAvailabilitySummary(
      this.seasonId(),
      this.event().id,
    )
    if (requestId !== this.loadRequestId) return
    if (!result.ok || !result.data) return
    this.summary.set(result.data)

    const currentId = this.subjectParticipantId()
    const subject = result.data.participants.find((p) => p.participantId === currentId)
    if (subject) {
      queueMicrotask(() => this.moiPanel()?.syncSubject(subject))
    } else if (currentId) {
      // Subject disappeared from summary after reload — reset to self.
      const self = result.data.participants.find((p) => p.userId === this.currentUserId())
      this.subjectParticipantId.set(self?.participantId ?? '')
    }
  }
}
