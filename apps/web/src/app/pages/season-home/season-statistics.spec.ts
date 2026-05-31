import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { provideRouter } from '@angular/router'
import { describe, expect, it, vi } from 'vitest'

import { MemberProfileService } from '../../core/member-profile/member-profile.service'
import type { SeasonStatisticsResponse } from '../../core/seasons/season-statistics-api.service'
import { SeasonStatistics } from './season-statistics'

describe('SeasonStatistics', () => {
  const sampleData: SeasonStatisticsResponse = {
    participants: [],
    monthKeys: [],
    events: [],
    rows: [
      {
        participantId: 'p1',
        displayName: 'Alice',
        userSlug: 'alice-dupont',
        avatarUrl: null,
        annual: { totalJeu: { selections: 0, dispos: 0, declines: 0 } },
        monthSummary: {},
        byMonth: {},
        eventCells: {},
      },
      {
        participantId: 'p2',
        displayName: 'Bob sans compte',
        userSlug: null,
        avatarUrl: null,
        annual: { totalJeu: { selections: 0, dispos: 0, declines: 0 } },
        monthSummary: {},
        byMonth: {},
        eventCells: {},
      },
    ],
  }

  async function setup(navigateSpy = vi.fn()): Promise<ComponentFixture<SeasonStatistics>> {
    await TestBed.configureTestingModule({
      imports: [SeasonStatistics, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        {
          provide: MemberProfileService,
          useValue: { navigateToMemberGlance: navigateSpy },
        },
      ],
    }).compileComponents()

    const fixture = TestBed.createComponent(SeasonStatistics)
    fixture.componentRef.setInput('data', sampleData)
    fixture.componentRef.setInput('troupeId', 'troupe-1')
    fixture.componentRef.setInput('leagueId', 'league-1')
    fixture.detectChanges()
    return fixture
  }

  it('renders avatar and name for each participant row', async () => {
    const fixture = await setup()
    const rows = fixture.nativeElement.querySelectorAll('.season-statistics__participant')
    expect(rows.length).toBe(2)
    expect(rows[0].textContent).toContain('Alice')
    expect(rows[1].textContent).toContain('Bob sans compte')
    expect(fixture.nativeElement.querySelectorAll('app-user-avatar').length).toBe(2)
  })

  it('navigates to member glance when linked participant cell is clicked', async () => {
    const navigateSpy = vi.fn()
    const fixture = await setup(navigateSpy)
    const link = fixture.nativeElement.querySelector(
      '.season-statistics__participant--link',
    ) as HTMLButtonElement
    expect(link).toBeTruthy()
    expect(link.getAttribute('aria-label')).toContain('Alice')
    link.click()
    expect(navigateSpy).toHaveBeenCalledWith({
      userSlug: 'alice-dupont',
      troupeId: 'troupe-1',
      leagueId: 'league-1',
    })
  })

  it('navigates when avatar is clicked', async () => {
    const navigateSpy = vi.fn()
    const fixture = await setup(navigateSpy)
    const avatar = fixture.nativeElement.querySelector(
      '.season-statistics__participant--link app-user-avatar',
    ) as HTMLElement
    expect(avatar).toBeTruthy()
    avatar.click()
    expect(navigateSpy).toHaveBeenCalledWith({
      userSlug: 'alice-dupont',
      troupeId: 'troupe-1',
      leagueId: 'league-1',
    })
  })

  it('navigates when participant name is clicked (V1 parity)', async () => {
    const navigateSpy = vi.fn()
    const fixture = await setup(navigateSpy)
    const name = fixture.nativeElement.querySelector(
      '.season-statistics__participant--link .season-statistics__participant-name',
    ) as HTMLElement
    name.click()
    expect(navigateSpy).toHaveBeenCalledOnce()
  })

  it('does not navigate when participant has no userSlug', async () => {
    const navigateSpy = vi.fn()
    const fixture = await setup(navigateSpy)
    expect(fixture.nativeElement.querySelectorAll('.season-statistics__participant--link').length).toBe(1)
    const plainRows = fixture.nativeElement.querySelectorAll(
      '.season-statistics__participant:not(.season-statistics__participant--link)',
    )
    expect(plainRows.length).toBe(1)
    ;(plainRows[0] as HTMLElement).click()
    expect(navigateSpy).not.toHaveBeenCalled()
  })
})
