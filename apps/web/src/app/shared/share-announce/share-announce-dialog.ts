import { TextFieldModule } from '@angular/cdk/text-field'
import { Component, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatListModule } from '@angular/material/list'
import { MatProgressBarModule } from '@angular/material/progress-bar'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar } from '@angular/material/snack-bar'
import { firstValueFrom } from 'rxjs'

import { ShareAnnounceApiService } from '../../core/share-announce/share-announce-api.service'
import {
  buildDefaultShareMessage,
  buildWhatsAppSendUrl,
  formatShareEventDate,
  type RoleAssignmentLine,
  type ShareAnnounceIntent,
} from '../../core/messaging/share-announce-messages'
import {
  ConfirmDialog,
  type ConfirmDialogData,
} from '../../pages/seasons-list/confirm-dialog'
import type { ShareAnnounceNotifyResult } from './share-announce-snack'

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

function calendarDaysSince(iso: string, now = new Date()): number {
  const from = new Date(iso)
  const startFrom = Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate())
  const startNow = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  return Math.floor((startNow - startFrom) / (24 * 60 * 60 * 1000))
}

@Component({
  selector: 'app-share-announce-dialog',
  imports: [
    FormsModule,
    TextFieldModule,
    MatButtonModule,
    MatDialogModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './share-announce-dialog.html',
  styleUrl: './share-announce-dialog.scss',
})
export class ShareAnnounceDialog {
  private readonly ref = inject(MatDialogRef<ShareAnnounceDialog, ShareAnnounceNotifyResult | undefined>)
  private readonly dialog = inject(MatDialog)
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
  protected readonly sending = signal(false)
  protected readonly sendError = signal<string | null>(null)
  protected readonly recipientsSummary = signal<string | null>(null)
  protected readonly guardDays = signal<number | null>(null)
  protected readonly lastManualNotifyAt = signal<string | null>(null)
  protected readonly notifiableCount = signal(0)
  protected readonly manualCount = signal(0)
  protected readonly recipientCards = signal<
    Array<{
      participantId: string
      displayName: string
      emailObfuscated: string | null
      notifiable: boolean
    }>
  >([])

  constructor() {
    void this.loadRecipients()
  }

  protected showCharHint(): boolean {
    return this.messageText.length > 450
  }

  protected notifyButtonLabel(): string {
    const count = this.notifiableCount()
    if (count === 0) {
      return 'Aucune notification automatique'
    }
    return `Notifier ${count} personne${count > 1 ? 's' : ''}`
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
    void this.loadRecipients()
  }

  protected async sendNotifications(): Promise<void> {
    if (this.sending()) return
    const confirmMessage = this.guardConfirmMessage()
    if (confirmMessage) {
      const confirmed = await this.confirmResend(confirmMessage)
      if (!confirmed) return
    }
    this.sending.set(true)
    this.sendError.set(null)
    const result = await this.api.sendNotifications(
      this.data.seasonId,
      this.data.eventId,
      this.data.intent,
      this.messageText,
    )
    this.sending.set(false)
    if (!result.ok) {
      this.sendError.set(result.errorMessage ?? 'Envoi impossible.')
      return
    }
    this.ref.close({
      intent: this.data.intent,
      notifiedCount: result.data.notifiedCount,
      manualCount: result.data.manualCount,
    })
  }

  private guardConfirmMessage(): string | null {
    const lastAt = this.lastManualNotifyAt()
    const guardDays = this.guardDays()
    if (!lastAt || guardDays == null) {
      return null
    }
    const days = calendarDaysSince(lastAt)
    if (days >= guardDays) {
      return null
    }
    const dayLabel = days <= 1 ? `${days} jour` : `${days} jours`
    return this.data.intent === 'availability_nudge'
      ? `Un rappel a déjà été envoyé il y a ${dayLabel}.`
      : `Un envoi pour ce type d'annonce a déjà été fait il y a ${dayLabel}.`
  }

  private async confirmResend(message: string): Promise<boolean> {
    const title =
      this.data.intent === 'availability_nudge'
        ? 'Renvoyer un rappel ?'
        : 'Renvoyer cette annonce ?'
    const ref = this.dialog.open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
      data: {
        title,
        message,
        confirmLabel: 'Envoyer quand même',
      },
      width: 'min(24rem, 92vw)',
    })
    return (await firstValueFrom(ref.afterClosed())) === true
  }

  private async loadRecipients(): Promise<void> {
    this.loadingRecipients.set(true)
    this.recipientsError.set(false)
    this.lastManualNotifyAt.set(null)
    const result = await this.api.getRecipients(
      this.data.seasonId,
      this.data.eventId,
      this.data.intent,
    )
    this.loadingRecipients.set(false)
    if (!result.ok || !result.data) {
      this.recipientsError.set(true)
      return
    }
    const { total, notifiableCount, manualCount, recipients, lastManualNotifyAt, guardDays } =
      result.data
    this.notifiableCount.set(notifiableCount)
    this.manualCount.set(manualCount)
    this.recipientsSummary.set(
      `${total} personne${total > 1 ? 's' : ''} concernée${total > 1 ? 's' : ''} — ${notifiableCount} notifiable${notifiableCount > 1 ? 's' : ''} automatiquement, ${manualCount} à contacter manuellement`,
    )
    this.guardDays.set(guardDays ?? null)
    this.lastManualNotifyAt.set(lastManualNotifyAt ?? null)
    this.recipientCards.set(
      recipients.map((r) => ({
        participantId: r.participantId,
        displayName: r.displayName,
        emailObfuscated: r.emailObfuscated,
        notifiable: r.channels.email || r.channels.push,
      })),
    )
  }
}
