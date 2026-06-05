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
  it('formats chart block tooltip for selected role', async () => {
    await TestBed.configureTestingModule({
      imports: [MemberProfilePanel, NoopAnimationsModule],
    }).compileComponents()

    const fixture = TestBed.createComponent(MemberProfilePanel)
    const profile: MemberProfileSummary = {
      ...profileWithChart,
      monthlyChart: [
        {
          monthKey: '2026-03',
          blocks: [
            {
              eventId: 'e2',
              status: 'selected',
              eventTitle: 'Match Cambo',
              eventDate: '2026-03-15',
              roleKey: 'player',
            },
          ],
        },
      ],
    }
    fixture.componentRef.setInput('profile', profile)
    fixture.componentRef.setInput('showPreferredRoles', false)
    fixture.detectChanges()

    const panel = fixture.componentInstance
    const block = profile.monthlyChart[0].blocks[0]
    expect(panel['chartBlockTooltip'](block)).toBe('Match Cambo\n15/03\nComédien·ne')
    expect(panel['chartBlockModifierClass'](block)).toBe(
      'member-profile__chart-block member-profile__chart-block--selected',
    )
  })

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

  it('renders h2 section headings on hub pages', async () => {
    await TestBed.configureTestingModule({
      imports: [MemberProfilePanel, NoopAnimationsModule],
    }).compileComponents()

    const fixture = TestBed.createComponent(MemberProfilePanel)
    fixture.componentRef.setInput('profile', {
      ...profileWithChart,
      favoriteRoleCounts: [{ roleKey: 'player', count: 2 }],
    })
    fixture.componentRef.setInput('showPreferredRoles', false)
    fixture.componentRef.setInput('sectionHeadingLevel', 2)
    fixture.detectChanges()

    const headings = fixture.nativeElement.querySelectorAll('h2.member-profile__section-title')
    expect(headings.length).toBe(2)
    expect(fixture.nativeElement.textContent).toContain('Comédien·ne')
    expect(headings[0]?.textContent?.trim()).toContain("clin d")
    expect(headings[1]?.textContent?.trim()).toBe('Rôles favoris')
    expect(fixture.nativeElement.querySelector('h3.member-profile__section-title')).toBeNull()
  })

  it('uses gender-aware labels for favorite roles and chart tooltips', async () => {
    await TestBed.configureTestingModule({
      imports: [MemberProfilePanel, NoopAnimationsModule],
    }).compileComponents()

    const fixture = TestBed.createComponent(MemberProfilePanel)
    const profile: MemberProfileSummary = {
      ...profileWithChart,
      gender: 'female',
      monthlyChart: [
        {
          monthKey: '2026-03',
          blocks: [
            {
              eventId: 'e2',
              status: 'selected',
              eventTitle: 'Match Cambo',
              eventDate: '2026-03-15',
              roleKey: 'player',
            },
          ],
        },
      ],
      favoriteRoleCounts: [{ roleKey: 'player', count: 3 }],
    }
    fixture.componentRef.setInput('profile', profile)
    fixture.componentRef.setInput('showPreferredRoles', false)
    fixture.detectChanges()

    expect(fixture.nativeElement.textContent).toContain('Comédienne')
    expect(fixture.nativeElement.textContent).not.toContain('Comédien·ne')
    const block = profile.monthlyChart[0].blocks[0]
    expect(fixture.componentInstance['chartBlockTooltip'](block)).toBe(
      'Match Cambo\n15/03\nComédienne',
    )
  })
})
