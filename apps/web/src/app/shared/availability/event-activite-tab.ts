import { Component, computed, effect, inject, input, OnDestroy, signal } from '@angular/core'
import { MatButtonToggleModule } from '@angular/material/button-toggle'
import { PageEvent } from '@angular/material/paginator'

import { AuditApiService, type AuditEventRow } from '../../core/audit/audit-api.service'
import type { EventResponse } from '../../core/events/event-api.service'
import {
  ParticipantApiService,
  type ParticipantSelector,
} from '../../core/participants/participant-api.service'
import { AvailabilitySubjectSelector } from './availability-subject-selector'
import { AuditJournalList } from '../audit-journal-list/audit-journal-list'

export type ActiviteViewMode = 'moi' | 'tous'

@Component({
  selector: 'app-event-activite-tab',
  imports: [MatButtonToggleModule, AvailabilitySubjectSelector, AuditJournalList],
  templateUrl: './event-activite-tab.html',
  styleUrl: './event-activite-tab.scss',
})
export class EventActiviteTab implements OnDestroy {
  private readonly auditApi = inject(AuditApiService)
  private readonly participantApi = inject(ParticipantApiService)

  readonly seasonId = input.required<string>()
  readonly troupeId = input.required<string>()
  readonly event = input.required<EventResponse>()
  readonly currentUserId = input.required<string>()
  readonly canViewAuditEvent = input(false)
  readonly canSwitchSubject = input(false)
  readonly linkedParticipantId = input<string | null>(null)
  readonly linkedParticipantName = input<string | null>(null)

  protected readonly viewMode = signal<ActiviteViewMode>('moi')
  protected readonly subjectParticipantId = signal('')
  protected readonly selectors = signal<ParticipantSelector[]>([])
  protected readonly loading = signal(true)
  protected readonly loadError = signal(false)
  protected readonly rows = signal<AuditEventRow[]>([])
  protected readonly page = signal(0)
  protected readonly pageSize = signal(25)
  protected readonly totalElements = signal(0)
  private loadRequestId = 0
  private lastBootstrappedEventId: string | null = null

  protected readonly showTousToggle = computed(() => this.canViewAuditEvent())
  protected readonly emptyLabel = computed(() => {
    if (this.viewMode() === 'moi') {
      return "Aucune activité te concernant pour ce filtre."
    }
    return 'Aucune activité enregistrée pour ce spectacle.'
  })
  protected readonly formatOptions = computed(() => ({
    moiMode: this.viewMode() === 'moi',
    timePrecision: this.viewMode() === 'moi' ? ('minutes' as const) : ('seconds' as const),
    viewerParticipantName: this.filteredParticipantName(),
  }))

  constructor() {
    effect(() => {
      const eventId = this.event().id
      if (!eventId || eventId === this.lastBootstrappedEventId) return
      this.lastBootstrappedEventId = eventId
      void this.bootstrap()
    })

    effect(
      () => {
        const linked = this.linkedParticipantId()
        if (!linked || this.subjectParticipantId()) return
        if (this.viewMode() === 'moi' || !this.canViewAuditEvent()) {
          this.subjectParticipantId.set(linked)
          if (!this.loading()) {
            void this.reload()
          }
        }
      },
      { allowSignalWrites: true },
    )
  }

  ngOnDestroy(): void {
    this.loadRequestId++
  }

  protected setViewMode(mode: ActiviteViewMode): void {
    if (this.viewMode() === mode) return
    if (mode === 'moi') {
      this.ensureSubjectParticipantForMoi()
    } else {
      this.subjectParticipantId.set('')
    }
    this.viewMode.set(mode)
    this.page.set(0)
    void this.reload()
  }

  protected onSubjectChange(participantId: string): void {
    if (!participantId || this.subjectParticipantId() === participantId) return
    this.subjectParticipantId.set(participantId)
    this.page.set(0)
    void this.reload()
  }

  protected onPage(event: PageEvent): void {
    this.page.set(event.pageIndex)
    this.pageSize.set(event.pageSize)
    void this.reload()
  }

  protected retryLoad(): void {
    void this.reload()
  }

  private ensureSubjectParticipantForMoi(): void {
    if (this.subjectParticipantId()) return
    const linked = this.linkedParticipantId()
    if (linked) {
      this.subjectParticipantId.set(linked)
    }
  }

  private filteredParticipantName(): string | null {
    const selectedId = this.subjectParticipantId()
    if (selectedId) {
      const selected = this.selectors().find((p) => p.id === selectedId)
      if (selected) return selected.displayName
    }
    return this.linkedParticipantName()
  }

  private async reload(): Promise<void> {
    const requestId = ++this.loadRequestId
    this.loading.set(true)
    this.loadError.set(false)
    await this.loadRows(requestId)
    if (requestId === this.loadRequestId) {
      this.loading.set(false)
    }
  }

  private async bootstrap(): Promise<void> {
    const requestId = ++this.loadRequestId
    this.loading.set(true)
    this.loadError.set(false)
    this.subjectParticipantId.set('')
    this.viewMode.set(this.canViewAuditEvent() ? 'tous' : 'moi')

    const selectorsRes = await this.participantApi.listSeasonParticipantSelectors(this.seasonId())
    if (requestId !== this.loadRequestId) return
    if (selectorsRes.ok && selectorsRes.data) {
      this.selectors.set(selectorsRes.data)
    }

    if (this.viewMode() === 'moi') {
      this.ensureSubjectParticipantForMoi()
    }

    await this.loadRows(requestId)
    if (requestId === this.loadRequestId) {
      this.loading.set(false)
    }
  }

  private participantFilterId(): string | undefined {
    if (this.viewMode() !== 'moi') return undefined
    return this.subjectParticipantId() || this.linkedParticipantId() || undefined
  }

  private async loadRows(expectedRequestId: number): Promise<void> {
    const ev = this.event()
    const mode = this.viewMode()
    const participantFilterId = this.participantFilterId()

    if (mode === 'tous' && !this.canViewAuditEvent()) {
      this.rows.set([])
      this.totalElements.set(0)
      return
    }
    if (mode === 'moi' && !participantFilterId) {
      this.rows.set([])
      this.totalElements.set(0)
      return
    }

    const res = await this.auditApi.listEvents({
      troupeId: this.troupeId(),
      seasonId: this.seasonId(),
      eventId: ev.id,
      participantSeasonParticipantId: participantFilterId,
      page: this.page(),
      size: this.pageSize(),
    })
    if (expectedRequestId !== this.loadRequestId) return
    if (!res.ok) {
      this.loadError.set(true)
      this.rows.set([])
      this.totalElements.set(0)
      return
    }
    this.loadError.set(false)
    this.rows.set(res.data?.content ?? [])
    this.totalElements.set(res.data?.totalElements ?? 0)
  }
}
