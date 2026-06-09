import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { describe, expect, it } from 'vitest'

import { RoleDisplayChipSet } from './role-display-chip-set'

async function setup(items: { key: 'player' | 'mc'; suffix?: string }[] = [{ key: 'player' }]) {
  await TestBed.configureTestingModule({
    imports: [RoleDisplayChipSet, NoopAnimationsModule],
  }).compileComponents()

  const fixture = TestBed.createComponent(RoleDisplayChipSet)
  fixture.componentRef.setInput('items', items)
  fixture.detectChanges()
  await fixture.whenStable()
  return { fixture }
}

describe('RoleDisplayChipSet', () => {
  it('renders readonly chips with emoji, label and suffix', async () => {
    const { fixture } = await setup([
      { key: 'player', suffix: ': 2' },
      { key: 'mc' },
    ])
    const text = fixture.nativeElement.textContent ?? ''
    expect(text).toContain('Comédien·ne')
    expect(text).toContain(': 2')
    expect(text).toContain('MC')
    expect(fixture.nativeElement.querySelectorAll('mat-chip').length).toBe(2)
  })

  it('shows empty message when items are empty', async () => {
    const { fixture } = await setup([])
    fixture.componentRef.setInput('emptyMessage', 'Aucun rôle')
    fixture.detectChanges()

    expect(fixture.nativeElement.textContent).toContain('Aucun rôle')
    expect(fixture.nativeElement.querySelector('mat-chip-set')).toBeNull()
  })

  it('uses gender-aware labels', async () => {
    const { fixture } = await setup([{ key: 'player' }])
    fixture.componentRef.setInput('gender', 'female')
    fixture.detectChanges()

    expect(fixture.nativeElement.textContent).toContain('Comédienne')
  })
})
