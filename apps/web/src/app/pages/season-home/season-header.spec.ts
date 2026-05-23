import { OverlayContainer } from '@angular/cdk/overlay'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { provideRouter } from '@angular/router'
import { describe, expect, it } from 'vitest'

import { TroupeContextService } from '../../core/troupes/troupe-context.service'
import { SeasonHeader } from './season-header'

describe('SeasonHeader', () => {
  async function setup(options?: { troupeDisplayName?: string | null }) {
    const troupeContext = {
      currentUserDisplayLabel: (user: { displayName: string | null; email: string | null } | null) => {
        if (options?.troupeDisplayName) return options.troupeDisplayName
        return user?.displayName || user?.email || 'Compte'
      },
    }

    await TestBed.configureTestingModule({
      imports: [SeasonHeader, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: TroupeContextService, useValue: troupeContext },
      ],
    }).compileComponents()

    const fixture = TestBed.createComponent(SeasonHeader)
    fixture.componentRef.setInput('seasonTitle', 'Saison A')
    fixture.componentRef.setInput('seasonSlug', 'season-a')
    fixture.componentRef.setInput('user', {
      email: 'a@example.com',
      displayName: 'Account Name',
    })
    fixture.detectChanges()
    return fixture
  }

  it('shows a single Membres settings link to admin route', async () => {
    const fixture = await setup()
    fixture.componentRef.setInput('canManageSettings', true)
    fixture.detectChanges()

    const settingsBtn = fixture.nativeElement.querySelector(
      '[aria-label="Réglages saison"]',
    ) as HTMLButtonElement
    settingsBtn.click()
    fixture.detectChanges()
    await fixture.whenStable()
    fixture.detectChanges()

    const overlayEl = TestBed.inject(OverlayContainer).getContainerElement()
    expect(overlayEl.textContent).toContain('Membres')
    expect(overlayEl.textContent).not.toContain('Organisateur')
    expect(overlayEl.querySelector('a[href*="admin/membres"]')).toBeTruthy()
  })

  it('affiche le pseudo troupe plutôt que le nom de compte quand le contexte le fournit', async () => {
    const fixture = await setup({ troupeDisplayName: 'Patou' })

    expect(fixture.nativeElement.textContent).toContain('Patou')
    expect(fixture.nativeElement.textContent).not.toContain('Account Name')
  })
})
