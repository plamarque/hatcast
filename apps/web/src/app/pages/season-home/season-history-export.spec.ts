import { describe, expect, it } from 'vitest'

import { buildHistoryCsv, historyCsvRowFromEvent } from './season-history-export'

describe('season-history-export', () => {
  it('builds csv with header and escaped cells', () => {
    const row = historyCsvRowFromEvent(
      {
        id: 'e1',
        seasonId: 's1',
        slug: 'show',
        title: 'Apérock, "special"',
        description: null,
        location: null,
        startsAt: '2020-03-12T19:00:00.000Z',
        archived: false,
        templateType: 'custom',
        roleSlots: {},
        createdAt: '',
        updatedAt: '',
        myAvailabilityStatus: 'available',
        teamStatusBadge: {
          key: 'confirmed',
          label: 'Équipe confirmée',
          tone: 'confirmed',
          shortLabel: 'Confirmé',
        },
      },
      'Alice',
    )
    const csv = buildHistoryCsv([row])
    expect(csv.split('\n')[0]).toBe('Date,Titre,Statut composition,Participant')
    expect(csv).toContain('"Apérock, ""special"""')
    expect(csv).toContain('Alice: Dispo')
    expect(csv).toContain('Confirmé')
  })
})
