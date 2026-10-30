import { TextFieldModule } from '@angular/cdk/text-field'
import { Component, computed, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatChipsModule } from '@angular/material/chips'
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatMenuModule } from '@angular/material/menu'
import { MatProgressBarModule } from '@angular/material/progress-bar'
import { MatSnackBar } from '@angular/material/snack-bar'

import { HatcastDialogDismiss } from '../dialog-chrome/hatcast-dialog-dismiss'
import { ShareAnnounceApiService } from '../../core/share-announce/share-announce-api.service'
import { ProductAnalyticsService } from '../../core/analytics/product-analytics.service'
import { recipientCountBucket, type ActorScope } from '../../core/analytics/organizer-analytics'
import { AvailabilityReminderConfirmDialog } from './availability-reminder-confirm-dialog'
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
  troupeId?: string
  actorScope?: ActorScope
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
    HatcastDialogDismiss,
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
  private readonly dialog = inject(MatDialog)
  private readonly analytics = inject(ProductAnalyticsService)
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
  private readonly reminderFingerprint = signal<string | null>(null)
  protected readonly sendingReminder = signal(false)
  private readonly confirmationOpen = signal(false)
  protected readonly lastManualNotifyAt = signal<string | null>(null)
  protected readonly guardDays = signal<number | null>(null)
  protected readonly hasNotifiableRecipient = computed(() =>
    this.recipientCards().some((r) => r.channels.email.eligible || r.channels.push.eligible),
  )

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
  private announcementChannelChosen = false
  private announcementDismissed = false

  constructor() {
    void this.loadRecipients()
  }

  protected showCharHint(): boolean {
    return this.messageText.length > 450
  }

  protected async copyMessage(): Promise<void> {
    this.captureCompositionAnnouncement('succeeded', 'copy')
    try {
      await navigator.clipboard.writeText(this.messageText)
      this.snack.open('Message copié.', 'OK', { duration: 3000 })
    } catch {
      this.snack.open('Copie impossible.', 'OK', { duration: 4000 })
    }
  }

  protected openWhatsApp(): void {
    this.captureCompositionAnnouncement('succeeded', 'whatsapp')
    const url = buildWhatsAppSendUrl(this.messageText)
    if (typeof window !== 'undefined') {
      window.location.href = url
    }
  }

  protected openNotificationConfirmation(): void {
    if (this.confirmationOpen() || this.sendingReminder() || this.loadingRecipients() || this.recipientsError() || !this.reminderFingerprint() || !this.hasNotifiableRecipient()) return
    this.confirmationOpen.set(true)
    const ref = this.dialog.open(AvailabilityReminderConfirmDialog, { data: { recipients: this.recipientCards(), messageText: this.messageText }, autoFocus: 'dialog', restoreFocus: true })
    ref.afterClosed().subscribe((participantIds) => {
      this.confirmationOpen.set(false)
      if (participantIds) void this.sendReminder(participantIds)
    })
  }

  protected formatReminderDate(value: string): string {
    return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(value))
  }

  private async sendReminder(recipientParticipantIds: string[]): Promise<void> {
    if (this.sendingReminder()) return
    this.sendingReminder.set(true)
    try {
      const result = await this.api.sendNotifications(this.data.seasonId, this.data.eventId, 'availability_nudge', this.messageText, this.reminderFingerprint(), recipientParticipantIds)
      if (result.ok) {
        if (this.data.intent === 'availability_nudge' && this.data.troupeId) {
          const ctx = this.analytics.eventContext(this.data.eventId, this.data.seasonId, this.data.troupeId)
          this.analytics.captureAvailabilityReminder({ ...ctx, actor_scope: this.data.actorScope }, {
            outcome: 'succeeded', recipient_count_bucket: recipientCountBucket(result.data?.acceptedCount ?? 0),
          })
        }
        this.snack.open('Demande de rappel prise en compte', 'OK', { duration: 4000 })
        void this.loadRecipients()
      } else if (result.status === 409) {
        this.captureReminderOutcome('refused')
        this.snack.open('Les destinataires ont changé. Vérifie à nouveau.', 'OK', { duration: 5000 })
        void this.loadRecipients()
      } else {
        this.captureReminderOutcome('failed')
        this.snack.open('Envoi impossible. Réessaie plus tard.', 'OK', { duration: 5000 })
      }
    } catch {
      this.captureReminderOutcome('failed')
      this.snack.open('Envoi impossible. Réessaie plus tard.', 'OK', { duration: 5000 })
    } finally {
      this.sendingReminder.set(false)
    }
  }

  private captureReminderOutcome(outcome: 'failed' | 'refused'): void {
    if (this.data.intent !== 'availability_nudge' || !this.data.troupeId) return
    const ctx = this.analytics.eventContext(this.data.eventId, this.data.seasonId, this.data.troupeId)
    this.analytics.captureAvailabilityReminder({ ...ctx, actor_scope: this.data.actorScope }, { outcome })
  }

  protected dismissCompositionAnnouncement(): void {
    if (this.announcementChannelChosen || this.announcementDismissed) return
    this.announcementDismissed = true
    this.captureCompositionAnnouncement('refused')
  }

  ngOnDestroy(): void {
    this.dismissCompositionAnnouncement()
  }

  private captureCompositionAnnouncement(
    outcome: 'succeeded' | 'refused',
    announcementChannel?: 'copy' | 'whatsapp',
  ): void {
    if (this.data.intent !== 'composition' || !this.data.troupeId) return
    if (announcementChannel) this.announcementChannelChosen = true
    const ctx = this.analytics.eventContext(this.data.eventId, this.data.seasonId, this.data.troupeId)
    this.analytics.captureCompositionMutation(
      { ...ctx, actor_scope: this.data.actorScope },
      { action: 'announce', outcome, ...(announcementChannel ? { announcement_channel: announcementChannel } : {}) },
    )
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
    this.reminderFingerprint.set(result.data.confirmationFingerprint ?? null)
    this.lastManualNotifyAt.set(result.data.lastManualNotifyAt ?? null)
    this.guardDays.set(result.data.guardDays ?? null)
  }
}
