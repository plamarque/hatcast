import { Component, computed, effect, inject, input, OnDestroy, output, signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar } from '@angular/material/snack-bar'

import {
  AvailabilityApiService,
  type EventAvailabilitySummary,
} from '../../core/availability/availability-api.service'
import type { EventResponse } from '../../core/events/event-api.service'
import { isEventDraft } from '../../core/events/event-draft'
import type { ParticipantSelector } from '../../core/participants/participant-api.service'
import { AvailabilityPoll, type AvailabilityPollSavedPayload } from './availability-poll'
import { AvailabilitySubjectSelector } from './availability-subject-selector'
import { summaryParticipantsToSelectors } from './availability-subject-options'

@Component({
  selector: 'app-event-dispos-tab',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    AvailabilityPoll,
    AvailabilitySubjectSelector,
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

  readonly summaryChanged = output<EventAvailabilitySummary>()

  protected readonly loading = signal(true)
  protected readonly loadError = signal(false)
  protected readonly summary = signal<EventAvailabilitySummary | null>(null)
  protected readonly subjectParticipantId = signal<string>('')

  private summaryGeneration = 0
  private destroyed = false

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
        this.subjectParticipantId.set('')
        this.loadError.set(false)
        void this.load()
      }
    })
  }

  ngOnDestroy(): void {
    this.destroyed = true
    this.summaryGeneration++
  }

  protected onSubjectChange(participantId: string): void {
    this.subjectParticipantId.set(participantId)
  }

  protected proxyHintAriaLabel(displayName: string): string {
    return `Tu modifies les dispos de ${displayName}. Chaque vote s'enregistre au clic.`
  }

  protected onSummaryPatch(next: EventAvailabilitySummary): void {
    this.summary.set(next)
    this.summaryChanged.emit(next)
  }

  protected onSaved(payload: AvailabilityPollSavedPayload): void {
    this.patchSubjectInSummary(payload)
  }

  private patchSubjectInSummary(payload: AvailabilityPollSavedPayload): void {
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
    const summaryResult = await this.availabilityApi.getEventAvailabilitySummary(
      this.seasonId(),
      this.event().id,
      false,
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

    const selfParticipant = summaryResult.data.participants.find(
      (p) => p.userId === this.currentUserId(),
    )
    if (selfParticipant) {
      this.subjectParticipantId.set(selfParticipant.participantId)
    }
  }
}
