import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { describe, expect, it, vi } from 'vitest'

import { RoleToggleChipSet } from './role-toggle-chip-set'

async function setup(selectedKeys: string[] = ['volunteer', 'player']) {
  await TestBed.configureTestingModule({
    imports: [RoleToggleChipSet, NoopAnimationsModule],
  }).compileComponents()

  const fixture = TestBed.createComponent(RoleToggleChipSet)
  fixture.componentRef.setInput('selectedKeys', selectedKeys)
  fixture.detectChanges()
  await fixture.whenStable()
  return { fixture }
}

describe('RoleToggleChipSet', () => {
  it('renders role chips with emoji and label', async () => {
    const { fixture } = await setup()
    const text = fixture.nativeElement.textContent ?? ''
    expect(text).toContain('Bénévole')
    expect(text).toContain('Comédien')
    expect(fixture.nativeElement.querySelectorAll('mat-chip').length).toBeGreaterThan(0)
  })

  it('emits selection when toggling an unlocked role', async () => {
    const { fixture } = await setup()
    const component = fixture.componentInstance
    const handler = vi.fn()
    component.selectionChange.subscribe(handler)

    component['onChipClick']('mc')
    expect(handler).toHaveBeenCalledWith(
      expect.arrayContaining(['volunteer', 'player', 'mc']),
    )
  })

  it('does not emit when toggling volunteer off', async () => {
    const { fixture } = await setup(['volunteer'])
    const component = fixture.componentInstance
    const handler = vi.fn()
    component.selectionChange.subscribe(handler)

    component['onChipClick']('volunteer')
    expect(handler).not.toHaveBeenCalled()
  })

  it('removes a role when toggling off', async () => {
    const { fixture } = await setup(['volunteer', 'player', 'mc'])
    const component = fixture.componentInstance
    const handler = vi.fn()
    component.selectionChange.subscribe(handler)

    component['onChipClick']('mc')
    expect(handler).toHaveBeenCalledWith(['volunteer', 'player'])
  })

  it('emits chipToggled when lockVolunteer is false', async () => {
    const { fixture } = await setup(['player'])
    fixture.componentRef.setInput('lockVolunteer', false)
    fixture.detectChanges()

    const component = fixture.componentInstance
    const handler = vi.fn()
    component.chipToggled.subscribe(handler)

    component['onChipClick']('mc')
    expect(handler).toHaveBeenCalledWith({ key: 'mc', checked: true })
  })

  it('allows toggling volunteer off when lockVolunteer is false', async () => {
    const { fixture } = await setup(['volunteer', 'player'])
    fixture.componentRef.setInput('lockVolunteer', false)
    fixture.detectChanges()

    const component = fixture.componentInstance
    const handler = vi.fn()
    component.chipToggled.subscribe(handler)

    component['onChipClick']('volunteer')
    expect(handler).toHaveBeenCalledWith({ key: 'volunteer', checked: false })
  })
})
