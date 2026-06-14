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

  async function setupStrokedTroupe(
    triggerLabel = 'Gérer la troupe',
  ): Promise<ComponentFixture<ScopeAdminMenu>> {
    await TestBed.configureTestingModule({
      imports: [ScopeAdminMenu],
      providers: [provideRouter([])],
    }).compileComponents()

    const fixture = TestBed.createComponent(ScopeAdminMenu)
    fixture.componentRef.setInput('scope', 'troupe')
    fixture.componentRef.setInput('items', [
      {
        label: 'Membres',
        icon: 'groups',
        routerLink: ['/troupes', 'les-improbots', 'admin', 'membres'],
      },
    ])
    fixture.componentRef.setInput('triggerVariant', 'stroked')
    fixture.componentRef.setInput('triggerLabel', triggerLabel)
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
    expect(trigger.classList.contains('scope-admin-menu__trigger--stroked')).toBe(false)
  })

  it('renders stroked trigger with visible label and aria-label', async () => {
    const fixture = await setupStrokedTroupe()

    const trigger = fixture.nativeElement.querySelector(
      '.scope-admin-menu__trigger--stroked',
    ) as HTMLButtonElement
    expect(trigger).not.toBeNull()
    expect(trigger.getAttribute('aria-label')).toBe('Gérer la troupe')
    expect(trigger.textContent).toContain('Gérer la troupe')
    expect(trigger.querySelector('.scope-admin-menu__trigger-label')?.textContent?.trim()).toBe(
      'Gérer la troupe',
    )
  })

  it('omits visible label span when triggerLabel is whitespace only', async () => {
    const fixture = await setupStrokedTroupe('   ')

    const trigger = fixture.nativeElement.querySelector(
      '.scope-admin-menu__trigger--stroked',
    ) as HTMLButtonElement
    expect(trigger.querySelector('.scope-admin-menu__trigger-label')).toBeNull()
    expect(trigger.getAttribute('aria-label')).toBe('Administration de la troupe')
  })

  it('uses spectacle label for event scope', async () => {
    const fixture = await setup('event')
    const trigger = fixture.nativeElement.querySelector(
      '.scope-admin-menu__trigger',
    ) as HTMLButtonElement
    expect(trigger.getAttribute('aria-label')).toBe('Administration du spectacle')
  })
})
