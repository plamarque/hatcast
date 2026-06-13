import { Location } from '@angular/common'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideRouter, Router } from '@angular/router'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'

import {
  rememberLastMemberEntryPath,
} from '../../core/navigation/last-member-entry-path-storage'
import { EventDetailHeader } from './event-detail-header'

describe('EventDetailHeader', () => {
  let fixture: ComponentFixture<EventDetailHeader>
  let location: Location
  let router: Router
  let backSpy: ReturnType<typeof vi.spyOn>
  let getStateSpy: ReturnType<typeof vi.spyOn>
  let navigateByUrlSpy: ReturnType<typeof vi.spyOn>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventDetailHeader, NoopAnimationsModule],
      providers: [provideRouter([])],
    }).compileComponents()

    fixture = TestBed.createComponent(EventDetailHeader)
    location = TestBed.inject(Location)
    router = TestBed.inject(Router)
    backSpy = vi.spyOn(location, 'back').mockImplementation(() => {})
    getStateSpy = vi.spyOn(location, 'getState')
    navigateByUrlSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true)
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  function backButton(): HTMLButtonElement | null {
    return fixture.nativeElement.querySelector('.event-detail-header__back')
  }

  it('renders back chevron when showBack is true', () => {
    fixture.componentRef.setInput('showBack', true)
    fixture.detectChanges()

    expect(fixture.nativeElement.querySelector('app-context-breadcrumb')).toBeNull()
    expect(backButton()).not.toBeNull()
    expect(backButton()?.getAttribute('aria-label')).toBe('Retour')
    expect(backButton()?.querySelector('mat-icon')?.textContent?.trim()).toBe('arrow_back')
  })

  it('hides back chevron when showBack is false', () => {
    fixture.componentRef.setInput('showBack', false)
    fixture.detectChanges()

    expect(backButton()).toBeNull()
  })

  it('calls Location.back when in-app navigation history exists', () => {
    getStateSpy.mockReturnValue({ navigationId: 2 })
    fixture.componentRef.setInput('showBack', true)
    fixture.detectChanges()

    backButton()?.click()

    expect(backSpy).toHaveBeenCalledOnce()
    expect(navigateByUrlSpy).not.toHaveBeenCalled()
  })

  it('navigates to /agenda when no in-app history and no stored entry path', () => {
    getStateSpy.mockReturnValue({ navigationId: 1 })
    fixture.componentRef.setInput('showBack', true)
    fixture.detectChanges()

    backButton()?.click()

    expect(backSpy).not.toHaveBeenCalled()
    expect(navigateByUrlSpy).toHaveBeenCalledWith('/agenda')
  })

  it('navigates to last member entry path when no in-app history', () => {
    rememberLastMemberEntryPath('/accueil')
    getStateSpy.mockReturnValue({})
    fixture.componentRef.setInput('showBack', true)
    fixture.detectChanges()

    backButton()?.click()

    expect(navigateByUrlSpy).toHaveBeenCalledWith('/accueil')
  })

  it('renders admin menu when items are provided', () => {
    fixture.componentRef.setInput('adminItems', [{ label: 'Participants', action: () => {} }])
    fixture.detectChanges()

    expect(
      fixture.nativeElement.querySelector('.event-detail-header__admin .scope-admin-menu__trigger'),
    ).not.toBeNull()
  })
})
