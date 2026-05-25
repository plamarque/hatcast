import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { describe, expect, it, vi } from 'vitest'

import { TroupeApiService } from '../../core/troupes/troupe-api.service'
import { EventEquityTagDialog } from './event-equity-tag-dialog'

const glossary = [
  { slug: 'deplacements', label: 'Déplacements' },
  { slug: 'aperock', label: 'Apérock' },
]

async function setup(initialQuery = '') {
  const listEquityTags = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    data: glossary,
  })
  const close = vi.fn()

  await TestBed.configureTestingModule({
    imports: [EventEquityTagDialog, NoopAnimationsModule],
    providers: [
      { provide: MatDialogRef, useValue: { close } },
      {
        provide: MAT_DIALOG_DATA,
        useValue: { troupeId: 'troupe-1', initialQuery },
      },
      { provide: TroupeApiService, useValue: { listEquityTags } },
    ],
  }).compileComponents()

  const fixture = TestBed.createComponent(EventEquityTagDialog)
  fixture.detectChanges()
  await fixture.whenStable()

  return { fixture, close, listEquityTags }
}

describe('EventEquityTagDialog', () => {
  it('loads glossary on init', async () => {
    const { listEquityTags } = await setup()
    await vi.waitFor(() => {
      expect(listEquityTags).toHaveBeenCalledWith('troupe-1')
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
