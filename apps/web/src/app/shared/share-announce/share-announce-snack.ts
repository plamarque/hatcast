import type { ShareAnnounceIntent } from '../../core/messaging/share-announce-messages'

export interface ShareAnnounceNotifyResult {
  intent: ShareAnnounceIntent
  notifiedCount: number
  manualCount: number
}

const STUB_INTENTS: ShareAnnounceIntent[] = ['draw', 'composition']

const DISPATCH_INTENTS: ShareAnnounceIntent[] = ['availability_nudge', 'event']

export function shareAnnounceSnackMessage(result: ShareAnnounceNotifyResult): string {
  if (DISPATCH_INTENTS.includes(result.intent) && result.notifiedCount > 0) {
    const n = result.notifiedCount
    return `${n} notification${n > 1 ? 's' : ''} envoyée${n > 1 ? 's' : ''}.`
  }
  if (STUB_INTENTS.includes(result.intent) || (result.intent === 'event' && result.notifiedCount === 0)) {
    return 'Demande enregistrée.'
  }
  return 'Message prêt — partage-le via Copier ou WhatsApp.'
}

export const SHARE_ANNOUNCE_SNACK_DURATION_MS = 5000
