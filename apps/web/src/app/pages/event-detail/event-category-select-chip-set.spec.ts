import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { describe, expect, it, vi } from 'vitest'

import { EventCategorySelectChipSet } from './event-category-select-chip-set'
import {
  buildEventCategoryOptions,
  DEFAULT_CATEGORY_DISPLAY_LABEL,
} from './event-category.constants'

async function setup(
  overrides: Partial<{
    selectedSlug: string | null
    disabled: boolean
    glossary: { slug: string; label: string }[]
    eventCategorySlug: string | null
  }> = {},
) {
  const glossary = overrides.glossary ?? [
    { slug: 'aperock', label: 'Apérock' },
    { slug: 'deplacements', label: 'Déplacements' },
  ]
  const eventCategorySlug = overrides.eventCategorySlug ?? null

  await TestBed.configureTestingModule({
    imports: [EventCategorySelectChipSet, NoopAnimationsModule],
  }).compileComponents()

  const fixture = TestBed.createComponent(EventCategorySelectChipSet)
  fixture.componentRef.setInput(
    'options',
    buildEventCategoryOptions(glossary, eventCategorySlug),
  )
  fixture.componentRef.setInput('selectedSlug', overrides.selectedSlug ?? null)
  fixture.componentRef.setInput('disabled', overrides.disabled ?? false)
  fixture.detectChanges()

  const emissions: (string | null)[] = []
  fixture.componentInstance.categorySelect.subscribe((value) => {
    emissions.push(value)
  })

  return { fixture, emissions }
}

describe('EventCategorySelectChipSet', () => {
  it('orders options via buildEventCategoryOptions', async () => {
    const { fixture } = await setup()
    const text = fixture.nativeElement.textContent ?? ''
    expect(text.indexOf(DEFAULT_CATEGORY_DISPLAY_LABEL)).toBeLessThan(
      text.indexOf('Déplacements'),
    )
    expect(text.indexOf('Déplacements')).toBeLessThan(text.indexOf('Apérock'))
  })

  it('highlights selected chip', async () => {
    const { fixture } = await setup({ selectedSlug: 'deplacements' })
    const chips = fixture.nativeElement.querySelectorAll('mat-chip')
    const deplacements = [...chips].find((chip) => chip.textContent?.includes('Déplacements'))
    expect(deplacements?.classList.contains('mat-mdc-chip-highlighted')).toBe(true)
  })

  it('emits slug when a different chip is clicked', async () => {
    const { fixture, emissions } = await setup({ selectedSlug: null })
    const chips = fixture.nativeElement.querySelectorAll('mat-chip')
    const deplacements = [...chips].find((chip) => chip.textContent?.includes('Déplacements'))
    deplacements?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(emissions).toEqual(['deplacements'])
  })

  it('does not emit when clicking the already selected chip', async () => {
    const { fixture, emissions } = await setup({ selectedSlug: null })
    const chips = fixture.nativeElement.querySelectorAll('mat-chip')
    const ordinaire = [...chips].find((chip) =>
      chip.textContent?.includes(DEFAULT_CATEGORY_DISPLAY_LABEL),
    )
    ordinaire?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(emissions).toEqual([])
  })

  it('does not emit when disabled', async () => {
    const { fixture, emissions } = await setup({ selectedSlug: null, disabled: true })
    const chips = fixture.nativeElement.querySelectorAll('mat-chip')
    const deplacements = [...chips].find((chip) => chip.textContent?.includes('Déplacements'))
    deplacements?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(emissions).toEqual([])
  })
})

describe('buildEventCategoryOptions', () => {
  it('includes orphan event slug not in glossary', () => {
    const options = buildEventCategoryOptions(
      [{ slug: 'deplacements', label: 'Déplacements' }],
      'fantome',
    )
    expect(options.some((o) => o.slug === 'fantome')).toBe(true)
  })
})
