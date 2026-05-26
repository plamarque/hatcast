import { TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { describe, expect, it } from 'vitest'

import type { MemberProfileSummary } from '../../core/member-profile/member-profile-api.service'
import { MemberProfilePanel } from './member-profile-panel'

const profileWithChart: MemberProfileSummary = {
  userId: 'u1',
  membershipId: 'm1',
  displayName: 'Patou',
  avatarUrl: null,
  isSelf: true,
  stats: null,
  monthlyChart: [
    {
      monthKey: '2026-02',
      blocks: [
        {
          eventId: 'e1',
          status: 'unavailable',
          eventTitle: 'Match à Pau vs la Boîte à idées',
          eventDate: '2026-02-28',
        },
      ],
    },
  ],
  favoriteRoleCounts: [],
}

describe('MemberProfilePanel', () => {
  it('formats chart block tooltip like V1', async () => {
    await TestBed.configureTestingModule({
      imports: [MemberProfilePanel, NoopAnimationsModule],
    }).compileComponents()

    const fixture = TestBed.createComponent(MemberProfilePanel)
    fixture.componentRef.setInput('profile', profileWithChart)
    fixture.componentRef.setInput('showPreferredRoles', false)
    fixture.detectChanges()

    const panel = fixture.componentInstance
    const block = profileWithChart.monthlyChart[0].blocks[0]
    expect(panel['chartBlockTooltip'](block)).toBe(
      'Match à Pau vs la Boîte à idées\n28/02\nIndisponible',
    )
  })
})
