import { describe, expect, it } from 'vitest'

import { buildEventUrls } from './event-urls'
import {
  buildCompositionAnnouncementMessage,
  buildDefaultShareMessage,
  buildDrawAnnouncementMessage,
  buildWhatsAppSendUrl,
  type RoleAssignmentLine,
} from './share-announce-messages'

const roleLines: RoleAssignmentLine[] = [
  { roleKey: 'player', displayNames: ['Alice', 'Bob'] },
]

describe('share-announce-messages', () => {
  it('buildEventUrls uses canonical /saison/ path and confirm query', () => {
    const { eventUrl, confirmUrl } = buildEventUrls(
      'https://localhost:4200',
      'la-malice',
      'ma-saison',
      'mon-spectacle',
    )
    expect(eventUrl).toBe(
      'https://localhost:4200/saison/la-malice/ma-saison/event/mon-spectacle',
    )
    expect(confirmUrl).toBe(`${eventUrl}?showConfirm=true`)
  })

  it('buildDrawAnnouncementMessage starts with TIRAGE header', () => {
    const msg = buildDrawAnnouncementMessage({
      eventTitle: 'Soirée',
      eventDate: 'lundi 12 mai 2026',
      roleLines,
    })
    expect(msg).toContain('🎲')
    expect(msg).toContain('TIRAGE')
    expect(msg).toContain('Comédien·nes')
    expect(msg).toContain('Alice')
  })

  it('buildCompositionAnnouncementMessage includes confirm link when provided', () => {
    const msg = buildCompositionAnnouncementMessage({
      eventTitle: 'Soirée',
      eventDate: 'lundi 12 mai 2026',
      roleLines,
      confirmUrl: 'https://app.test/saison/s/e?showConfirm=true',
    })
    expect(msg).toContain('COMPO')
    expect(msg).toContain('showConfirm=true')
  })

  it('buildDefaultShareMessage uses edited-friendly templates per intent', () => {
    const draw = buildDefaultShareMessage({
      intent: 'draw',
      origin: 'https://app.test',
      troupeSlug: 't',
      seasonSlug: 's',
      eventSlug: 'e',
      eventTitle: 'T',
      eventDateIso: '2026-05-12T19:00:00.000Z',
      roleLines,
    })
    expect(draw).toContain('TIRAGE')

    const compo = buildDefaultShareMessage({
      intent: 'composition',
      origin: 'https://app.test',
      troupeSlug: 't',
      seasonSlug: 's',
      eventSlug: 'e',
      eventTitle: 'T',
      eventDateIso: '2026-05-12T19:00:00.000Z',
      roleLines,
    })
    expect(compo).toContain('COMPO')
    expect(compo).toContain('showConfirm=true')

    const nudge = buildDefaultShareMessage({
      intent: 'availability_nudge',
      origin: 'https://app.test',
      troupeSlug: 't',
      seasonSlug: 's',
      eventSlug: 'e',
      eventTitle: 'T',
      eventDateIso: '2026-05-12T19:00:00.000Z',
      roleLines: [],
    })
    expect(nudge).toContain('⏰ Rappel disponibilité')
    expect(nudge).toContain('?tab=dispos')
  })

  it('buildWhatsAppSendUrl encodes message', () => {
    const url = buildWhatsAppSendUrl('Hello #test')
    expect(url).toBe(`whatsapp://send?text=${encodeURIComponent('Hello #test')}`)
  })
})
