import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

import { EventApiService } from '../../core/events/event-api.service'
import { emptyRoleSlots } from '../../core/events/event-types'
import type { EventResponse } from '../../core/events/event-api.service'
import { CALENDAR_SNACKBAR_MESSAGES } from '../../core/events/event-calendar-export'
import { OrganizerApiService } from '../../core/permissions/organizer-api.service'
import { TroupeApiService } from '../../core/troupes/troupe-api.service'
import { CATEGORY_HELP } from './event-category-dialog'
import { EventInfosTab } from './event-infos-tab'

function ev(overrides: Partial<EventResponse> = {}): EventResponse {
  return {
    id: '550e8400-e29b-41d4-a716-446655440000',
    seasonId: 'season-1',
    slug: 'spectacle-du-15',
    title: 'Spectacle',
    description: null,
    location: 'Théâtre ABC, Paris',
    startsAt: '2030-05-12T19:00:00.000Z',
    archived: false,
    templateType: 'cabaret',
    roleSlots: { ...emptyRoleSlots(), player: 2 },
    createdAt: '',
    updatedAt: '',
    availabilityOpenedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('EventInfosTab', () => {
  let fixture: ComponentFixture<EventInfosTab>
  let snackOpen: ReturnType<typeof vi.fn>
  let windowOpenSpy: ReturnType<typeof vi.spyOn>
  const snackBarMock = { open: vi.fn() }

  type InfosTabTestApi = {
    exportToGoogleCalendar: () => void
    exportToOutlook: () => void
    exportToAppleCalendar: () => void
    openGoogleMaps: () => void
    openWaze: () => void
    onCalendarMenuOpened: () => void
    onCalendarMenuClosed: () => void
    onMapsMenuOpened: () => void
    onMapsMenuClosed: () => void
  }

  function tab(): InfosTabTestApi {
    return fixture.componentInstance as unknown as InfosTabTestApi
  }

  beforeEach(async () => {
    snackBarMock.open.mockReset()
    windowOpenSpy = vi.spyOn(window, 'open').mockReturnValue({} as Window)

    await TestBed.configureTestingModule({
      imports: [EventInfosTab, NoopAnimationsModule],
      providers: [
        {
          provide: EventApiService,
          useValue: { updateEvent: vi.fn() },
        },
        {
          provide: TroupeApiService,
          useValue: { listCategories: vi.fn().mockResolvedValue({ ok: true, data: [] }) },
        },
        {
          provide: OrganizerApiService,
          useValue: {
            listEventOrganizers: vi.fn().mockResolvedValue({ ok: true, data: [] }),
          },
        },
      ],
    })
      .overrideComponent(EventInfosTab, {
        remove: { imports: [MatSnackBarModule] },
        add: {
          providers: [{ provide: MatSnackBar, useValue: snackBarMock }],
        },
      })
      .compileComponents()

    fixture = TestBed.createComponent(EventInfosTab)
    snackOpen = snackBarMock.open
    fixture.componentRef.setInput('event', ev())
    fixture.componentRef.setInput('seasonId', 'season-1')
    fixture.componentRef.setInput('troupeId', 'troupe-1')
    fixture.componentRef.setInput('troupeSlug', 'improbots')
    fixture.componentRef.setInput('seasonSlug', '2025-2026')
    fixture.detectChanges()
  })

  afterEach(() => {
    windowOpenSpy.mockRestore()
  })

  function dateButton(): HTMLButtonElement | null {
    return fixture.nativeElement.querySelector(
      'button[aria-label="Ajouter à votre agenda"]',
    )
  }

  function locationButton(): HTMLButtonElement | null {
    return fixture.nativeElement.querySelector(
      'button[aria-label="Ouvrir le lieu dans une appli de navigation"]',
    )
  }

  it('hides description block when empty', () => {
    expect(fixture.nativeElement.querySelector('.event-infos__field--description')).toBeNull()
    expect(fixture.nativeElement.textContent).not.toContain('Non renseignée')
  })

  it('renders description text without label when provided', () => {
    fixture.componentRef.setInput('event', ev({ description: '  Soirée spéciale  ' }))
    fixture.detectChanges()

    const block = fixture.nativeElement.querySelector('.event-infos__field--description')
    expect(block?.textContent?.trim()).toBe('Soirée spéciale')
    expect(block?.querySelector('.event-infos__label')).toBeNull()
  })

  it('renders interactive date row with chevron when export enabled', () => {
    expect(dateButton()).not.toBeNull()
    expect(dateButton()?.querySelector('.event-infos__chevron')).not.toBeNull()
  })

  it('disables date row without chevron when slug is empty', () => {
    fixture.componentRef.setInput('event', ev({ slug: '' }))
    fixture.detectChanges()

    expect(dateButton()).toBeNull()
    const disabledRow = fixture.nativeElement.querySelector('.event-infos__action-row--disabled')
    expect(disabledRow).not.toBeNull()
    expect(disabledRow.querySelector('.event-infos__chevron')).toBeNull()
  })

  it('disables date row when startsAt is invalid', () => {
    fixture.componentRef.setInput('event', ev({ startsAt: 'not-a-date' }))
    fixture.detectChanges()

    expect(dateButton()).toBeNull()
  })

  it('renders static empty location without chevron', () => {
    fixture.componentRef.setInput('event', ev({ location: null }))
    fixture.detectChanges()

    expect(locationButton()).toBeNull()
    expect(fixture.nativeElement.textContent).toContain('Non renseigné')
    const locationField = fixture.nativeElement.querySelectorAll('.event-infos__field')[1]
    expect(locationField.querySelector('.event-infos__chevron')).toBeNull()
  })

  it('sets full location on title attribute', () => {
    const longLocation = 'Salle des fêtes — 12 rue de la République, 75001 Paris'
    fixture.componentRef.setInput('event', ev({ location: longLocation }))
    fixture.detectChanges()

    expect(locationButton()?.getAttribute('title')).toBe(longLocation)
  })

  it('keeps calendar menu active for draft events', () => {
    fixture.componentRef.setInput('event', ev({ availabilityOpenedAt: null }))
    fixture.detectChanges()

    expect(dateButton()).not.toBeNull()
    expect(dateButton()?.disabled).not.toBe(true)
  })

  it('opens Google Calendar and shows success snackbar', () => {
    tab().exportToGoogleCalendar()

    expect(windowOpenSpy).toHaveBeenCalledOnce()
    const url = windowOpenSpy.mock.calls[0][0] as string
    expect(url).toContain('calendar.google.com')
    expect(url).toContain('https://')
    expect(snackOpen).toHaveBeenCalledWith(
      CALENDAR_SNACKBAR_MESSAGES.google,
      'OK',
      expect.objectContaining({ duration: expect.any(Number) }),
    )
  })

  it('opens Outlook and shows success snackbar', () => {
    tab().exportToOutlook()

    expect(windowOpenSpy).toHaveBeenCalledOnce()
    expect((windowOpenSpy.mock.calls[0][0] as string).includes('outlook.live.com')).toBe(true)
    expect(snackOpen).toHaveBeenCalledWith(
      CALENDAR_SNACKBAR_MESSAGES.outlook,
      'OK',
      expect.any(Object),
    )
  })

  it('downloads ICS and shows success snackbar', () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    tab().exportToAppleCalendar()

    expect(clickSpy).toHaveBeenCalled()
    expect(snackOpen).toHaveBeenCalledWith(
      CALENDAR_SNACKBAR_MESSAGES.icsDownload,
      'OK',
      expect.objectContaining({ politeness: 'assertive' }),
    )
    clickSpy.mockRestore()
  })

  it('shows popup blocked snackbar when window.open returns null (calendar)', () => {
    windowOpenSpy.mockReturnValue(null)

    tab().exportToGoogleCalendar()

    expect(snackOpen).toHaveBeenCalledWith(
      CALENDAR_SNACKBAR_MESSAGES.popupBlocked,
      'OK',
      expect.any(Object),
    )
  })

  it('shows popup blocked snackbar when window.open returns null (maps)', () => {
    windowOpenSpy.mockReturnValue(null)

    tab().openGoogleMaps()

    expect(snackOpen).toHaveBeenCalledWith(
      CALENDAR_SNACKBAR_MESSAGES.popupBlocked,
      'OK',
      expect.any(Object),
    )
  })

  it('opens Google Maps with HTTPS URL', () => {
    tab().openGoogleMaps()

    expect(windowOpenSpy).toHaveBeenCalledOnce()
    const url = windowOpenSpy.mock.calls[0][0] as string
    expect(url.startsWith('https://www.google.com/maps/')).toBe(true)
  })

  it('opens Waze with HTTPS URL', () => {
    tab().openWaze()

    expect(windowOpenSpy).toHaveBeenCalledOnce()
    expect((windowOpenSpy.mock.calls[0][0] as string).startsWith('https://waze.com/')).toBe(true)
  })

  it('combines success and past event snackbar on calendar export', () => {
    fixture.componentRef.setInput(
      'event',
      ev({ startsAt: '2020-01-01T19:00:00.000Z' }),
    )
    fixture.detectChanges()

    tab().exportToGoogleCalendar()

    expect(snackOpen).toHaveBeenCalledOnce()
    expect(snackOpen).toHaveBeenCalledWith(
      `${CALENDAR_SNACKBAR_MESSAGES.google} ${CALENDAR_SNACKBAR_MESSAGES.pastEvent}`,
      'OK',
      expect.any(Object),
    )
  })

  it('shows calendar error snackbar when export throws', () => {
    const instance = fixture.componentInstance as unknown as {
      openExternalUrl: (url: string) => Window | null
    }
    vi.spyOn(instance, 'openExternalUrl').mockImplementation(() => {
      throw new Error('export failed')
    })

    tab().exportToGoogleCalendar()

    expect(snackOpen).toHaveBeenCalledWith(
      CALENDAR_SNACKBAR_MESSAGES.error,
      'OK',
      expect.objectContaining({ duration: expect.any(Number) }),
    )
  })

  it('rotates chevron when calendar menu opens', () => {
    tab().onCalendarMenuOpened()
    fixture.detectChanges()

    const chevron = fixture.nativeElement.querySelector('.event-infos__chevron--open')
    expect(chevron).not.toBeNull()
    expect(dateButton()?.getAttribute('aria-expanded')).toBe('true')

    tab().onCalendarMenuClosed()
    fixture.detectChanges()

    expect(dateButton()?.getAttribute('aria-expanded')).toBe('false')
  })

  it('rotates chevron when maps menu opens', () => {
    tab().onMapsMenuOpened()
    fixture.detectChanges()

    const locationChevron = locationButton()?.querySelector('.event-infos__chevron--open')
    expect(locationChevron).not.toBeNull()
    expect(locationButton()?.getAttribute('aria-expanded')).toBe('true')

    tab().onMapsMenuClosed()
    fixture.detectChanges()

    expect(locationButton()?.getAttribute('aria-expanded')).toBe('false')
  })

  it('shows category help when organizer can manage events', () => {
    fixture.componentRef.setInput('canManageEvents', true)
    fixture.detectChanges()

    const help = fixture.nativeElement.querySelector('#event-infos-category-help')
    expect(help?.textContent?.trim()).toBe(CATEGORY_HELP)
  })
})
