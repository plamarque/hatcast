import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet'
import { MatDialogRef } from '@angular/material/dialog'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { describe, expect, it, vi } from 'vitest'

import { DrawChancesHelpService } from '../draw-chances-help.service'
import { ChanceBreakdownSheet, type ChanceBreakdownSheetData } from './chance-breakdown-sheet'

const baseBreakdown = {
  participantId: 'p-alice',
  roleKey: 'player',
  displayName: 'Alice',
  chancePercent: 18,
  referencePercent: 63,
  candidateCount: 2,
  poolRank: 2,
  aheadCount: 1,
  tiedAtChanceCount: 1,
  adjustments: [
    {
      factorId: 'past_participation',
      label: 'Déjà Comédienne 3 fois',
      deltaPoints: -45,
    },
  ],
  requiredCount: 1,
  pool: {
    peers: [
      {
        participantId: 'p-bob',
        displayName: 'Bob',
        chancePercent: 42,
      },
    ],
  },
}

const sheetData: ChanceBreakdownSheetData = {
  seasonId: 'season-1',
  eventId: 'event-1',
  roleKey: 'player',
  roleHeaderLabel: '🎭 Comédien·nes',
  breakdown: baseBreakdown,
  isDesktop: false,
  viewerParticipantIds: ['p-alice'],
}

