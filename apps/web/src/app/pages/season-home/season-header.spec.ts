import { OverlayContainer } from '@angular/cdk/overlay'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { provideRouter } from '@angular/router'
import { describe, expect, it } from 'vitest'

import { SeasonHeader } from './season-header'

describe('SeasonHeader', () => {
  it('shows a single Membres settings link to admin route', async () => {
    await TestBed.configureTestingModule({
      imports: [SeasonHeader, NoopAnimationsModule],
      providers: [provideRouter([])],
    }).compileComponents()

    const fixture = TestBed.createComponent(SeasonHeader)
    fixture.componentRef.setInput('seasonTitle', 'Saison A')
    fixture.componentRef.setInput('seasonSlug', 'season-a')
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
})
