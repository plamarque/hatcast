import { Component, input, model } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatButtonToggleModule } from '@angular/material/button-toggle'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'

import type { EventFilterOption, ParticipantFilterOption, SeasonView } from './season-view.types'

@Component({
  selector: 'app-season-view-toolbar',
  imports: [MatButtonModule, MatButtonToggleModule, MatIconModule, MatMenuModule],
  templateUrl: './season-view-toolbar.html',
  styleUrl: './season-view-toolbar.scss',
})
export class SeasonViewToolbar {
  readonly seasonView = model.required<SeasonView>()
  readonly showFilters = input(true)

  /** Participant filter — MVP: only Tous until player/availability data exists. */
  readonly participantOptions = input<ParticipantFilterOption[]>([
    { id: null, label: 'Tous' },
  ])
  readonly selectedParticipantId = model<string | null>(null)

  readonly eventOptions = input<EventFilterOption[]>([])
  readonly selectedEventId = model<string | null>(null)

  protected participantLabel(): string {
    const id = this.selectedParticipantId()
    const opt = this.participantOptions().find((o) => o.id === id)
    return opt?.label ?? 'Tous'
  }

  protected eventLabel(): string {
    const id = this.selectedEventId()
    if (!id) {
      return 'Tous'
    }
    return this.eventOptions().find((o) => o.id === id)?.title ?? 'Tous'
  }

  protected selectParticipant(id: string | null): void {
    this.selectedParticipantId.set(id)
  }

  protected selectEvent(id: string | null): void {
    this.selectedEventId.set(id)
  }
}