describe('ChanceBreakdownSheet', () => {
  let fixture: ComponentFixture<ChanceBreakdownSheet>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChanceBreakdownSheet, NoopAnimationsModule],
      providers: [
        { provide: MAT_BOTTOM_SHEET_DATA, useValue: sheetData },
        { provide: MatBottomSheetRef, useValue: { dismiss: vi.fn() } },
        { provide: MatDialogRef, useValue: null },
        {
          provide: DrawChancesHelpService,
          useValue: { open: vi.fn() },
        },
      ],
    }).compileComponents()

    fixture = TestBed.createComponent(ChanceBreakdownSheet)
    fixture.detectChanges()
  })

  it('renders waterfall with reference and final lines', () => {
    const el = fixture.nativeElement as HTMLElement
    expect(el.querySelector('[data-testid="chance-breakdown-sheet"]')).toBeTruthy()
    expect(el.querySelector('[data-testid="chance-breakdown-waterfall"]')).toBeTruthy()
    expect(el.querySelector('[data-testid="chance-breakdown-reference"]')?.textContent).toContain(
      'Chance de base pour les 2 candidats',
    )
    expect(el.querySelector('[data-testid="chance-breakdown-reference"]')?.textContent).toContain('63')
    expect(el.querySelector('[data-testid="chance-breakdown-final"]')?.textContent).toContain('18')
  })

  it('renders adjustment line for past_participation', () => {
    const el = fixture.nativeElement as HTMLElement
    expect(
      el.querySelector('[data-testid="chance-breakdown-adjustment-past_participation"]'),
    ).toBeTruthy()
  })

  it('never renders equity_tag compartment line', async () => {
    await TestBed.resetTestingModule()
      .configureTestingModule({
        imports: [ChanceBreakdownSheet, NoopAnimationsModule],
        providers: [
          {
            provide: MAT_BOTTOM_SHEET_DATA,
            useValue: {
              ...sheetData,
              breakdown: {
                ...baseBreakdown,
                adjustments: [
                  ...baseBreakdown.adjustments,
                  {
                    factorId: 'equity_tag',
                    label: 'Compté dans un autre type de spectacle',
                    deltaPoints: -23,
                  },
                ],
              },
            } satisfies ChanceBreakdownSheetData,
          },
          { provide: MatBottomSheetRef, useValue: { dismiss: vi.fn() } },
          { provide: MatDialogRef, useValue: null },
          {
            provide: DrawChancesHelpService,
            useValue: { open: vi.fn() },
          },
        ],
      })
      .compileComponents()

    const filteredFixture = TestBed.createComponent(ChanceBreakdownSheet)
    filteredFixture.detectChanges()
    const el = filteredFixture.nativeElement as HTMLElement
    expect(el.querySelector('[data-testid="chance-breakdown-adjustment-equity_tag"]')).toBeNull()
    expect(
      el.querySelector('[data-testid="chance-breakdown-adjustment-past_participation"]'),
    ).toBeTruthy()
    expect(el.textContent).not.toContain('Compté dans un autre type de spectacle')
  })

  it('opens draw chances help from doc link', () => {
    const help = TestBed.inject(DrawChancesHelpService) as unknown as { open: ReturnType<typeof vi.fn> }
    const link = fixture.nativeElement.querySelector(
      '.chance-breakdown-sheet__doc-link',
    ) as HTMLButtonElement
    link.click()
    expect(help.open).toHaveBeenCalled()
  })

  it('shows ex aequo summary when top candidates share the same chance', async () => {
    await TestBed.resetTestingModule()
      .configureTestingModule({
        imports: [ChanceBreakdownSheet, NoopAnimationsModule],
        providers: [
          {
            provide: MAT_BOTTOM_SHEET_DATA,
            useValue: {
              ...sheetData,
              breakdown: {
                ...baseBreakdown,
                chancePercent: 100,
                candidateCount: 3,
                poolRank: 1,
                aheadCount: 0,
                tiedAtChanceCount: 3,
                pool: {
                  peers: [
                    { participantId: 'p-bob', displayName: 'Marco', chancePercent: 100 },
                    { participantId: 'p-lea', displayName: 'Léa', chancePercent: 100 },
                  ],
                },
              },
              viewerParticipantIds: ['p-alice'],
            } satisfies ChanceBreakdownSheetData,
          },
          { provide: MatBottomSheetRef, useValue: { dismiss: vi.fn() } },
          { provide: MatDialogRef, useValue: null },
          {
            provide: DrawChancesHelpService,
            useValue: { open: vi.fn() },
          },
        ],
      })
      .compileComponents()

    const tiedFixture = TestBed.createComponent(ChanceBreakdownSheet)
    tiedFixture.detectChanges()
    const summary = tiedFixture.nativeElement.querySelector(
      '[data-testid="chance-breakdown-rank-summary"]',
    )
    expect(summary?.textContent).toContain('Ex aequo en tête du pool')
    expect(summary?.textContent).toContain('3 candidats à 100 %')
  })

  it('shows rank summary without duplicating the pool list', () => {
    const el = fixture.nativeElement as HTMLElement
    const summary = el.querySelector('[data-testid="chance-breakdown-rank-summary"]')
    expect(summary?.textContent).toContain('devant toi')
    expect(el.querySelector('[data-testid="chance-breakdown-peer-p-bob"]')).toBeNull()
  })

  it('derives rank summary from pool peers when poolRank is absent', async () => {
    await TestBed.resetTestingModule()
      .configureTestingModule({
        imports: [ChanceBreakdownSheet, NoopAnimationsModule],
        providers: [
          {
            provide: MAT_BOTTOM_SHEET_DATA,
            useValue: {
              ...sheetData,
              breakdown: {
                ...baseBreakdown,
                poolRank: null,
                aheadCount: null,
                pool: {
                  peers: [
                    {
                      participantId: 'p-bob',
                      displayName: 'Bob',
                      chancePercent: 99,
                    },
                  ],
                },
              },
            } satisfies ChanceBreakdownSheetData,
          },
          { provide: MatBottomSheetRef, useValue: { dismiss: vi.fn() } },
          { provide: MatDialogRef, useValue: null },
          {
            provide: DrawChancesHelpService,
            useValue: { open: vi.fn() },
          },
        ],
      })
      .compileComponents()

    const legacyFixture = TestBed.createComponent(ChanceBreakdownSheet)
    legacyFixture.detectChanges()
    const summary = legacyFixture.nativeElement.querySelector(
      '[data-testid="chance-breakdown-rank-summary"]',
    )
    expect(summary?.textContent).toContain('2e')
    expect(summary?.textContent).toContain('2 candidats')
    expect(summary?.textContent).not.toContain('indisponible')
  })

  it('uses third-person copy when viewer is not the subject', async () => {
    await TestBed.resetTestingModule()
      .configureTestingModule({
        imports: [ChanceBreakdownSheet, NoopAnimationsModule],
        providers: [
          {
            provide: MAT_BOTTOM_SHEET_DATA,
            useValue: {
              ...sheetData,
              viewerParticipantIds: [],
            } satisfies ChanceBreakdownSheetData,
          },
          { provide: MatBottomSheetRef, useValue: { dismiss: vi.fn() } },
          { provide: MatDialogRef, useValue: null },
          {
            provide: DrawChancesHelpService,
            useValue: { open: vi.fn() },
          },
        ],
      })
      .compileComponents()

    const otherFixture = TestBed.createComponent(ChanceBreakdownSheet)
    otherFixture.detectChanges()
    const el = otherFixture.nativeElement as HTMLElement

    expect(el.textContent).toContain('Sa chance aujourd’hui')
    expect(el.textContent).toContain('D’où vient ce % ?')
    expect(el.querySelector('[data-testid="chance-breakdown-rank-summary"]')?.textContent).toContain(
      'devant lui·elle',
    )
  })
})
