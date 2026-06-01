import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { provideRouter, Router } from '@angular/router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { TroupeCard } from './troupe-card'

describe('TroupeCard', () => {
  beforeEach(() => {
    localStorage.removeItem('hatcast.postLoginRedirect')
  })

  async function setup(
    mode: 'mine' | 'discover' = 'mine',
    discoverAction: 'login' | 'open' = 'open',
  ): Promise<{ fixture: ComponentFixture<TroupeCard>; router: Router }> {
    await TestBed.configureTestingModule({
      imports: [TroupeCard, NoopAnimationsModule],
      providers: [provideRouter([])],
    }).compileComponents()

    const fixture = TestBed.createComponent(TroupeCard)
    fixture.componentRef.setInput('name', 'La Malice')
    fixture.componentRef.setInput('slug', 'la-malice')
    fixture.componentRef.setInput('memberCount', 4)
    fixture.componentRef.setInput('upcomingCount', 2)
    fixture.componentRef.setInput('mode', mode)
    fixture.componentRef.setInput('discoverAction', discoverAction)
    fixture.detectChanges()
    return { fixture, router: TestBed.inject(Router) }
  }

  it('affiche un CTA Material vers le hub en mode mine', async () => {
    const { fixture } = await setup('mine')
    const link = fixture.nativeElement.querySelector('a[mat-flat-button]') as HTMLAnchorElement
    expect(link).toBeTruthy()
    expect(link.getAttribute('href')).toBe('/troupes/la-malice')
    expect(link.getAttribute('aria-label')).toBe('Ouvrir La Malice')
    expect(link.textContent?.trim()).toBe('Ouvrir')
    expect(fixture.nativeElement.textContent).toContain('4 membres')
  })

  it('navigue vers connexion avec redirect en mode discover login', async () => {
    const { fixture, router } = await setup('discover', 'login')
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true)
    const button = fixture.nativeElement.querySelector('button[mat-flat-button]') as HTMLButtonElement
    expect(button.getAttribute('aria-label')).toBe('Voir La Malice')
    expect(button.textContent?.trim()).toBe('Voir')
    button.click()
    fixture.detectChanges()

    expect(localStorage.getItem('hatcast.postLoginRedirect')).toBe('/troupes/la-malice')
    expect(navigate).toHaveBeenCalledWith(['/connexion'])
    expect(fixture.nativeElement.querySelector('a[mat-flat-button]')).toBeNull()
  })

  it('affiche un CTA Material vers le hub en mode discover open', async () => {
    const { fixture } = await setup('discover', 'open')
    const link = fixture.nativeElement.querySelector('a[mat-flat-button]') as HTMLAnchorElement
    expect(link.getAttribute('href')).toBe('/troupes/la-malice')
    expect(link.getAttribute('aria-label')).toBe('Voir La Malice')
    expect(link.textContent?.trim()).toBe('Voir')
  })
})
