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
    monthKeys: ['2026-03'],
    events: [
      {
        id: 'ev1',
        title: 'Match test',
        startsAt: '2026-03-15T19:00:00Z',
        templateType: 'match',
        category: null,
        monthKey: '2026-03',
      },
    ],
    rows: [
      {
        participantId: 'p1',
        displayName: 'Alice',
        userSlug: 'alice-dupont',
        avatarUrl: null,
        gender: 'female',
        annual: { totalJeu: { selections: 0, dispos: 0, declines: 0 } },
        monthSummary: { '2026-03': { selections: 0, dispos: 0, declines: 0 } },
        byMonth: {},
        eventCells: { ev1: 'Comédien·ne' },
        eventCellDetails: {
          ev1: {
            status: 'selected',
            label: 'Comédien·ne',
            roleKey: 'player',
            tooltip: 'Comédien·ne',
          },
        },
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
        eventCellDetails: {},
      },
    ],
  }

  async function setup(
    navigateSpy = vi.fn(),
    data: SeasonStatisticsResponse = sampleData,
  ): Promise<ComponentFixture<SeasonStatistics>> {
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
    fixture.componentRef.setInput('data', data)
    fixture.componentRef.setInput('troupeId', 'troupe-1')
    fixture.componentRef.setInput('seasonId', 'league-1')
    fixture.componentRef.setInput('detailsExpanded', true)
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

  it('applies gender tone on statistics avatars without photo', async () => {
    const fixture = await setup()
    const femaleAvatar = fixture.nativeElement.querySelector(
      '.season-statistics__participant--link app-user-avatar.user-avatar--tone-female',
    ) as HTMLElement
    expect(femaleAvatar).toBeTruthy()
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
      seasonId: 'league-1',
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
      seasonId: 'league-1',
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

  it('renders participation event cell when month is expanded', async () => {
    const fixture = await setup()
    const cells = fixture.nativeElement.querySelectorAll('app-participation-event-cell')
    expect(cells.length).toBe(2)
    expect(fixture.nativeElement.querySelector('.participation-event-cell--selected')).toBeTruthy()
  })

  it('genres role tooltip from participant gender on stats cells', async () => {
    const fixture = await setup()
    const cell = fixture.nativeElement.querySelector(
      '.participation-event-cell--selected[aria-label="Comédienne"]',
    )
    expect(cell).toBeTruthy()
  })

  it('falls back to neutral legacy text when eventCellDetails is absent', async () => {
    const legacyRow = {
      ...sampleData.rows[0],
      eventCells: { ev1: 'Dispo (J)' },
    }
    delete (legacyRow as { eventCellDetails?: unknown }).eventCellDetails
    const legacyData: SeasonStatisticsResponse = {
      ...sampleData,
      rows: [legacyRow],
    }
    const fixture = await setup(vi.fn(), legacyData)
    const cell = fixture.nativeElement.querySelector('.participation-event-cell--neutral')
    expect(cell).toBeTruthy()
    expect(cell?.textContent).toContain('Dispo (J)')
  })
})
