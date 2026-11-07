import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'
import { MatDialog } from '@angular/material/dialog'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { provideRouter, Router } from '@angular/router'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

import { EventApiService } from '../../core/events/event-api.service'
import { emptyRoleSlots } from '../../core/events/event-types'
import type { EventResponse } from '../../core/events/event-api.service'
import { CALENDAR_SNACKBAR_MESSAGES } from '../../core/events/event-calendar-export'
import { OrganizerApiService } from '../../core/permissions/organizer-api.service'
import { TroupeApiService } from '../../core/troupes/troupe-api.service'
import { CATEGORY_HELP, DEFAULT_CATEGORY_DISPLAY_LABEL } from './event-category.constants'
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
    onCategorySelect: (slug: string | null) => void
  }

  function tab(): InfosTabTestApi {
    return fixture.componentInstance as unknown as InfosTabTestApi
  }

  beforeEach(async () => {
    snackBarMock.open.mockReset()
    windowOpenSpy = vi.spyOn(window, 'open').mockReturnValue({} as Window)
    updateEvent = vi.fn()
    listCategories = vi.fn().mockResolvedValue({ ok: true, data: [] })

    await TestBed.configureTestingModule({
      imports: [EventInfosTab, NoopAnimationsModule],
      providers: [
        provideRouter([]),
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


    fixture = TestBed.createComponent(EventInfosTab)
    snackOpen = snackBarMock.open
    fixture.componentRef.setInput('event', ev())
    fixture.componentRef.setInput('seasonId', 'season-1')
    fixture.componentRef.setInput('troupeId', 'troupe-1')
    fixture.componentRef.setInput('troupeSlug', 'improbots')
    fixture.componentRef.setInput('seasonSlug', '2025-2026')
    fixture.detectChanges()
    const details = document.querySelector('.event-infos__details-action') as HTMLButtonElement
    details.click()
    fixture.detectChanges()
  })

  afterEach(() => {
    TestBed.inject(MatDialog).closeAll()
    windowOpenSpy.mockRestore()
  })

  function dateButton(): HTMLButtonElement | null {
    return document.querySelector(
      'button[aria-label^="Ajouter à votre agenda"]',
    )
  }

  function locationButton(): HTMLButtonElement | null {
    return document.querySelector(
      'button[aria-label="Ouvrir le lieu dans une appli de navigation"]',
    )
  }

  it.each([
    { type: 'pending_confirmation', label: 'Confirmations en cours', guideline: 'Recueille les confirmations.' },
    { type: 'slots_to_complete', label: 'À compléter', guideline: 'Complète les emplacements.' },
  ])('shows detailed organizer status and help in the banner: $label', ({ type, label, guideline }) => {
    fixture.componentRef.setInput('detailedStatus', { type, label, tone: 'info', managerGuideline: guideline })
    fixture.detectChanges()
    const banner = document.querySelector('.event-infos__banner') as HTMLElement
    expect(banner.textContent).toContain(label)
    const trigger = banner.querySelector('[data-testid="composition-status-help-trigger"]') as HTMLButtonElement
    expect(trigger).not.toBeNull()
    trigger.click()
    fixture.detectChanges()
    expect(banner.querySelector('[data-testid="composition-status-hint"]')?.textContent).toContain(guideline)
    expect(banner.querySelector('app-composition-status-badge')).toBeNull()
  })

  it('hides description block when empty', () => {
    expect(document.querySelector('.event-infos__field--description')).toBeNull()
    expect(fixture.nativeElement.textContent).not.toContain('Non renseignée')
  })

  it('renders description text without label when provided', () => {
    fixture.componentRef.setInput('event', ev({ description: '  Soirée spéciale  ' }))
    fixture.detectChanges()

    const block = document.querySelector('.event-infos__field--description')
    expect(block?.textContent?.trim()).toBe('Soirée spéciale')
    expect(block?.querySelector('.event-infos__label')).toBeNull()
  })

  it('renders interactive date and calendar action when export enabled', () => {
    expect(dateButton()).not.toBeNull()
    expect(dateButton()?.getAttribute('aria-label')).toContain('Ajouter à votre agenda')
  })

  it('shows the month and year alongside the day and time', () => {
    expect(document.querySelector('.event-infos__day')?.textContent?.trim()).toBe('12')
    expect(document.querySelector('.event-infos__month-year')?.textContent).toContain('mai')
    expect(document.querySelector('.event-infos__month-year')?.textContent).toContain('2030')
    expect(document.querySelector('.event-infos__time')?.textContent?.trim()).toBeTruthy()
  })

  it('disables date row without chevron when slug is empty', () => {
    fixture.componentRef.setInput('event', ev({ slug: '' }))
    fixture.detectChanges()

    expect(dateButton()).toBeNull()
    expect(document.querySelector('.event-infos__date time')).not.toBeNull()
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
    expect(fixture.nativeElement.textContent).toContain('Lieu non renseigné')
    const locationField = document.querySelector('.event-infos__location-empty')!
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

  it('exposes calendar menu expanded state', () => {
    tab().onCalendarMenuOpened()
    fixture.detectChanges()

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

    const help = document.querySelector('#event-infos-category-help')
    expect(help?.textContent?.trim()).toBe(CATEGORY_HELP)
  })

  it('uses the troupe glossary label for the default category', async () => {
    fixture.componentRef.setInput('bootstrapCategories', [{ slug: 'principal', label: 'Nos spectacles' }])
    fixture.detectChanges()
    await fixture.whenStable()
    fixture.detectChanges()
    expect(document.querySelector('.event-infos__category')?.textContent).toContain('Nos spectacles')
  })

  it('shows the default category as read-only information', () => {
    const section = document.querySelector('.event-infos__category')!
    expect(section.textContent).toContain(DEFAULT_CATEGORY_DISPLAY_LABEL)
    expect(section.querySelector('app-event-category-select-chip-set')).toBeNull()
    expect(document.querySelector('.event-infos__banner-meta')?.textContent).not.toContain(DEFAULT_CATEGORY_DISPLAY_LABEL)
  })

  it('keeps category information read-only for an organizer', () => {
    fixture.componentRef.setInput('canManageEvents', true)
    fixture.detectChanges()
    expect(document.querySelector('.event-infos__category')?.textContent).toContain(DEFAULT_CATEGORY_DISPLAY_LABEL)
    expect(document.querySelector('app-event-category-select-chip-set')).toBeNull()
  })

  it('shows the custom category label in the header', async () => {
    listCategories.mockResolvedValue({ ok: true, data: [{ slug: 'deplacements', label: 'Déplacements' }] })
    fixture.componentRef.setInput('event', ev({ category: 'deplacements' }))
    fixture.componentRef.setInput('troupeId', 'troupe-glossary-reload')
    fixture.detectChanges()
    await vi.waitFor(() => expect(listCategories).toHaveBeenCalledWith('troupe-glossary-reload'))
    fixture.detectChanges()
    expect(document.querySelector('.event-infos__category-summary')?.textContent).toContain('Déplacements')
    expect(document.querySelector('.event-infos__category')?.textContent).toContain('Déplacements')
  })

  function categoryManageLink(): HTMLButtonElement | null {
    const section = document.querySelector('.event-infos__category')
    if (!section) {
      return null
    }
    return (
      [...section.querySelectorAll<HTMLButtonElement>('button.event-infos__add-organizer')].find((button) =>
        button.textContent?.includes('Gérer les catégories'),
      ) ?? null
    )
  }

  it('hides manage categories link when user is not troupe admin', () => {
    fixture.componentRef.setInput('canManageTroupe', false)
    fixture.componentRef.setInput('canManageEventOrganizers', true)
    fixture.detectChanges()

    expect(categoryManageLink()).toBeNull()
  })

  it('persists category from chip tap and shows success snackbar', async () => {
    updateEvent.mockResolvedValue({
      ok: true,
      data: ev({ category: 'deplacements' }),
    })

    fixture.componentRef.setInput('canManageEvents', true)
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(listCategories).toHaveBeenCalled()
    })

    tab().onCategorySelect('deplacements')

    await vi.waitFor(() => {
      expect(updateEvent).toHaveBeenCalledWith('season-1', ev().id, { category: 'deplacements' })
      expect(snackOpen).toHaveBeenCalledWith('Catégorie enregistrée.', 'OK', { duration: 4000 })
    })
  })

  it('shows Spectacles ordinaires snackbar when clearing category', async () => {
    updateEvent.mockResolvedValue({
      ok: true,
      data: ev({ category: null }),
    })

    fixture.componentRef.setInput('canManageEvents', true)
    fixture.componentRef.setInput('event', ev({ category: 'deplacements' }))
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(listCategories).toHaveBeenCalled()
    })

    tab().onCategorySelect(null)

    await vi.waitFor(() => {
      expect(updateEvent).toHaveBeenCalledWith('season-1', ev().id, { category: null })
      expect(snackOpen).toHaveBeenCalledWith('Spectacles ordinaires.', 'OK', { duration: 4000 })
    })
  })

  it('shows manage categories link for troupe admin', () => {
    fixture.componentRef.setInput('canManageTroupe', true)
    fixture.detectChanges()

    expect(categoryManageLink()?.textContent?.trim()).toContain('Gérer les catégories')
  })

  it('navigates to troupe settings when manage link clicked', () => {
    fixture.componentRef.setInput('canManageTroupe', true)
    fixture.detectChanges()

    const router = TestBed.inject(Router)
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true)

    categoryManageLink()?.click()

    expect(navigateSpy).toHaveBeenCalledWith(['/', 'troupes', 'improbots', 'admin', 'parametres'], {
      queryParams: { tab: 'categories' },
    })
  })

  it('shows snackbar when glossary load fails', async () => {
    listCategories.mockResolvedValue({ ok: false, status: 500 })
    fixture.componentRef.setInput('troupeId', 'troupe-glossary-fail')
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(snackOpen).toHaveBeenCalledWith('Impossible de charger les catégories.', 'OK', {
        duration: 6000,
      })
    })
  })

  it('shows snackbar when category PATCH fails', async () => {
    updateEvent.mockResolvedValue({ ok: false, errorMessage: 'Catégorie inconnue.' })

    fixture.componentRef.setInput('canManageEvents', true)
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(listCategories).toHaveBeenCalled()
    })

    tab().onCategorySelect('aperock')

    await vi.waitFor(() => {
      expect(snackOpen).toHaveBeenCalledWith('Catégorie inconnue.', 'OK', { duration: 6000 })
    })
  })

  it('keeps the format and needs summary read-only for an event manager', () => {
    fixture.componentRef.setInput('canManageEvents', true)
    fixture.detectChanges()

    expect(document.querySelector('.event-infos__format-edit')).toBeNull()
    expect(document.querySelector('app-role-display-chip-set')).not.toBeNull()
  })

  it('shows organizers help when section is visible', () => {
    fixture.componentRef.setInput('canManageEventOrganizers', true)
    fixture.detectChanges()

    const help = document.querySelector('#event-infos-organizers-help')
    expect(help?.textContent?.trim()).toBe(ORGANIZERS_HELP)
  })

  it('renders Saison section last when troupe and season names are provided', () => {
    fixture.componentRef.setInput('troupeName', 'Les Improbots')
    fixture.componentRef.setInput('seasonTitle', 'Saison 2025-26')
    fixture.detectChanges()

    const saison = document.querySelector('.event-infos__saison') as HTMLElement
    expect(saison).not.toBeNull()
    expect(saison.querySelector('#event-infos-saison-label')?.textContent?.trim()).toBe('Saison')
    expect(saison.querySelector('a[href="/saison/improbots/2025-2026"]')?.textContent?.trim()).toBe(
      'Saison 2025-26',
    )
    expect(saison.querySelector('a[href="/troupes/improbots"]')?.textContent?.trim()).toBe(
      'Les Improbots',
    )
    expect(saison.closest('[role="dialog"]')).not.toBeNull()
  })

  it('hides Saison section when troupe or season name is empty', () => {
    fixture.componentRef.setInput('troupeName', 'Les Improbots')
    fixture.componentRef.setInput('seasonTitle', '   ')
    fixture.detectChanges()

    expect(document.querySelector('.event-infos__saison')).toBeNull()
  })
})
