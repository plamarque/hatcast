import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { of } from 'rxjs'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { TroupeApiService, type TroupeCategory } from '../../core/troupes/troupe-api.service'
import { TroupeCategoriesTab } from './troupe-categories-tab'
import { TroupeCategoryDeleteDialog } from './troupe-category-delete-dialog'
import { TroupeCategoryFormDialog } from './troupe-category-form-dialog'

describe('TroupeCategoriesTab', () => {
  afterEach(() => {
    TestBed.resetTestingModule()
  })

  const categories = [
    { slug: 'principal', label: 'Spectacles ordinaires' },
    { slug: 'deplacements', label: 'Déplacements' },
    { slug: 'cabaret', label: 'Cabaret' },
  ]

  async function setup() {
    const listCategories = vi.fn().mockResolvedValue({ ok: true, status: 200, data: categories })
    const createCategory = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      data: { slug: 'nouveau', label: 'Nouveau' },
    })
    const updateCategoryLabel = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      data: { slug: 'cabaret', label: 'Cabaret modifié' },
    })
    const previewDeleteCategory = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      data: { eventCount: 2 },
    })
    const deleteCategory = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      data: { affectedEventCount: 2 },
    })

    const dialogOpen = vi.fn().mockImplementation((component, config) => {
      if (component === TroupeCategoryFormDialog) {
        const mode = config?.data?.mode
        return {
          afterClosed: () =>
            of(
              mode === 'create'
                ? { ok: true, category: { slug: 'nouveau', label: 'Nouveau' } }
                : { ok: true, category: { slug: 'cabaret', label: 'Cabaret modifié' } },
            ),
        }
      }
      if (component === TroupeCategoryDeleteDialog) {
        return {
          afterClosed: () => of({ ok: true }),
        }
      }
      return { afterClosed: () => of(undefined) }
    })

    TestBed.resetTestingModule()
    const troupeApi = {
      listCategories,
      createCategory,
      updateCategoryLabel,
      previewDeleteCategory,
      deleteCategory,
    }
    await TestBed.configureTestingModule({
      imports: [TroupeCategoriesTab, NoopAnimationsModule],
      providers: [
        { provide: TroupeApiService, useValue: troupeApi },
        { provide: MatDialog, useValue: { open: dialogOpen } },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
      ],
    })
      .overrideProvider(TroupeApiService, { useValue: troupeApi })
      .overrideProvider(MatDialog, { useValue: { open: dialogOpen } })
      .compileComponents()

    const fixture = TestBed.createComponent(TroupeCategoriesTab)
    fixture.componentRef.setInput('troupeId', 't1')
    fixture.detectChanges()
    await vi.waitFor(() => {
      expect(listCategories).toHaveBeenCalledWith('t1')
      expect(fixture.nativeElement.textContent).toContain('Déplacements')
    })
    return {
      fixture,
      listCategories,
      createCategory,
      updateCategoryLabel,
      previewDeleteCategory,
      deleteCategory,
      dialogOpen,
    }
  }

  it('renders glossary rows from API', async () => {
    const { fixture } = await setup()
    const text = fixture.nativeElement.textContent ?? ''
    expect(text).toContain('Spectacles ordinaires')
    expect(text).toContain('Catégorie par défaut')
    expect(text).toContain('Déplacements')
    expect(text).toContain('Cabaret')
  })

  it('opens create dialog and refreshes list on success', async () => {
    const { fixture, listCategories, dialogOpen } = await setup()
    await vi.waitFor(() => {
      expect(fixture.nativeElement.querySelector('.troupe-categories-tab__add')).toBeTruthy()
    })
    await (
      fixture.componentInstance as unknown as { openCreate: () => Promise<void> }
    ).openCreate()
    fixture.detectChanges()
    expect(dialogOpen).toHaveBeenCalledWith(
      TroupeCategoryFormDialog,
      expect.objectContaining({
        data: { mode: 'create', troupeId: 't1' },
      }),
    )
    await vi.waitFor(() => {
      expect(listCategories.mock.calls.length).toBeGreaterThanOrEqual(2)
    })
  })

  it('hides delete action for default category', async () => {
    const { fixture } = await setup()
    expect(
      fixture.nativeElement.querySelector('[aria-label="Supprimer Spectacles ordinaires"]'),
    ).toBeNull()
    expect(fixture.nativeElement.querySelector('[aria-label="Supprimer Cabaret"]')).toBeTruthy()
  })

  it('opens delete dialog with preview flow', async () => {
    const { fixture, dialogOpen } = await setup()
    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain('Cabaret')
    })
    await (
      fixture.componentInstance as unknown as {
        openDelete: (c: TroupeCategory & { defaultCategoryLabel?: string }) => Promise<void>
      }
    ).openDelete({
      slug: 'cabaret',
      label: 'Cabaret',
      defaultCategoryLabel: 'Spectacles ordinaires',
    })
    fixture.detectChanges()
    expect(dialogOpen).toHaveBeenCalledWith(
      TroupeCategoryDeleteDialog,
      expect.objectContaining({
        data: {
          troupeId: 't1',
          slug: 'cabaret',
          label: 'Cabaret',
          defaultCategoryLabel: 'Spectacles ordinaires',
        },
      }),
    )
  })
})
