import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { provideRouter } from '@angular/router'
import { describe, expect, it } from 'vitest'

import { SeasonHeader } from './season-header'

describe('SeasonHeader', () => {
  async function setup(): Promise<ComponentFixture<SeasonHeader>> {
    await TestBed.configureTestingModule({
      imports: [SeasonHeader, NoopAnimationsModule],
      providers: [provideRouter([])],
    }).compileComponents()

    const fixture = TestBed.createComponent(SeasonHeader)
    fixture.componentRef.setInput('seasonTitle', 'Saison A')
    fixture.componentRef.setInput('seasonSlug', 'season-a')
    fixture.componentRef.setInput('seasonId', 'season-id-1')
    fixture.componentRef.setInput('troupeId', 'troupe-id-1')
    fixture.componentRef.setInput('troupeName', 'Troupe Test')
    fixture.componentRef.setInput('troupeSlug', 'troupe-test')
    fixture.detectChanges()
    return fixture
  }

  it('renders context breadcrumb with troupe hub link', async () => {
    const fixture = await setup()
    const troupeLink = fixture.nativeElement.querySelector(
      'app-context-breadcrumb a.context-breadcrumb__troupe',
    ) as HTMLAnchorElement
    expect(troupeLink).toBeTruthy()
    expect(troupeLink.getAttribute('href')).toBe('/troupes/troupe-test')
    expect(fixture.nativeElement.querySelector('nav[aria-label="Fil d\'Ariane"]')).toBeTruthy()
  })

  it('does not render account menu trigger in page header', async () => {
    const fixture = await setup()
    expect(fixture.nativeElement.querySelector('app-user-avatar')).toBeNull()
    expect(fixture.nativeElement.querySelector('app-user-account-menu-items')).toBeNull()
  })

  it('hides breadcrumb when troupe context is missing', async () => {
    const fixture = await setup()
    fixture.componentRef.setInput('troupeSlug', null)
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('app-context-breadcrumb')).toBeNull()
  })
})
