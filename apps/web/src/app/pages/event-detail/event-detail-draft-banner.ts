import { Component, computed, inject, input, output, signal } from '@angular/core'
import { isEventDraft } from '../../core/events/event-draft'
import { MatButtonModule } from '@angular/material/button'
import { MatChipsModule } from '@angular/material/chips'
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'

import type { EventResponse } from '../../core/events/event-api.service'
import { EventApiService } from '../../core/events/event-api.service'
import {
  ShareAnnounceDialog,
  type ShareAnnounceDialogData,
} from '../../shared/share-announce/share-announce-dialog'
import {
  ConfirmDialog,
  type ConfirmDialogData,
} from '../seasons-list/confirm-dialog'

@Component({
  selector: 'app-event-detail-draft-banner',
  imports: [MatButtonModule, MatChipsModule, MatDialogModule, MatSnackBarModule],
  templateUrl: './event-detail-draft-banner.html',
  styleUrl: './event-detail-draft-banner.scss',
})
export class EventDetailDraftBanner {
  private readonly eventsApi = inject(EventApiService)
  private readonly snack = inject(MatSnackBar)
  private readonly dialog = inject(MatDialog)

  readonly event = input.required<EventResponse>()
  readonly seasonId = input.required<string>()
  readonly seasonSlug = input.required<string>()
  readonly canPublish = input(false)

  readonly eventUpdated = output<EventResponse>()

  protected readonly publishing = signal(false)

  protected readonly isDraft = computed(() => isEventDraft(this.event()))

  protected confirmPublish(): void {
    const ev = this.event()
    if (!ev || !this.canPublish() || !this.isDraft()) {
      return
    }
    const ref = this.dialog.open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
      data: {
        title: 'Publier le spectacle',
        message:
          `Publier « ${ev.title} » ? Les membres verront le spectacle dans l’agenda et pourront déposer leurs disponibilités. Tu pourras ensuite l’annoncer (message, WhatsApp…).`,
        confirmLabel: 'Publier',
      },
      width: 'min(100vw - 2rem, 28rem)',
    })
    ref.afterClosed().subscribe((ok) => {
      if (ok) {
        void this.runPublish(ev)
      }
    })
  }

  private async runPublish(ev: EventResponse): Promise<void> {
    const seasonId = this.seasonId()
    if (!seasonId) {
      return
    }
    this.publishing.set(true)
    try {
      const result = await this.eventsApi.openAvailabilityResilient(seasonId, ev.id)
      if (!result.ok || !result.data) {
        const message = result.errorMessage ?? 'Publication impossible.'
        this.snack.open(message, 'OK', { duration: 6000 })
        return
      }
      this.eventUpdated.emit(result.data)
      this.snack.open('Spectacle publié.', 'OK', { duration: 4000 })
      this.openAnnounceDialog(result.data)
    } finally {
      this.publishing.set(false)
    }
  }

  private openAnnounceDialog(ev: EventResponse): void {
    this.dialog.open<ShareAnnounceDialog, ShareAnnounceDialogData, boolean | undefined>(
      ShareAnnounceDialog,
      {
        data: {
          intent: 'event',
          seasonId: this.seasonId(),
          eventId: ev.id,
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
  }
}
