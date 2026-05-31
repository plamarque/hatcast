import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { describe, expect, it } from 'vitest'

import type { StatisticsEventCell } from '../../core/seasons/season-statistics-api.service'
import { ParticipationEventCell } from './participation-event-cell'

describe('ParticipationEventCell', () => {
  async function setup(
    cell: StatisticsEventCell,
  ): Promise<ComponentFixture<ParticipationEventCell>> {
    await TestBed.configureTestingModule({
      imports: [ParticipationEventCell, NoopAnimationsModule],
    }).compileComponents()

    const fixture = TestBed.createComponent(ParticipationEventCell)
    fixture.componentRef.setInput('cell', cell)
    fixture.detectChanges()
    return fixture
  }

  it('applies selected modifier and role emoji', async () => {
    const fixture = await setup({
      status: 'selected',
      label: 'Comédien·ne',
      roleKey: 'player',
      tooltip: 'Comédien·ne',
    })
    const root = fixture.nativeElement.querySelector('.participation-event-cell') as HTMLElement
    expect(root.className).toContain('participation-event-cell--selected')
    expect(root.getAttribute('aria-label')).toBe('Comédien·ne')
    expect(fixture.nativeElement.querySelector('.participation-event-cell__emoji')?.textContent).toBe('🎭')
  })

  it('shows pending hourglass emoji', async () => {
    const fixture = await setup({
      status: 'pending',
      label: 'MC',
      roleKey: 'mc',
      tooltip: 'MC — En attente de confirmation',
    })
    const root = fixture.nativeElement.querySelector('.participation-event-cell') as HTMLElement
    expect(root.className).toContain('participation-event-cell--pending')
    expect(fixture.nativeElement.querySelector('.participation-event-cell__emoji')?.textContent).toBe('⏳')
  })

  it('renders neutral without emoji', async () => {
    const fixture = await setup({
      status: 'neutral',
      label: '—',
    })
    const root = fixture.nativeElement.querySelector('.participation-event-cell') as HTMLElement
    expect(root.className).toContain('participation-event-cell--neutral')
    expect(fixture.nativeElement.querySelector('.participation-event-cell__emoji')).toBeNull()
  })

  it('uses label as tooltip fallback', async () => {
    const fixture = await setup({
      status: 'unavailable',
      label: 'Non dispo',
    })
    const root = fixture.nativeElement.querySelector('.participation-event-cell') as HTMLElement
    expect(root.className).toContain('participation-event-cell--unavailable')
    expect(root.getAttribute('aria-label')).toBe('Non dispo')
  })
})
