import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { describe, expect, it } from 'vitest'

import { ScopeAdminMenu } from './scope-admin-menu'

describe('ScopeAdminMenu', () => {
  async function setup(scope: 'troupe' | 'saison' | 'event' = 'saison') {
    await TestBed.configureTestingModule({
      imports: [ScopeAdminMenu],
      providers: [provideRouter([])],
    }).compileComponents()

    const fixture = TestBed.createComponent(ScopeAdminMenu)
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
      imports: [ScopeAdminMenu],
      providers: [provideRouter([])],
    }).compileComponents()

    const fixture = TestBed.createComponent(ScopeAdminMenu)
    fixture.componentRef.setInput('scope', 'saison')
    fixture.componentRef.setInput('items', [])
    fixture.detectChanges()

    expect(fixture.nativeElement.querySelector('.scope-admin-menu__trigger')).toBeNull()
  })

  it('shows settings gear with scope aria-label', async () => {
    const fixture = await setup('saison')
    const trigger = fixture.nativeElement.querySelector(
      '.scope-admin-menu__trigger',
    ) as HTMLButtonElement

    expect(trigger.getAttribute('aria-label')).toBe('Administration de la saison')
    expect(trigger.querySelector('mat-icon')?.textContent?.trim()).toBe('settings')
  })

  it('uses spectacle label for event scope', async () => {
    const fixture = await setup('event')
    const trigger = fixture.nativeElement.querySelector(
      '.scope-admin-menu__trigger',
    ) as HTMLButtonElement
    expect(trigger.getAttribute('aria-label')).toBe('Administration du spectacle')
  })

})
