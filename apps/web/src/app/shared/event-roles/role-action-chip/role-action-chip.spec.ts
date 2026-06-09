import { ComponentFixture, TestBed } from '@angular/core/testing'
import { describe, expect, it, vi } from 'vitest'

import { RoleActionChip } from './role-action-chip'
import { roleActionChipDisplayText } from './role-action-chip-label'

async function setup(
  inputs: {
    roleKey?: string
    gender?: 'female' | 'male'
    hasAssignee?: boolean
    interactive?: boolean
    active?: boolean
  } = {},
) {
  await TestBed.configureTestingModule({
    imports: [RoleActionChip],
  }).compileComponents()

  const fixture = TestBed.createComponent(RoleActionChip)
  fixture.componentRef.setInput('roleKey', inputs.roleKey ?? 'player')
  if (inputs.gender) {
    fixture.componentRef.setInput('gender', inputs.gender)
  }
  if (inputs.hasAssignee !== undefined) {
    fixture.componentRef.setInput('hasAssignee', inputs.hasAssignee)
  }
  if (inputs.interactive !== undefined) {
    fixture.componentRef.setInput('interactive', inputs.interactive)
  }
  if (inputs.active !== undefined) {
    fixture.componentRef.setInput('active', inputs.active)
  }
  fixture.detectChanges()
  return { fixture }
}

describe('roleActionChipDisplayText', () => {
  it('uses gender-aware label when assignee is set', () => {
    expect(
      roleActionChipDisplayText('player', { gender: 'female', hasAssignee: true }),
    ).toBe('🎭 Comédienne')
  })

  it('uses audit baseline when slot is empty', () => {
    expect(roleActionChipDisplayText('player', { hasAssignee: false })).toBe('🎭 Comédien·ne')
  })
})

describe('RoleActionChip', () => {
  it('renders readonly span by default', async () => {
    const { fixture } = await setup({ hasAssignee: false })
    expect(fixture.nativeElement.querySelector('button')).toBeNull()
    expect(fixture.nativeElement.textContent).toContain('Comédien·ne')
  })

  it('renders interactive button and emits actionClick', async () => {
    const { fixture } = await setup({ interactive: true, hasAssignee: true, gender: 'female' })
    const handler = vi.fn()
    fixture.componentInstance.actionClick.subscribe(handler)

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement
    button.click()

    expect(handler).toHaveBeenCalledTimes(1)
    expect(fixture.nativeElement.textContent).toContain('Comédienne')
  })

  it('applies active class when pool is open', async () => {
    const { fixture } = await setup({ interactive: true, active: true })
    expect(fixture.nativeElement.querySelector('.role-action-chip--active')).toBeTruthy()
  })
})
