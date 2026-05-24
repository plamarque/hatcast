import { Component, computed, effect, inject, input, output, signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'

import {
  CompositionApiService,
  type CompositionResponse,
  type CompositionSlot,
} from '../../core/composition/composition-api.service'
import { showPublishButton } from '../../core/composition/composition-visibility'
import type { EventResponse } from '../../core/events/event-api.service'
import {
  normalizeRoleSlots,
  ROLE_DISPLAY_ORDER,
  ROLE_EMOJIS,
  ROLE_LABELS,
  type RoleKey,
} from '../../core/events/event-types'
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
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    EventEquipeEmpty,
  ],
  templateUrl: './event-equipe-tab.html',
  styleUrl: './event-equipe-tab.scss',
})
export class EventEquipeTab {
  private readonly compositionApi = inject(CompositionApiService)
  private readonly snack = inject(MatSnackBar)

  readonly seasonId = input.required<string>()
  readonly event = input.required<EventResponse>()
  readonly canManageComposition = input(false)
  readonly showConfirmPending = input(false)

  readonly compositionPublished = output<void>()

  protected readonly loading = signal(true)
  protected readonly loadError = signal(false)
  protected readonly publishing = signal(false)
  protected readonly composition = signal<CompositionResponse | null>(null)

  protected readonly showEmptyState = computed(
    () => !this.loading() && !this.loadError() && this.slotRows().length === 0,
  )

  protected readonly showDraftBanner = computed(() => {
    const comp = this.composition()
    return this.canManageComposition() && comp?.visibility === 'organizerDraft'
  })

  protected readonly canPublish = computed(() =>
    showPublishButton(this.composition(), this.canManageComposition()),
  )

  protected readonly slotRows = computed((): SlotRow[] => {
    const ev = this.event()
    const comp = this.composition()
    if (!comp || comp.slots.length === 0) {
      return []
    }
    const roleSlots = normalizeRoleSlots(ev.roleSlots)
    const slotsByKey = new Map<string, CompositionSlot>()
    for (const slot of comp.slots) {
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
    let previousEventId: string | null = null
    effect(() => {
      const eventId = this.event().id
      const seasonId = this.seasonId()
      if (eventId !== previousEventId) {
        previousEventId = eventId
        void this.load(seasonId, eventId)
      }
    })
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
