import { TestBed } from '@angular/core/testing'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { of } from 'rxjs'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { DrawFormulaApiService } from '../../core/draw/draw-formula-api.service'
import type { DrawFormula } from '../../core/draw/draw-formula-payload'
import { DrawPolicyApiService } from '../../core/draw/draw-policy-api.service'
import { TroupeApiService } from '../../core/troupes/troupe-api.service'
import { TroupeDrawFormulaArchiveDialog } from './troupe-draw-formula-archive-dialog'
import { TroupeDrawFormulaEditorDialog } from './troupe-draw-formula-editor-dialog'
import {
  TroupeDrawFormulasTab,
  FORMULAS_INTRO_COPY,
  SYSTEM_FALLBACK_COPY,
  freeGlossaryCategories,
  implicitChoiceDefaultRule,
  mandatoryChipsForFormula,
  withMandatoryCategory,
  withoutCategoryRule,
} from './troupe-draw-formulas-tab'

const factorConfig: DrawFormula['factorConfig'] = [
  { factorId: 'equity_tag', enabled: true },
  { factorId: 'past_participation', enabled: true },
  { factorId: 'immediate_replay', enabled: false },
  { factorId: 'role_request', enabled: false },
]

describe('draw formula policy invert helpers', () => {
  const glossary = [
    { slug: 'principal', label: 'Spectacles ordinaires' },
    { slug: 'aperock', label: 'Apérock' },
    { slug: 'cabaret', label: 'Cabaret' },
  ]
  const rules = [
    { category: 'aperock', mode: 'MANDATORY' as const, mandatoryFormulaId: 'custom-pub' },
  ]

  it('maps MANDATORY rules onto the owning formula only', () => {
    expect(mandatoryChipsForFormula(rules, 'custom-pub', glossary).map((c) => c.slug)).toEqual([
      'aperock',
    ])
    expect(mandatoryChipsForFormula(rules, 'other', glossary)).toEqual([])
  })

  it('omits principal and occupied slugs from + Catégorie menus', () => {
    expect(freeGlossaryCategories(glossary, rules).map((c) => c.slug)).toEqual(['cabaret'])
  })

  it('does not treat existing CHOICE rules as occupying the glossary menu', () => {
    const withChoice = [
      ...rules,
      { category: 'cabaret', mode: 'CHOICE' as const, allowedFormulaIds: ['custom-pub', 'sys-1'] },
    ]
    expect(freeGlossaryCategories(glossary, withChoice).map((c) => c.slug)).toEqual(['cabaret'])
  })

  it('treats missing categoryRules as empty', () => {
    expect(freeGlossaryCategories(glossary, undefined).map((c) => c.slug)).toEqual(['aperock', 'cabaret'])
    expect(mandatoryChipsForFormula(undefined, 'custom-pub', glossary)).toEqual([])
  })

  it('keeps defaultRule and adds MANDATORY on assign', () => {
    const policy = {
      defaultRule: { mode: 'CHOICE' as const, allowedFormulaIds: ['sys-1'] },
      categoryRules: [] as typeof rules,
    }
    const next = withMandatoryCategory(policy, 'custom-pub', 'aperock')
    expect(next.defaultRule).toEqual(policy.defaultRule)
    expect(next.categoryRules).toEqual([
      { category: 'aperock', mode: 'MANDATORY', mandatoryFormulaId: 'custom-pub' },
    ])
  })

  it('removes the slug so the category falls back to V1', () => {
    const policy = {
      defaultRule: { mode: 'CHOICE' as const, allowedFormulaIds: ['sys-1'] },
      categoryRules: rules,
    }
    expect(withoutCategoryRule(policy, 'aperock').categoryRules).toEqual([])
  })

  it('removes only MANDATORY rules for slug and keeps CHOICE rows', () => {
    const policy = {
      defaultRule: { mode: 'CHOICE' as const, allowedFormulaIds: ['sys-1'] },
      categoryRules: [
        { category: 'aperock', mode: 'MANDATORY' as const, mandatoryFormulaId: 'custom-pub' },
        {
          category: 'cabaret',
          mode: 'CHOICE' as const,
          allowedFormulaIds: ['custom-pub', 'sys-1'],
        },
      ],
    }
    expect(withoutCategoryRule(policy, 'aperock').categoryRules).toEqual([
      {
        category: 'cabaret',
        mode: 'CHOICE',
        allowedFormulaIds: ['custom-pub', 'sys-1'],
      },
    ])
  })

  it('builds CHOICE defaultRule with published non-system first then system V1', () => {
    expect(
      implicitChoiceDefaultRule([
        { id: 'sys-1', name: 'V1', isSystem: true, status: 'PUBLISHED' } as DrawFormula,
        { id: 'draft', name: 'Draft', isSystem: false, status: 'DRAFT' } as DrawFormula,
        { id: 'pub', name: 'Ma formule', isSystem: false, status: 'PUBLISHED' } as DrawFormula,
      ]),
    ).toEqual({ mode: 'CHOICE', allowedFormulaIds: ['pub', 'sys-1'] })
  })

  it('orders published non-system by name asc before system V1', () => {
    expect(
      implicitChoiceDefaultRule([
        { id: 'sys-1', name: 'V1 standard', isSystem: true, status: 'PUBLISHED' } as DrawFormula,
        { id: 'pub-z', name: 'Zebra', isSystem: false, status: 'PUBLISHED' } as DrawFormula,
        { id: 'pub-a', name: 'Aperocks', isSystem: false, status: 'PUBLISHED' } as DrawFormula,
      ]),
    ).toEqual({ mode: 'CHOICE', allowedFormulaIds: ['pub-a', 'pub-z', 'sys-1'] })
  })
})

