import { Component, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
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
}

function calendarDaysSince(iso: string, now = new Date()): number {
  const from = new Date(iso)
  const startFrom = Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate())
  const startNow = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  return Math.floor((startNow - startFrom) / (24 * 60 * 60 * 1000))
}

@Component({
  selector: 'app-share-announce-dialog',
  imports: [FormsModule, MatButtonModule, MatDialogModule, MatProgressSpinnerModule],
  templateUrl: './share-announce-dialog.html',
  styleUrl: './share-announce-dialog.scss',
})
export class ShareAnnounceDialog {
  private readonly ref = inject(MatDialogRef<ShareAnnounceDialog>)
  private readonly dialog = inject(MatDialog)
  private readonly api = inject(ShareAnnounceApiService)
  protected readonly data = inject<ShareAnnounceDialogData>(MAT_DIALOG_DATA)

  protected readonly dialogTitleId = 'share-announce-dialog-title'

  protected readonly dialogTitle =
    this.data.intent === 'draw'
      ? 'Partager le tirage'
      : this.data.intent === 'composition'
        ? 'Annoncer la compo'
        : this.data.intent === 'availability_nudge'
          ? 'Rappel disponibilité'
          : 'Annoncer la disponibilité'

  protected readonly messageLabel =
    this.data.intent === 'composition'
      ? 'Annoncez la compo avec ce message :'
      : this.data.intent === 'availability_nudge'
        ? 'Message de rappel (modifiable) :'
        : 'Message à copier pour les contacts manuels :'

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
  protected readonly guardWarning = signal<string | null>(null)
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

  protected close(): void {
    this.ref.close()
  }

  protected openWhatsApp(): void {
    const url = buildWhatsAppSendUrl(this.messageText)
    if (typeof window !== 'undefined') {
      window.location.href = url
    }
  }

  protected async sendNotifications(): Promise<void> {
    if (this.sending()) return
    const warning = this.guardWarning()
    if (warning) {
      const confirmed = await this.confirmResend(warning)
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
    this.ref.close(true)
  }

  private async confirmResend(message: string): Promise<boolean> {
    const ref = this.dialog.open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
      data: {
        title: 'Renvoyer un rappel ?',
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
    const { total, notifiableCount, manualCount, recipients, lastManualNudgeAt, guardDays } =
      result.data
    this.recipientsSummary.set(
      `${total} personne${total > 1 ? 's' : ''} à prévenir — ${notifiableCount} notifiable${notifiableCount > 1 ? 's' : ''}, ${manualCount} manuellement`,
    )
    this.guardDays.set(guardDays ?? null)
    if (lastManualNudgeAt && guardDays != null) {
      const days = calendarDaysSince(lastManualNudgeAt)
      if (days < guardDays) {
        const dayLabel = days <= 1 ? `${days} jour` : `${days} jours`
        this.guardWarning.set(`Un rappel a déjà été envoyé il y a ${dayLabel}.`)
      }
    }
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
