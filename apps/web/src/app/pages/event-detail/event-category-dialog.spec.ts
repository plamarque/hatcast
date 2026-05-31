import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { describe, expect, it, vi } from 'vitest'

import { TroupeApiService } from '../../core/troupes/troupe-api.service'
import { EventCategoryDialog } from './event-category-dialog'

const glossary = [
  { slug: 'deplacements', label: 'Déplacements' },
  { slug: 'aperock', label: 'Apérock' },
]

async function setup(initialQuery = '') {
  const listCategories = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    data: glossary,
  })
  const close = vi.fn()

  await TestBed.configureTestingModule({
    imports: [EventCategoryDialog, NoopAnimationsModule],
    providers: [
      { provide: MatDialogRef, useValue: { close } },
      {
        provide: MAT_DIALOG_DATA,
        useValue: { troupeId: 'troupe-1', initialQuery },
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

  it('filters glossary entries for autocomplete', async () => {
    const { fixture } = await setup()
    const cmp = fixture.componentInstance as unknown as {
      onQueryInput: (v: string) => void
      filteredTags: () => { slug: string; label: string }[]
    }

    cmp.onQueryInput('apé')
    expect(cmp.filteredTags()).toHaveLength(1)
    expect(cmp.filteredTags()[0]?.slug).toBe('aperock')
  })

  it('closes with trimmed tag on submit', async () => {
    const { fixture, close } = await setup()
    const cmp = fixture.componentInstance as unknown as {
      onQueryInput: (v: string) => void
      submit: () => void
    }

    cmp.onQueryInput('  Déplacements  ')
    cmp.submit()

    expect(close).toHaveBeenCalledWith('Déplacements')
  })

  it('closes with null when submit with empty query', async () => {
    const { fixture, close } = await setup('ancien')
    const cmp = fixture.componentInstance as unknown as {
      onQueryInput: (v: string) => void
      submit: () => void
    }

    cmp.onQueryInput('')
    cmp.submit()

    expect(close).toHaveBeenCalledWith(null)
  })
})
