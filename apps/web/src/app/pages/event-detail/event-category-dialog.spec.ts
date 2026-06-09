import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { provideRouter, Router } from '@angular/router'
import { describe, expect, it, vi } from 'vitest'

import { TroupeApiService } from '../../core/troupes/troupe-api.service'
import {
  DEFAULT_CATEGORY_DISPLAY_LABEL,
  EventCategoryDialog,
} from './event-category-dialog'

const glossary = [
  { slug: 'aperock', label: 'Apérock' },
  { slug: 'deplacements', label: 'Déplacements' },
]

async function setup(
  overrides: Partial<{
    initialCategorySlug: string | null
    canManageTroupe: boolean
    listCategoriesResult: { ok: boolean; status: number; data?: typeof glossary }
  }> = {},
) {
  const snackOpen = vi.fn()
  const listCategories = vi.fn().mockResolvedValue(
    overrides.listCategoriesResult ?? {
      ok: true,
      status: 200,
      data: glossary,
    },
  )
  const close = vi.fn()

  await TestBed.configureTestingModule({
    imports: [EventCategoryDialog, NoopAnimationsModule],
    providers: [
      provideRouter([]),
      { provide: MatDialogRef, useValue: { close } },
      {
        provide: MAT_DIALOG_DATA,
        useValue: {
          troupeId: 'troupe-1',
          troupeSlug: 'improbots',
          initialCategorySlug: null,
          canManageTroupe: false,
          ...overrides,
        },
      },
      { provide: TroupeApiService, useValue: { listCategories } },
    ],
  })
    .overrideComponent(EventCategoryDialog, {
      set: {
        providers: [{ provide: MatSnackBar, useValue: { open: snackOpen } }],
      },
    })
    .compileComponents()

  const fixture = TestBed.createComponent(EventCategoryDialog)
  fixture.detectChanges()
  await fixture.whenStable()

  return { fixture, close, listCategories, snackOpen }
}

describe('EventCategoryDialog', () => {
  it('loads glossary on init', async () => {
    const { listCategories } = await setup()
    await vi.waitFor(() => {
      expect(listCategories).toHaveBeenCalledWith('troupe-1')
    })
  })

  it('orders options: ordinaire, déplacements, then custom A-Z', async () => {
    const { fixture } = await setup()
    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain('Apérock')
    })

    const cmp = fixture.componentInstance as unknown as {
      categoryOptions: () => { slug: string | null; label: string }[]
    }

    expect(cmp.categoryOptions().map((o) => o.label)).toEqual([
      DEFAULT_CATEGORY_DISPLAY_LABEL,
      'Déplacements',
      'Apérock',
    ])
  })

  it('closes with selected slug on submit', async () => {
    const { fixture, close } = await setup()
    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain('Apérock')
    })

    const cmp = fixture.componentInstance as unknown as {
      onSelectionChange: (v: string | null) => void
      submit: () => void
    }

    cmp.onSelectionChange('aperock')
    cmp.submit()

    expect(close).toHaveBeenCalledWith('aperock')
  })

  it('closes with null when ordinaire selected', async () => {
    const { fixture, close } = await setup({ initialCategorySlug: 'aperock' })
    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain('Apérock')
    })

    const cmp = fixture.componentInstance as unknown as {
      onSelectionChange: (v: string | null) => void
      submit: () => void
    }

    cmp.onSelectionChange(null)
    cmp.submit()

    expect(close).toHaveBeenCalledWith(null)
  })

  it('shows skeleton rows while glossary loads', async () => {
    const listCategories = vi.fn(
      () =>
        new Promise<{ ok: boolean; status: number; data: typeof glossary }>((resolve) => {
          setTimeout(
            () =>
              resolve({
                ok: true,
                status: 200,
                data: glossary,
              }),
            50,
          )
        }),
    )
    const close = vi.fn()
    const snackOpen = vi.fn()

    await TestBed.configureTestingModule({
      imports: [EventCategoryDialog, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: MatDialogRef, useValue: { close } },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            troupeId: 'troupe-1',
            troupeSlug: 'improbots',
            initialCategorySlug: null,
            canManageTroupe: false,
          },
        },
        { provide: TroupeApiService, useValue: { listCategories } },
      ],
    })
      .overrideComponent(EventCategoryDialog, {
        set: {
          providers: [{ provide: MatSnackBar, useValue: { open: snackOpen } }],
        },
      })
      .compileComponents()

    const fixture = TestBed.createComponent(EventCategoryDialog)
    fixture.detectChanges()

    expect(fixture.nativeElement.querySelectorAll('.category-dialog__skeleton-row')).toHaveLength(3)
    expect(fixture.nativeElement.querySelector('mat-radio-group')).toBeNull()

    await vi.waitFor(() => {
      expect(fixture.nativeElement.querySelector('mat-radio-group')).not.toBeNull()
    })
  })

  it('shows snackbar when glossary load fails', async () => {
    const { snackOpen } = await setup({
      listCategoriesResult: { ok: false, status: 500 },
    })

    await vi.waitFor(() => {
      expect(snackOpen).toHaveBeenCalledWith('Impossible de charger les catégories.', 'OK', {
        duration: 6000,
      })
    })
  })

  it('includes orphan event slug when missing from glossary', async () => {
    const { fixture } = await setup({ initialCategorySlug: 'legacy-slug' })
    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain('Apérock')
    })

    const cmp = fixture.componentInstance as unknown as {
      categoryOptions: () => { slug: string | null; label: string }[]
    }

    expect(cmp.categoryOptions().some((o) => o.slug === 'legacy-slug')).toBe(true)
  })

  it('shows manage link for troupe admin and navigates to settings', async () => {
    const { fixture, close } = await setup({ canManageTroupe: true })
    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain('Gérer les catégories')
    })

    const router = TestBed.inject(Router)
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true)

    const link = fixture.nativeElement.querySelector(
      '.category-dialog__manage-link',
    ) as HTMLButtonElement
    link.click()

    expect(close).toHaveBeenCalledWith(undefined)
    expect(navigateSpy).toHaveBeenCalledWith(['/', 'troupes', 'improbots', 'admin', 'parametres'], {
      queryParams: { tab: 'categories' },
    })
  })
})
