import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { describe, expect, it, vi } from 'vitest'

import { ScopeAdminBar } from './scope-admin-bar'

describe('ScopeAdminBar', () => {
  async function setup(scope: 'troupe' | 'saison' | 'event' = 'saison') {
    await TestBed.configureTestingModule({
      imports: [ScopeAdminBar],
      providers: [provideRouter([])],
    }).compileComponents()

    const fixture = TestBed.createComponent(ScopeAdminBar)
    fixture.componentRef.setInput('scope', scope)
    fixture.componentRef.setInput('items', [
      {
        label: 'Participants',
        icon: 'groups',
        routerLink: ['/saison', 'festibask', 'admin', 'participants'],
      },
    ])
    fixture.detectChanges()
    return fixture
  }

  it('renders nothing when items are empty', async () => {
    await TestBed.configureTestingModule({
      imports: [ScopeAdminBar],
      providers: [provideRouter([])],
    }).compileComponents()

    const fixture = TestBed.createComponent(ScopeAdminBar)
    fixture.componentRef.setInput('scope', 'saison')
    fixture.componentRef.setInput('items', [])
    fixture.detectChanges()

    expect(fixture.nativeElement.querySelector('.scope-admin-bar')).toBeNull()
  })

  it('shows saison panel title and expands on trigger click', async () => {
    const fixture = await setup('saison')
    const el = fixture.nativeElement as HTMLElement

    expect(el.querySelector('.scope-admin-bar__trigger-label')?.textContent).toContain(
      'Administration de la saison',
    )
    expect(el.querySelector('.scope-admin-bar__list')).toBeNull()

    const trigger = el.querySelector('.scope-admin-bar__trigger') as HTMLButtonElement
    trigger.click()
    fixture.detectChanges()

    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    const link = el.querySelector('.scope-admin-bar__link') as HTMLAnchorElement
    expect(link.getAttribute('href')).toBe('/saison/festibask/admin/participants')
    expect(link.textContent).toContain('Participants')
  })

  it('uses spectacle title for event scope', async () => {
    const fixture = await setup('event')
    expect(fixture.nativeElement.textContent).toContain('Administration du spectacle')
  })

  it('uses troupe title for troupe scope', async () => {
    const fixture = await setup('troupe')
    expect(fixture.nativeElement.textContent).toContain('Administration de la troupe')
  })

  it('invokes action callback for button items', async () => {
    await TestBed.configureTestingModule({
      imports: [ScopeAdminBar],
      providers: [provideRouter([])],
    }).compileComponents()

    const fixture = TestBed.createComponent(ScopeAdminBar)
    const action = vi.fn()
    fixture.componentRef.setInput('scope', 'event')
    fixture.componentRef.setInput('items', [
      { label: 'Participants du spectacle', icon: 'groups', action },
    ])
    fixture.detectChanges()

    const trigger = fixture.nativeElement.querySelector('.scope-admin-bar__trigger') as HTMLButtonElement
    trigger.click()
    fixture.detectChanges()

    const btn = fixture.nativeElement.querySelector('.scope-admin-bar__link') as HTMLButtonElement
    btn.click()
    expect(action).toHaveBeenCalledOnce()
  })
})
