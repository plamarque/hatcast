import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
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
  }> = {},
) {
  const listCategories = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    data: glossary,
  })
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
  }).compileComponents()

  const fixture = TestBed.createComponent(EventCategoryDialog)
  fixture.detectChanges()
  await fixture.whenStable()

  return { fixture, close, listCategories }
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
