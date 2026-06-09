import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'
import { MatDialog } from '@angular/material/dialog'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { provideRouter, Router } from '@angular/router'
import { Subject } from 'rxjs'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

import { EventApiService } from '../../core/events/event-api.service'
import { emptyRoleSlots } from '../../core/events/event-types'
import type { EventResponse } from '../../core/events/event-api.service'
import { CALENDAR_SNACKBAR_MESSAGES } from '../../core/events/event-calendar-export'
import { OrganizerApiService } from '../../core/permissions/organizer-api.service'
import { TroupeApiService } from '../../core/troupes/troupe-api.service'
import { CATEGORY_HELP, DEFAULT_CATEGORY_DISPLAY_LABEL } from './event-category-dialog'
import { FORMAT_AND_ROLES_HELP } from './event-type-roles-dialog'
import { ORGANIZERS_HELP } from './event-organizers-dialog'
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
  let dialogOpen: ReturnType<typeof vi.fn>
  let updateEvent: ReturnType<typeof vi.fn>
  let listCategories: ReturnType<typeof vi.fn>
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
    openCategoryDialog: () => void
  }

  function tab(): InfosTabTestApi {
    return fixture.componentInstance as unknown as InfosTabTestApi
  }

  beforeEach(async () => {
    snackBarMock.open.mockReset()
    windowOpenSpy = vi.spyOn(window, 'open').mockReturnValue({} as Window)
    dialogOpen = vi.fn()
    updateEvent = vi.fn()
    listCategories = vi.fn().mockResolvedValue({ ok: true, data: [] })

    await TestBed.configureTestingModule({
      imports: [EventInfosTab, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: MatDialog, useValue: { open: dialogOpen } },
        {
          provide: EventApiService,
          useValue: { updateEvent },
        },
        {
          provide: TroupeApiService,
          useValue: { listCategories },
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

    TestBed.overrideProvider(MatDialog, { useValue: { open: dialogOpen } })

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

  it('shows Spectacle ordinaire in disabled action row for read-only users', () => {
    fixture.detectChanges()

    const row = fixture.nativeElement.querySelector(
      '.event-infos__category .event-infos__action-row--disabled',
    )
    expect(row?.textContent?.trim()).toContain(DEFAULT_CATEGORY_DISPLAY_LABEL)
  })

  it('shows editable action row with chevron when organizer can manage events', () => {
    fixture.componentRef.setInput('canManageEvents', true)
    fixture.detectChanges()

    const row = fixture.nativeElement.querySelector(
      '.event-infos__category button.event-infos__action-row',
    ) as HTMLButtonElement | null
    expect(row?.textContent?.trim()).toContain(DEFAULT_CATEGORY_DISPLAY_LABEL)
    expect(row?.querySelector('.event-infos__chevron')).not.toBeNull()
    expect(row?.getAttribute('aria-label')).toBe('Changer la catégorie')
  })

  it('hides manage categories link when user is not troupe admin', () => {
    fixture.componentRef.setInput('canManageTroupe', false)
    fixture.detectChanges()

    expect(fixture.nativeElement.querySelector('.event-infos__add-organizer')).toBeNull()
  })

  it('shows custom category label on action row when event has category', async () => {
    listCategories.mockResolvedValue({
      ok: true,
      data: [{ slug: 'deplacements', label: 'Déplacements' }],
    })
    fixture.componentRef.setInput('canManageEvents', true)
    fixture.componentRef.setInput('event', ev({ category: 'deplacements' }))
    fixture.componentRef.setInput('troupeId', 'troupe-glossary-reload')
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(listCategories).toHaveBeenCalledWith('troupe-glossary-reload')
    })
    await vi.waitFor(() => {
      const row = fixture.nativeElement.querySelector(
        '.event-infos__category button.event-infos__action-row',
      )
      expect(row?.textContent?.trim()).toContain('Déplacements')
    })
  })

  it('shows manage categories link for troupe admin', () => {
    fixture.componentRef.setInput('canManageTroupe', true)
    fixture.detectChanges()

    const link = fixture.nativeElement.querySelector('.event-infos__add-organizer')
    expect(link?.textContent?.trim()).toContain('Gérer les catégories')
  })

  it('navigates to troupe settings when manage link clicked', () => {
    fixture.componentRef.setInput('canManageTroupe', true)
    fixture.detectChanges()

    const router = TestBed.inject(Router)
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true)

    const link = fixture.nativeElement.querySelector(
      '.event-infos__add-organizer',
    ) as HTMLButtonElement
    link.click()

    expect(navigateSpy).toHaveBeenCalledWith(['/', 'troupes', 'improbots', 'admin', 'parametres'], {
      queryParams: { tab: 'categories' },
    })
  })

  it('persists category from dialog and shows success snackbar', async () => {
    const afterClosed$ = new Subject<string | null | undefined>()
    dialogOpen.mockReturnValue({ afterClosed: () => afterClosed$.asObservable() })
    updateEvent.mockResolvedValue({
      ok: true,
      data: ev({ category: 'deplacements' }),
    })

    fixture.componentRef.setInput('canManageEvents', true)
    fixture.detectChanges()

    tab().openCategoryDialog()
    afterClosed$.next('deplacements')

    await vi.waitFor(() => {
      expect(updateEvent).toHaveBeenCalledWith('season-1', ev().id, { category: 'deplacements' })
      expect(snackOpen).toHaveBeenCalledWith('Catégorie enregistrée.', 'OK', { duration: 4000 })
    })
  })

  it('reopens category dialog when PATCH fails', async () => {
    const firstClose$ = new Subject<string | null | undefined>()
    const secondClose$ = new Subject<string | null | undefined>()
    dialogOpen
      .mockReturnValueOnce({ afterClosed: () => firstClose$.asObservable() })
      .mockReturnValueOnce({ afterClosed: () => secondClose$.asObservable() })
    updateEvent.mockResolvedValueOnce({ ok: false, errorMessage: 'Catégorie inconnue.' })

    fixture.componentRef.setInput('canManageEvents', true)
    fixture.detectChanges()

    tab().openCategoryDialog()
    firstClose$.next('aperock')

    await vi.waitFor(() => {
      expect(dialogOpen).toHaveBeenCalledTimes(2)
    })

    const secondDialogData = dialogOpen.mock.calls[1]?.[1]?.data as {
      initialCategorySlug: string | null
    }
    expect(secondDialogData.initialCategorySlug).toBe('aperock')
  })

  it('shows format and roles help on every Infos load', () => {
    fixture.detectChanges()

    const help = fixture.nativeElement.querySelector('#event-infos-format-help')
    expect(help?.textContent?.trim()).toBe(FORMAT_AND_ROLES_HELP)
  })

  it('shows organizers help when section is visible', () => {
    fixture.componentRef.setInput('canManageEventOrganizers', true)
    fixture.detectChanges()

    const help = fixture.nativeElement.querySelector('#event-infos-organizers-help')
    expect(help?.textContent?.trim()).toBe(ORGANIZERS_HELP)
  })
})