describe('TroupeDrawFormulasTab', () => {
  afterEach(() => {
    TestBed.resetTestingModule()
  })

  const formulas: DrawFormula[] = [
    {
      id: 'sys-1',
      troupeId: 't1',
      name: 'V1',
      description: null,
      status: 'PUBLISHED',
      factorConfig,
      version: 1,
      isSystem: true,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
    {
      id: 'custom-1',
      troupeId: 't1',
      name: 'Ma formule',
      description: null,
      status: 'DRAFT',
      factorConfig,
      version: 1,
      isSystem: false,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
    {
      id: 'custom-pub',
      troupeId: 't1',
      name: 'Aperocks',
      description: null,
      status: 'PUBLISHED',
      factorConfig,
      version: 1,
      isSystem: false,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
    {
      id: 'custom-arch',
      troupeId: 't1',
      name: 'Ancienne',
      description: null,
      status: 'ARCHIVED',
      factorConfig,
      version: 1,
      isSystem: false,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
  ]

  const glossary = [
    { slug: 'principal', label: 'Spectacles ordinaires' },
    { slug: 'aperock', label: 'Apérock' },
    { slug: 'cabaret', label: 'Cabaret' },
  ]

  async function setup(
    options: {
      dialogResult?: unknown
      policy?: unknown
      policyGetOk?: boolean
      categoriesGetOk?: boolean
      putResult?: { ok: boolean; status: number; data?: unknown; errorMessage?: string }
    } = {},
  ) {
    const list = vi.fn().mockResolvedValue({ ok: true, status: 200, data: formulas })
    const listCategories = vi.fn().mockResolvedValue(
      options.categoriesGetOk === false
        ? { ok: false, status: 500 }
        : { ok: true, status: 200, data: glossary },
    )
    const getTroupeDrawPolicy = vi.fn().mockResolvedValue(
      options.policyGetOk === false
        ? { ok: false, status: 500 }
        : (options.policy ?? { ok: true, status: 404, data: null }),
    )
    const putTroupeDrawPolicy = vi.fn().mockResolvedValue(
      options.putResult ?? {
        ok: true,
        status: 200,
        data: {
          defaultRule: { mode: 'CHOICE', allowedFormulaIds: ['sys-1', 'custom-pub'] },
          categoryRules: [
            { category: 'aperock', mode: 'MANDATORY', mandatoryFormulaId: 'custom-pub' },
          ],
        },
      },
    )
    const snackOpen = vi.fn()
    const dialogOpen = vi.fn().mockImplementation((component) => {
      if (component === TroupeDrawFormulaEditorDialog) {
        return {
          afterClosed: () =>
            of(
              options.dialogResult ?? {
                ok: true,
                published: false,
                formula: formulas[1],
              },
            ),
        }
      }
      if (component === TroupeDrawFormulaArchiveDialog) {
        return {
          afterClosed: () =>
            of(
              options.dialogResult ?? {
                ok: false,
                status: 409,
                message:
                  "Cette formule est utilisée par une politique de tirage. Retire-la de la politique avant de l'archiver.",
              },
            ),
        }
      }
      return { afterClosed: () => of(undefined) }
    })

    TestBed.resetTestingModule()
    const drawFormulaApi = { list }
    const drawPolicyApi = { getTroupeDrawPolicy, putTroupeDrawPolicy }
    const troupeApi = { listCategories }
    await TestBed.configureTestingModule({
      imports: [TroupeDrawFormulasTab, NoopAnimationsModule],
      providers: [
        { provide: DrawFormulaApiService, useValue: drawFormulaApi },
        { provide: DrawPolicyApiService, useValue: drawPolicyApi },
        { provide: TroupeApiService, useValue: troupeApi },
        { provide: MatDialog, useValue: { open: dialogOpen } },
        { provide: MatSnackBar, useValue: { open: snackOpen } },
      ],
    })
      .overrideProvider(DrawFormulaApiService, { useValue: drawFormulaApi })
      .overrideProvider(DrawPolicyApiService, { useValue: drawPolicyApi })
      .overrideProvider(TroupeApiService, { useValue: troupeApi })
      .overrideProvider(MatDialog, { useValue: { open: dialogOpen } })
      .overrideProvider(MatSnackBar, { useValue: { open: snackOpen } })
      .compileComponents()

    const fixture = TestBed.createComponent(TroupeDrawFormulasTab)
    fixture.componentRef.setInput('troupeId', 't1')
    fixture.detectChanges()
    const expectLoadError = options.categoriesGetOk === false
    await vi.waitFor(() => {
      expect(list).toHaveBeenCalledWith('t1')
      if (expectLoadError) {
        expect(fixture.nativeElement.textContent).toContain(
          'Impossible de charger les formules de tirage.',
        )
      } else {
        expect(fixture.nativeElement.textContent).toContain('Ma formule')
      }
    })
    return {
      fixture,
      list,
      dialogOpen,
      snackOpen,
      getTroupeDrawPolicy,
      putTroupeDrawPolicy,
      listCategories,
    }
  }

  it('renders formula rows from API', async () => {
    const { fixture } = await setup()
    const text = fixture.nativeElement.textContent ?? ''
    expect(text).toContain('V1')
    expect(text).toContain('Ma formule')
    expect(text).toContain('Système')
    expect(text).toContain('Brouillon')
  })

  it('uses mock intro copy and has no third Politiques tab', async () => {
    const { fixture } = await setup()
    const text = fixture.nativeElement.textContent ?? ''
    expect(text).toContain(FORMULAS_INTRO_COPY)
    expect(text).not.toContain('politiques seront configurées ensuite')
    expect(text).not.toContain('Politiques')
    expect(fixture.nativeElement.querySelectorAll('[role="tab"]').length).toBe(0)
  })

  it('shows V1 rest-copy without chips or + Catégorie', async () => {
    const { fixture } = await setup()
    const systemApply = fixture.nativeElement.querySelector(
      '[data-testid="draw-formula-applied-system"]',
    ) as HTMLElement
    expect(systemApply.textContent).toContain(SYSTEM_FALLBACK_COPY)
    expect(systemApply.querySelector('.troupe-draw-formulas-tab__category-chips')).toBeNull()
    expect(fixture.nativeElement.querySelector('[data-testid="draw-formula-add-category-sys-1"]')).toBeNull()
  })

  it('hides Appliquée à editor for draft and archived formulas', async () => {
    const { fixture } = await setup()
    expect(fixture.nativeElement.querySelector('[data-testid="draw-formula-applied-custom-1"]')).toBeNull()
    expect(
      fixture.nativeElement.querySelector('[data-testid="draw-formula-applied-custom-arch"]'),
    ).toBeNull()
    expect(fixture.nativeElement.querySelector('[data-testid="draw-formula-applied-custom-pub"]')).toBeTruthy()
  })

  it('assigns a free category with immediate PUT and shows the chip', async () => {
    const { fixture, putTroupeDrawPolicy } = await setup()
    fixture.nativeElement
      .querySelector('[data-testid="draw-formula-add-category-custom-pub"]')
      ?.click()
    fixture.detectChanges()
    await vi.waitFor(() => {
      const items = Array.from(document.querySelectorAll('[data-testid="draw-formula-assign-aperock"]'))
      expect(items.length).toBeGreaterThan(0)
    })
    ;(document.querySelector('[data-testid="draw-formula-assign-aperock"]') as HTMLButtonElement).click()
    await vi.waitFor(() => {
      expect(putTroupeDrawPolicy).toHaveBeenCalled()
    })
    const body = putTroupeDrawPolicy.mock.calls[0]![1] as {
      defaultRule: { mode: string; allowedFormulaIds?: string[] }
      categoryRules: Array<{ category: string; mode: string; mandatoryFormulaId: string }>
    }
    expect(body.defaultRule).toEqual({
      mode: 'CHOICE',
      allowedFormulaIds: ['custom-pub', 'sys-1'],
    })
    expect(body.categoryRules).toEqual([
      { category: 'aperock', mode: 'MANDATORY', mandatoryFormulaId: 'custom-pub' },
    ])
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('mat-chip')).toBeTruthy()
    expect(fixture.nativeElement.textContent).toContain('Apérock')
  })

  it('omits occupied categories from the menu', async () => {
    const { fixture } = await setup({
      policy: {
        ok: true,
        status: 200,
        data: {
          defaultRule: { mode: 'CHOICE', allowedFormulaIds: ['sys-1', 'custom-pub'] },
          categoryRules: [
            { category: 'aperock', mode: 'MANDATORY', mandatoryFormulaId: 'custom-pub' },
          ],
        },
      },
    })
    fixture.nativeElement
      .querySelector('[data-testid="draw-formula-add-category-custom-pub"]')
      ?.click()
    fixture.detectChanges()
    await vi.waitFor(() => {
      expect(document.querySelector('[data-testid="draw-formula-assign-cabaret"]')).toBeTruthy()
    })
    expect(document.querySelector('[data-testid="draw-formula-assign-aperock"]')).toBeNull()
    expect(document.querySelector('[data-testid="draw-formula-assign-principal"]')).toBeNull()
  })

  it('unassigns a chip and PUTs without that category rule', async () => {
    const { fixture, putTroupeDrawPolicy } = await setup({
      policy: {
        ok: true,
        status: 200,
        data: {
          defaultRule: { mode: 'CHOICE', allowedFormulaIds: ['sys-1', 'custom-pub'] },
          categoryRules: [
            { category: 'aperock', mode: 'MANDATORY', mandatoryFormulaId: 'custom-pub' },
          ],
        },
      },
      putResult: {
        ok: true,
        status: 200,
        data: {
          defaultRule: { mode: 'CHOICE', allowedFormulaIds: ['sys-1', 'custom-pub'] },
          categoryRules: [],
        },
      },
    })
    fixture.nativeElement.querySelector('[data-testid="draw-formula-unassign-aperock"]')?.click()
    await vi.waitFor(() => {
      expect(putTroupeDrawPolicy).toHaveBeenCalled()
    })
    const body = putTroupeDrawPolicy.mock.calls[0]![1] as {
      defaultRule: { mode: string; allowedFormulaIds?: string[] }
      categoryRules: unknown[]
    }
    expect(body.defaultRule).toEqual({
      mode: 'CHOICE',
      allowedFormulaIds: ['sys-1', 'custom-pub'],
    })
    expect(body.categoryRules).toEqual([])
    fixture.detectChanges()
    expect(fixture.nativeElement.textContent).not.toContain('Apérock')
    expect(
      fixture.nativeElement.querySelector('[data-testid="draw-formula-unassign-aperock"]'),
    ).toBeNull()
  })

  it('does not PUT when policy load warning is active', async () => {
    const { fixture, putTroupeDrawPolicy, snackOpen } = await setup({ policyGetOk: false })
    await (
      fixture.componentInstance as unknown as {
        assignCategory: (formula: DrawFormula, slug: string) => Promise<void>
      }
    ).assignCategory(formulas[2]!, 'aperock')
    expect(putTroupeDrawPolicy).not.toHaveBeenCalled()
    expect(snackOpen).toHaveBeenCalledWith(
      'Politique de tirage indisponible. Recharge la page avant d’assigner une catégorie.',
      'OK',
      { duration: 7000 },
    )
  })

  it('ignores concurrent persist while saving is true', async () => {
    let resolvePut!: (value: {
      ok: true
      status: number
      data: {
        defaultRule: { mode: string; allowedFormulaIds: string[] }
        categoryRules: unknown[]
      }
    }) => void
    const putDeferred = new Promise<{
      ok: true
      status: number
      data: {
        defaultRule: { mode: string; allowedFormulaIds: string[] }
        categoryRules: unknown[]
      }
    }>((resolve) => {
      resolvePut = resolve
    })
    const putTroupeDrawPolicy = vi.fn().mockReturnValue(putDeferred)
    const list = vi.fn().mockResolvedValue({ ok: true, status: 200, data: formulas })
    const listCategories = vi.fn().mockResolvedValue({ ok: true, status: 200, data: glossary })
    const getTroupeDrawPolicy = vi
      .fn()
      .mockResolvedValue({ ok: true, status: 404, data: null })

    TestBed.resetTestingModule()
    const drawFormulaApi = { list }
    const drawPolicyApi = { getTroupeDrawPolicy, putTroupeDrawPolicy }
    const troupeApi = { listCategories }
    await TestBed.configureTestingModule({
      imports: [TroupeDrawFormulasTab, NoopAnimationsModule],
      providers: [
        { provide: DrawFormulaApiService, useValue: drawFormulaApi },
        { provide: DrawPolicyApiService, useValue: drawPolicyApi },
        { provide: TroupeApiService, useValue: troupeApi },
        { provide: MatDialog, useValue: { open: vi.fn() } },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
      ],
    }).compileComponents()

    const fixture = TestBed.createComponent(TroupeDrawFormulasTab)
    fixture.componentRef.setInput('troupeId', 't1')
    fixture.detectChanges()
    await vi.waitFor(() => expect(list).toHaveBeenCalled())

    const component = fixture.componentInstance as unknown as {
      assignCategory: (formula: DrawFormula, slug: string) => Promise<void>
    }
    const first = component.assignCategory(formulas[2]!, 'aperock')
    await vi.waitFor(() => expect(putTroupeDrawPolicy).toHaveBeenCalledTimes(1))
    await component.assignCategory(formulas[2]!, 'cabaret')
    expect(putTroupeDrawPolicy).toHaveBeenCalledTimes(1)
    resolvePut({
      ok: true,
      status: 200,
      data: {
        defaultRule: { mode: 'CHOICE', allowedFormulaIds: ['custom-pub', 'sys-1'] },
        categoryRules: [
          { category: 'aperock', mode: 'MANDATORY', mandatoryFormulaId: 'custom-pub' },
        ],
      },
    })
    await first
  })

  it('degrades gracefully when troupe policy GET fails', async () => {
    const { fixture } = await setup({ policyGetOk: false })
    expect(fixture.nativeElement.textContent).toContain('Ma formule')
    expect(fixture.nativeElement.textContent).not.toContain(
      'Impossible de charger les formules de tirage.',
    )
    expect(fixture.nativeElement.textContent).toContain(
      'Impossible de charger la politique de tirage.',
    )
  })

  it('shows load error when glossary GET fails', async () => {
    const { fixture } = await setup({ categoriesGetOk: false })
    expect(fixture.nativeElement.textContent).toContain(
      'Impossible de charger les formules de tirage.',
    )
  })

  it('shows a French snackbar and reloads policy when PUT fails', async () => {
    const { fixture, snackOpen, getTroupeDrawPolicy } = await setup({
      putResult: { ok: false, status: 400, errorMessage: 'Slug de catégorie inconnu' },
    })
    await (
      fixture.componentInstance as unknown as {
        assignCategory: (formula: DrawFormula, slug: string) => Promise<void>
      }
    ).assignCategory(formulas[2]!, 'aperock')
    expect(snackOpen).toHaveBeenCalledWith('Slug de catégorie inconnu', 'OK', { duration: 7000 })
    expect(getTroupeDrawPolicy.mock.calls.length).toBeGreaterThanOrEqual(2)
  })

  it('hides edit and archive actions for system formula', async () => {
    const { fixture } = await setup()
    expect(fixture.nativeElement.querySelector('[aria-label="Modifier V1"]')).toBeNull()
    expect(fixture.nativeElement.querySelector('[aria-label="Archiver V1"]')).toBeNull()
    expect(fixture.nativeElement.querySelector('[aria-label="Modifier Ma formule"]')).toBeTruthy()
    expect(fixture.nativeElement.querySelector('[aria-label="Archiver Ma formule"]')).toBeTruthy()
  })

  it('opens create dialog and refreshes list on success', async () => {
    const { fixture, list, dialogOpen, snackOpen } = await setup()
    await (
      fixture.componentInstance as unknown as { openCreate: () => Promise<void> }
    ).openCreate()
    fixture.detectChanges()
    expect(dialogOpen).toHaveBeenCalledWith(
      TroupeDrawFormulaEditorDialog,
      expect.objectContaining({
        data: { mode: 'create', troupeId: 't1' },
        disableClose: true,
      }),
    )
    expect(snackOpen).toHaveBeenCalledWith('Formule enregistrée', 'OK', { duration: 4000 })
    await vi.waitFor(() => {
      expect(list.mock.calls.length).toBeGreaterThanOrEqual(2)
    })
  })

  it('shows snackbar when archive returns 409', async () => {
    const { fixture, snackOpen } = await setup()
    await (
      fixture.componentInstance as unknown as {
        openArchive: (formula: DrawFormula) => Promise<void>
      }
    ).openArchive(formulas[1]!)
    fixture.detectChanges()
    expect(snackOpen).toHaveBeenCalledWith(
      "Cette formule est utilisée par une politique de tirage. Retire-la de la politique avant de l'archiver.",
      'OK',
      { duration: 7000 },
    )
  })
})
