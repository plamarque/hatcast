import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { describe, expect, it, vi } from 'vitest'

import { emptyRoleSlots } from '../../../core/events/event-types'
import { RoleSlotChipSet } from './role-slot-chip-set'

async function setup(counts: Record<string, number> = { ...emptyRoleSlots(), player: 2 }) {
  await TestBed.configureTestingModule({
    imports: [RoleSlotChipSet, NoopAnimationsModule],
  }).compileComponents()

  const fixture = TestBed.createComponent(RoleSlotChipSet)
  fixture.componentRef.setInput('counts', counts)
  fixture.componentRef.setInput('roleKeys', ['player', 'mc'])
  fixture.detectChanges()
  await fixture.whenStable()
  return { fixture }
}

describe('RoleSlotChipSet', () => {
  it('renders role labels with counts', async () => {
    const { fixture } = await setup()
    const text = fixture.nativeElement.textContent ?? ''
    expect(text).toContain('Comédien')
    expect(text).toContain('2')
    expect(text).toContain('MC')
  })

  it('emits countChange on increment', async () => {
    const { fixture } = await setup()
    const handler = vi.fn()
    fixture.componentInstance.countChange.subscribe(handler)

    const addButtons = [
      ...fixture.nativeElement.querySelectorAll('.role-slot-chip__step:last-child'),
    ]
    ;(addButtons[0] as HTMLButtonElement).click()

    expect(handler).toHaveBeenCalledWith({ key: 'player', count: 3 })
  })

  it('does not decrement below zero', async () => {
    const { fixture } = await setup({ ...emptyRoleSlots(), mc: 0 })
    const handler = vi.fn()
    fixture.componentInstance.countChange.subscribe(handler)

    const removeMc = fixture.nativeElement.querySelector(
      'button[aria-label="Diminuer MC"]',
    ) as HTMLButtonElement
    expect(removeMc.disabled).toBe(true)
    removeMc.click()
    expect(handler).not.toHaveBeenCalled()
  })
})
