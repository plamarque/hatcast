import { TextFieldModule } from '@angular/cdk/text-field'
import { Component, computed, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatChipsModule } from '@angular/material/chips'
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatMenuModule } from '@angular/material/menu'
import { MatProgressBarModule } from '@angular/material/progress-bar'
import { MatSnackBar } from '@angular/material/snack-bar'

import { ShareAnnounceApiService } from '../../core/share-announce/share-announce-api.service'
import {
  buildDefaultShareMessage,
  buildWhatsAppSendUrl,
  formatShareEventDate,
  type RoleAssignmentLine,
  type ShareAnnounceIntent,
} from '../../core/messaging/share-announce-messages'

export interface ShareAnnounceDialogData {
  intent: ShareAnnounceIntent
  seasonId: string
  eventId: string
  seasonSlug: string
  troupeSlug: string
  eventSlug: string
  eventTitle: string
  eventDateIso: string
  roleLines: RoleAssignmentLine[]
  availabilityOpenedAt?: string | null
  compositionValidatedAt?: string | null
}

interface RecipientChannelStatus {
  eligible: boolean
  notified: boolean
  lastNotifiedAt?: string | null
}

interface RecipientCard {
  participantId: string
  displayName: string
  channels: {
    email: RecipientChannelStatus
    push: RecipientChannelStatus
  }
}

function isAlreadyNotified(card: RecipientCard): boolean {
  return card.channels.email.notified || card.channels.push.notified
}

@Component({
  selector: 'app-share-announce-dialog',
  imports: [
    FormsModule,
    TextFieldModule,
    MatButtonModule,
    MatChipsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatProgressBarModule,
  ],
  templateUrl: './share-announce-dialog.html',
  styleUrl: './share-announce-dialog.scss',
})
export class ShareAnnounceDialog {
  private readonly ref = inject(MatDialogRef<ShareAnnounceDialog, void>)
  private readonly api = inject(ShareAnnounceApiService)
  private readonly snack = inject(MatSnackBar)
  protected readonly data = inject<ShareAnnounceDialogData>(MAT_DIALOG_DATA)

  protected readonly dialogTitleId = 'share-announce-dialog-title'

  protected readonly dialogTitle =
    this.data.intent === 'draw'
      ? 'Partager le tirage'
      : this.data.intent === 'composition'
        ? 'Annoncer la compo'
        : this.data.intent === 'availability_nudge'
          ? 'Rappel disponibilité'
          : 'Annonce de spectacle'

  protected readonly messageLabel =
    this.data.intent === 'composition'
      ? 'Annonce la compo avec ce message :'
      : this.data.intent === 'availability_nudge'
        ? 'Message de rappel (modifiable) :'
        : this.data.intent === 'event'
          ? 'Message pour inviter à indiquer les dispos :'
          : 'Message à partager (modifiable) :'

  protected readonly subtitleDate = formatShareEventDate(this.data.eventDateIso)

  protected messageText = buildDefaultShareMessage({
    intent: this.data.intent,
    origin: typeof window !== 'undefined' ? window.location.origin : '',
    troupeSlug: this.data.troupeSlug,
    seasonSlug: this.data.seasonSlug,
    eventSlug: this.data.eventSlug,
    eventTitle: this.data.eventTitle,
    eventDateIso: this.data.eventDateIso,
    roleLines: this.data.roleLines,
  })

  protected readonly loadingRecipients = signal(true)
  protected readonly recipientsError = signal(false)
  protected readonly recipientCards = signal<RecipientCard[]>([])

  protected readonly alreadyNotifiedRecipients = computed(() =>
    this.recipientCards()
      .filter(isAlreadyNotified)
      .sort((a, b) => a.displayName.localeCompare(b.displayName, 'fr')),
  )

  protected readonly toReachRecipients = computed(() =>
    this.recipientCards()
      .filter((r) => !isAlreadyNotified(r))
      .sort((a, b) => a.displayName.localeCompare(b.displayName, 'fr')),
  )

  protected readonly alreadyCount = computed(() => this.alreadyNotifiedRecipients().length)

  protected readonly toReachCount = computed(() => this.toReachRecipients().length)

  protected readonly alreadyCountLabel = computed(() => {
    const n = this.alreadyCount()
    return `${n} personne${n > 1 ? 's' : ''}`
  })

  protected readonly alreadyNotifiedNamesJoined = computed(() =>
    this.alreadyNotifiedRecipients()
      .map((r) => r.displayName)
      .join(', '),
  )

  protected readonly alreadyNotifiedSuffix = computed(() =>
    this.alreadyCount() > 1
      ? 'déjà notifiées automatiquement'
      : 'déjà notifiée automatiquement',
  )

  protected readonly alreadyLinkAriaLabel = computed(() => {
    const n = this.alreadyCount()
    return `${n} personne${n > 1 ? 's' : ''} déjà notifiée${n > 1 ? 's' : ''} — afficher les noms`
  })

  private loadRecipientsSeq = 0

  constructor() {
    void this.loadRecipients()
  }

  protected showCharHint(): boolean {
    return this.messageText.length > 450
  }

  protected async copyMessage(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.messageText)
      this.snack.open('Message copié.', 'OK', { duration: 3000 })
    } catch {
      this.snack.open('Copie impossible.', 'OK', { duration: 4000 })
    }
  }

  protected openWhatsApp(): void {
    const url = buildWhatsAppSendUrl(this.messageText)
    if (typeof window !== 'undefined') {
      window.location.href = url
    }
  }

  protected retryLoadRecipients(): void {
    if (this.loadingRecipients()) {
      return
    }
    void this.loadRecipients()
  }

  private async loadRecipients(): Promise<void> {
    const seq = ++this.loadRecipientsSeq
    this.loadingRecipients.set(true)
    this.recipientsError.set(false)
    const result = await this.api.getRecipients(
      this.data.seasonId,
      this.data.eventId,
      this.data.intent,
    )
    if (seq !== this.loadRecipientsSeq) {
      return
    }
    this.loadingRecipients.set(false)
    if (!result.ok || !result.data) {
      this.recipientsError.set(true)
      return
    }
    this.recipientCards.set(
      result.data.recipients.map((r) => ({
        participantId: r.participantId,
        displayName: r.displayName,
        channels: r.channels,
      })),
    )
  }
}
