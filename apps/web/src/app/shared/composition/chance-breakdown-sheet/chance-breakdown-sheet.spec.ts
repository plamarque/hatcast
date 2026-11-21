import { ComponentFixture, TestBed } from '@angular/core/testing'
import { By } from '@angular/platform-browser'
import { MatTooltip } from '@angular/material/tooltip'
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet'
import { MatDialogRef } from '@angular/material/dialog'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { describe, expect, it, vi } from 'vitest'

import { DrawChancesHelpService } from '../draw-chances-help.service'
import { ProductAnalyticsService } from '../../../core/analytics/product-analytics.service'
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
  analyticsContext: {
    event_id: 'event-1',
    season_id: 'season-1',
    troupe_id: 'troupe-1',
    is_demo_troupe: false,
  },
  entryPoint: 'equipe_slot_chance',
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
        { provide: ProductAnalyticsService, useValue: { captureChanceBreakdownHelpOpened: vi.fn() } },
        {
          provide: DrawChancesHelpService,
          useValue: { open: vi.fn() },
        },
      ],
    }).compileComponents()

    fixture = TestBed.createComponent(ChanceBreakdownSheet)
    fixture.detectChanges()
  })

  it('shows only recorded selection evidence, even if live data is present', () => {
    ;(fixture.componentInstance as any).breakdown.set({ ...baseBreakdown, recordedSelection: true, recordedPercent: 12, recordedAt: '2026-11-19T23:53:00Z', recordedTheoreticalRank: 2, recordedTheoreticalTiedCount: 2, recordedTheoreticalCandidateCount: 4 })
    fixture.detectChanges()
    const el = fixture.nativeElement as HTMLElement
    expect(el.querySelector('[data-testid="selection-card"]')?.textContent).toContain('12')
    expect(el.querySelector('[data-testid="selection-card"]')?.classList.contains('chance-breakdown-sheet__header')).toBe(true)
    expect(el.querySelectorAll('.chance-breakdown-sheet__header')).toHaveLength(1)
    expect(el.querySelector('.chance-breakdown-sheet__chance-kind')?.textContent).toContain('effectif')
    expect(el.querySelector('[data-testid="recorded-theoretical-position"]')).toBeNull()
    expect(el.textContent?.match(/12\s*%/g)).toHaveLength(1)
    expect(el.textContent).not.toContain('18 %')
    expect(el.querySelector('#selection-explanation-title')?.textContent).toContain('D’où vient ce % ?')
    expect(el.querySelectorAll('.chance-breakdown-sheet__waterfall-list li')).toHaveLength(1)
    expect(el.querySelector('.chance-selection__date')?.textContent).toContain('Enregistré le')
    expect(el.querySelector('[role="dialog"]')?.getAttribute('aria-label')).toBe('Fiche de sélection de Alice')
    expect(el.textContent).not.toContain('Chance au moment de la sélection')
    expect(el.querySelector('.chance-selection__date')?.textContent).toContain('novembre 2026')
    expect(el.querySelectorAll('.chance-breakdown-sheet__actions button')).toHaveLength(1)
    expect(el.querySelector('.chance-breakdown-sheet__actions button')?.textContent).toContain('Fermer')
    expect(el.querySelector('[data-testid="chance-breakdown-waterfall"]')).toBeNull()
    expect(el.querySelector('[data-testid="chance-breakdown-rank-summary"]')).toBeNull()
    expect(el.textContent).not.toContain('Comprendre le tirage')
    expect(el.textContent).not.toContain('Estimation actuelle')
    ;(fixture.componentInstance as any).breakdown.set({ ...baseBreakdown, recordedSelection: true, recordedPercent: null, recordedAt: null })
    fixture.detectChanges()
    expect(el.querySelector('[data-testid="selection-card"]')?.textContent).not.toContain('%')
    expect(el.textContent).toContain('Chance enregistrée indisponible')
    expect(el.textContent).toContain('Date d’enregistrement indisponible')
    expect(el.querySelector('[data-testid="recorded-theoretical-position"]')).toBeNull()
    expect(el.textContent).not.toContain('Enregistré le')
    expect(el.textContent).not.toContain('Estimation actuelle')
  })

  it('provides focusable and tappable help for recorded selection even with one place', () => {
    fixture.componentInstance['breakdown'].set({ ...baseBreakdown, requiredCount: 1, recordedSelection: true, recordedPercent: 0 })
    fixture.detectChanges()
    const hint = fixture.nativeElement.querySelector('.chance-breakdown-sheet__hero-hint') as HTMLButtonElement
    expect(hint).toBeTruthy()
    expect(hint.type).toBe('button')
    expect(hint.getAttribute('aria-label')).toBe('Chance calculée au moment de la sélection de cette personne.')
    expect(hint.getAttribute('aria-label')).not.toContain('tirage')
    const tooltip = fixture.debugElement.query(By.directive(MatTooltip)).injector.get(MatTooltip)
    expect(tooltip.message).toBe(hint.getAttribute('aria-label'))
    const toggle = vi.spyOn(tooltip, 'toggle')
    hint.focus()
    expect(document.activeElement).toBe(hint)
    hint.click()
    expect(toggle).toHaveBeenCalledOnce()
    fixture.componentInstance['breakdown'].set({ ...baseBreakdown, recordedSelection: true, recordedPercent: null })
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('.chance-breakdown-sheet__hero-hint')).toBeNull()
  })

  it('preserves estimated multi-place help', () => {
    fixture.componentInstance['breakdown'].set({ ...baseBreakdown, requiredCount: 2 })
    fixture.detectChanges()
    const hint = fixture.nativeElement.querySelector('.chance-breakdown-sheet__hero-hint') as HTMLButtonElement
    expect(hint.getAttribute('aria-label')).toBe('Ta chance d’obtenir une des 2 places.')
    expect(fixture.debugElement.query(By.directive(MatTooltip)).injector.get(MatTooltip).message).toBe(hint.getAttribute('aria-label'))
    fixture.componentInstance['breakdown'].set({ ...baseBreakdown, requiredCount: 1 })
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('.chance-breakdown-sheet__hero-hint')).toBeNull()
  })

  it('provides focusable and tappable help only when the captured percentage exists', () => {
    fixture.componentInstance['breakdown'].set({ ...baseBreakdown, requiredCount: 1, recordedSnapshot: true, recordedPercent: 0, recordedAt: null })
    fixture.detectChanges()
    const hint = fixture.nativeElement.querySelector('.chance-breakdown-sheet__hero-hint') as HTMLButtonElement
    expect(hint.type).toBe('button')
    expect(hint.getAttribute('aria-label')).toBe('Chance calculée avant la sélection pour ce rôle.')
    const tooltip = fixture.debugElement.query(By.directive(MatTooltip)).injector.get(MatTooltip)
    expect(tooltip.message).toBe(hint.getAttribute('aria-label'))
    const toggle = vi.spyOn(tooltip, 'toggle')
    hint.focus()
    expect(document.activeElement).toBe(hint)
    hint.click()
    expect(toggle).toHaveBeenCalledOnce()
    expect(fixture.nativeElement.textContent).toContain('Date d’enregistrement indisponible')
    fixture.componentInstance['breakdown'].set({ ...baseBreakdown, recordedSnapshot: true, recordedPercent: null, recordedAt: null })
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('.chance-breakdown-sheet__hero-hint')).toBeNull()
    expect(fixture.nativeElement.textContent).toContain('Chance enregistrée indisponible')
    expect(fixture.nativeElement.textContent).not.toContain('18 %')
  })

  it('shows the dated common photograph without a current simulation', () => {
    ;(fixture.componentInstance as any).breakdown.set({ ...baseBreakdown, recordedSnapshot: true, recordedPercent: 67, recordedAt: '2026-11-19T23:53:00Z' })
    fixture.detectChanges()
    const el = fixture.nativeElement as HTMLElement
    expect(el.querySelector('[role="dialog"]')?.getAttribute('aria-label')).toBe('Capture des chances de Alice')
    expect(el.querySelector('.chance-breakdown-sheet__chance-kind')?.textContent).toContain('capture')
    expect(el.textContent?.match(/67\s*%/g)).toHaveLength(1)
    expect(el.textContent).toContain('Capture du')
    expect(el.textContent).not.toContain('18 %')
    expect(el.querySelector('[data-testid="chance-breakdown-waterfall"]')).toBeNull()
  })

  it('labels reconstructed chances and their uncertainty accessibly', () => {
    fixture.componentInstance['breakdown'].set({ ...baseBreakdown, recordedSnapshot: true, recordedSource: 'reconstructed', recordedPercent: 42, recordedAt: '2026-11-19T23:53:00Z' })
    fixture.detectChanges()
    const el = fixture.nativeElement as HTMLElement
    expect(el.querySelector('[role="dialog"]')?.getAttribute('aria-label')).toBe('Estimation reconstituée des chances de Alice')
    expect(el.textContent).toContain('Date estimée :')
    expect(el.textContent).toContain('elle peut être incertaine')
    expect(el.textContent).not.toContain('Capture du')
  })

  it('renders waterfall with reference and final lines', () => {
    const el = fixture.nativeElement as HTMLElement
    expect(el.querySelector('[data-testid="chance-breakdown-sheet"]')).toBeTruthy()
    expect(el.querySelector('.chance-breakdown-sheet__chance-kind')?.textContent).toContain('estimé')
    expect(el.querySelector('[data-testid="chance-breakdown-waterfall"]')).toBeTruthy()
    expect(el.querySelector('[data-testid="chance-breakdown-reference"]')?.textContent).toContain(
      'Chance de base pour les 2 candidats',
    )
    expect(el.querySelector('[data-testid="chance-breakdown-reference"]')?.textContent).toContain('63')
    expect(el.querySelector('[data-testid="chance-breakdown-final"]')?.textContent).toContain('18')
  })

  it('shows the current breakdown and recorded selection separately', () => {
    fixture.componentInstance['breakdown'].set({
      ...baseBreakdown, recordedPercent: 36, recordedAt: '2026-11-12T19:15:00Z', recordedSource: 'manual',
    })
    fixture.detectChanges()
    const el = fixture.nativeElement as HTMLElement
    expect(el.querySelector('[data-testid="chance-breakdown-waterfall"]')).toBeTruthy()
    expect(el.querySelector('[data-testid="chance-recorded"]')?.textContent).toContain('36')
    expect(el.querySelector('[data-testid="chance-recorded"]')?.textContent).toContain('sélection')
    expect(el.querySelector('[data-testid="chance-recorded"]')?.textContent).toContain('novembre 2026')
  })

  it('shows saved value when the current estimate is unavailable', () => {
    fixture.componentInstance['breakdown'].set({
      ...baseBreakdown, chancePercent: null, recordedPercent: 36,
      recordedAt: '2026-11-12T19:15:00Z', recordedSource: 'manual',
    })
    fixture.detectChanges()
    const el = fixture.nativeElement as HTMLElement
    expect(el.textContent).toContain('Estimation actuelle indisponible')
    expect(el.querySelector('[data-testid="chance-breakdown-waterfall"]')).toBeNull()
    expect(el.querySelector('[data-testid="chance-recorded"]')?.textContent).toContain('36')
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
          { provide: ProductAnalyticsService, useValue: { captureChanceBreakdownHelpOpened: vi.fn() } },
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
    const analytics = TestBed.inject(ProductAnalyticsService) as unknown as {
      captureChanceBreakdownHelpOpened: ReturnType<typeof vi.fn>
    }
    const link = fixture.nativeElement.querySelector(
      '.chance-breakdown-sheet__doc-link',
    ) as HTMLButtonElement
    link.click()
    expect(help.open).toHaveBeenCalled()
    expect(analytics.captureChanceBreakdownHelpOpened).toHaveBeenCalledWith(
      sheetData.analyticsContext,
      { entry_point: 'equipe_slot_chance' },
    )
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
          { provide: ProductAnalyticsService, useValue: { captureChanceBreakdownHelpOpened: vi.fn() } },
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
          { provide: ProductAnalyticsService, useValue: { captureChanceBreakdownHelpOpened: vi.fn() } },
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
          { provide: ProductAnalyticsService, useValue: { captureChanceBreakdownHelpOpened: vi.fn() } },
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

    expect(el.textContent).toContain('Sa chance estimée')
    expect(el.textContent).toContain('D’où vient ce % ?')
    expect(el.querySelector('[data-testid="chance-breakdown-rank-summary"]')?.textContent).toContain(
      'devant lui·elle',
    )
  })
})
