import { of } from 'rxjs'
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
import { DEFAULT_CATEGORY_DISPLAY_LABEL } from './event-category.constants'
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
  let openAvailabilityResilient: ReturnType<typeof vi.fn>
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
    openAvailabilityResilient = vi.fn()
    listCategories = vi.fn().mockResolvedValue({ ok: true, data: [] })

    await TestBed.configureTestingModule({
      imports: [EventInfosTab, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        {
          provide: EventApiService,
          useValue: { updateEvent, openAvailabilityResilient },
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

  it('lets a member open the status explanation without exposing edit', () => {
    fixture.componentRef.setInput('detailedStatus', { type: 'pending_confirmation', label: 'Confirmations en cours', tone: 'info', managerGuideline: null })
    fixture.detectChanges()
    const banner = document.querySelector('.event-infos__banner') as HTMLElement
    const trigger = banner.querySelector('[data-testid="composition-status-help-trigger"]') as HTMLButtonElement
    expect(trigger.textContent).toContain('Confirmations en cours')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(banner.querySelector('[aria-label="Modifier le spectacle"]')).toBeNull()
    trigger.click()
    fixture.detectChanges()
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(banner.textContent).toContain('Certaines participations attendent une confirmation.')
    expect(banner.querySelector('mat-icon')?.textContent).not.toContain('help_outline')
  })

  it('shows edit inside the banner only when permitted and emits the action', () => {
    fixture.componentRef.setInput('canEdit', true)
    fixture.detectChanges()
    const edit = vi.fn()
    fixture.componentInstance.edit.subscribe(edit)
    const button = document.querySelector('.event-infos__banner [aria-label="Modifier le spectacle"]') as HTMLButtonElement
    expect(button).not.toBeNull()
    button.click()
    expect(edit).toHaveBeenCalledOnce()
  })

  it.each(['2030-01-14T23:00:00Z', '2030-07-14T22:00:00Z'])('omits unspecified midnight from the date and accessible label in Paris for %s', (startsAt) => {
    fixture.componentRef.setInput('event', ev({ startsAt }))
    fixture.detectChanges()
    expect(document.querySelector('.event-infos__time')).toBeNull()
    expect(document.querySelector('.event-infos__date time')?.getAttribute('aria-label')).not.toContain('00:00')
  })

  it('keeps a specified show time visible', () => {
    fixture.componentRef.setInput('event', ev({ startsAt: '2030-01-15T19:30:00Z' }))
    fixture.detectChanges()
    expect(document.querySelector('.event-infos__time')?.textContent?.trim()).toBe('20:30')
  })

  it('shows the draft explanation and publication actions only to authorized organizers', () => {
    fixture.componentRef.setInput('event', ev({ availabilityOpenedAt: null }))
    fixture.componentRef.setInput('canManageComposition', true)
    fixture.detectChanges()
    const banner = document.querySelector('.event-infos__banner') as HTMLElement
    expect(banner.classList.contains('event-infos__banner--draft')).toBe(true)
    expect(banner.querySelector('[aria-label="Comprendre le statut : Brouillon"]')).not.toBeNull()
    ;(banner.querySelector('[data-testid="composition-status-help-trigger"]') as HTMLButtonElement).click()
    fixture.detectChanges()
    expect(banner.textContent).toContain('Ce spectacle n’est pas visible dans l’agenda des membres. Publie-le pour rouvrir la collecte des disponibilités.')
    expect(banner.textContent).toContain('Publier le spectacle')
    expect([...banner.querySelectorAll('button')].some((button) => button.textContent?.trim() === 'Publier')).toBe(true)
  })

  it('shows the member draft explanation without publishing actions', () => {
    fixture.componentRef.setInput('event', ev({ availabilityOpenedAt: null }))
    fixture.componentRef.setInput('canManageComposition', false)
    fixture.detectChanges()
    const banner = document.querySelector('.event-infos__banner') as HTMLElement
    ;(banner.querySelector('[data-testid="composition-status-help-trigger"]') as HTMLButtonElement).click()
    fixture.detectChanges()
    expect(banner.textContent).toContain('Ce spectacle est en brouillon : il n’apparaît plus dans l’agenda et tu ne peux pas modifier tes disponibilités pour le moment.')
    expect(banner.querySelector('.event-infos__publish')).toBeNull()
    expect([...banner.querySelectorAll('button')].some((button) => button.textContent?.trim() === 'Publier')).toBe(false)
  })

  it('does not display draft presentation or publication for a published show', () => {
    const banner = document.querySelector('.event-infos__banner') as HTMLElement
    expect(banner.classList.contains('event-infos__banner--draft')).toBe(false)
    expect(banner.querySelector('.event-infos__publish')).toBeNull()
  })

  it.each(['cta', 'help'])('asks for confirmation from %s and cancels without publishing', (source) => {
    fixture.componentRef.setInput('event', ev({ availabilityOpenedAt: null }))
    fixture.componentRef.setInput('canManageComposition', true)
    fixture.detectChanges()
    const dialogOpen = vi.spyOn((fixture.componentInstance as unknown as { dialog: MatDialog }).dialog, 'open').mockReturnValue({ afterClosed: () => of(false) } as never)
    if (source === 'help') { (document.querySelector('[data-testid="composition-status-help-trigger"]') as HTMLButtonElement).click(); fixture.detectChanges() }
    const button = source === 'cta' ? document.querySelector('.event-infos__publish') : [...document.querySelectorAll('.event-infos__status-help button')].find((el) => el.textContent?.trim() === 'Publier')
    ;(button as HTMLButtonElement).click()
    expect(dialogOpen).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ data: expect.objectContaining({ title: 'Publier le spectacle', confirmLabel: 'Publier' }) }))
    expect(openAvailabilityResilient).not.toHaveBeenCalled()
  })

  it('reports a publication failure and retains the draft', async () => {
    fixture.componentRef.setInput('event', ev({ availabilityOpenedAt: null }))
    fixture.componentRef.setInput('canManageComposition', true)
    fixture.detectChanges()
    vi.spyOn((fixture.componentInstance as unknown as { dialog: MatDialog }).dialog, 'open').mockReturnValue({ afterClosed: () => of(true) } as never)
    openAvailabilityResilient.mockResolvedValue({ ok: false, errorMessage: 'Erreur de publication' })
    const updated = vi.fn(); fixture.componentInstance.eventUpdated.subscribe(updated)
    ;(document.querySelector('.event-infos__publish') as HTMLButtonElement).click()
    await vi.waitFor(() => expect(snackOpen).toHaveBeenCalledWith('Erreur de publication', 'OK', { duration: 6000 }))
    expect(updated).not.toHaveBeenCalled()
    expect(document.querySelector('.event-infos__banner--draft')).not.toBeNull()
  })

  it('publishes after confirmation and reports the updated event', async () => {
    fixture.componentRef.setInput('event', ev({ availabilityOpenedAt: null }))
    fixture.componentRef.setInput('canManageComposition', true)
    fixture.detectChanges()
    const dialogOpen = vi.spyOn((fixture.componentInstance as unknown as { dialog: MatDialog }).dialog, 'open').mockReturnValue({ afterClosed: () => of(true) } as never)
    const published = ev()
    openAvailabilityResilient.mockResolvedValue({ ok: true, data: published })
    const updated = vi.fn(); fixture.componentInstance.eventUpdated.subscribe(updated)
    ;(document.querySelector('.event-infos__publish') as HTMLButtonElement).click()
    await vi.waitFor(() => expect(updated).toHaveBeenCalledWith(published))
    expect(openAvailabilityResilient).toHaveBeenCalledWith('season-1', published.id)
    expect(snackOpen).toHaveBeenCalledWith('Spectacle publié.', 'OK', { duration: 4000 })
    expect(dialogOpen).toHaveBeenCalledTimes(2)
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

  it('omits the location when it is not provided', () => {
    fixture.componentRef.setInput('event', ev({ location: null }))
    fixture.detectChanges()

    expect(locationButton()).toBeNull()
    expect(fixture.nativeElement.textContent).not.toContain('Lieu non renseigné')
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

  it('exposes the maps menu expanded state', () => {
    tab().onMapsMenuOpened()
    fixture.detectChanges()

    expect(locationButton()?.getAttribute('aria-expanded')).toBe('true')

    tab().onMapsMenuClosed()
    fixture.detectChanges()

    expect(locationButton()?.getAttribute('aria-expanded')).toBe('false')
  })

  it('expands and collapses category and description without format or needs', async () => {
    fixture.componentRef.setInput('event', ev({ description: 'Description utile' }))
    fixture.componentRef.setInput('bootstrapCategories', [{ slug: 'principal', label: 'Nos spectacles' }])
    fixture.detectChanges()
    await fixture.whenStable()
    fixture.detectChanges()
    const section = document.querySelector('.event-infos__expanded')!
    expect(section.textContent).toContain('Description utile')
    expect(section.textContent).toContain('Nos spectacles')
    expect(section.textContent).not.toContain('Cabaret')
    expect(section.querySelector('app-role-display-chip-set')).toBeNull()
    const toggle = document.querySelector('.event-infos__details-action') as HTMLButtonElement
    expect(toggle.getAttribute('aria-expanded')).toBe('true')
    expect(toggle.textContent).toContain('Voir moins')
    toggle.click()
    fixture.detectChanges()
    expect(document.querySelector('.event-infos__expanded')).toBeNull()
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    expect(toggle.textContent).toContain('Voir plus')
  })

  it('shows non-default category and organizers without management controls, even for a manager', async () => {
    fixture.componentRef.setInput('canManageTroupe', true)
    fixture.componentRef.setInput('canManageEventOrganizers', true)
    fixture.componentRef.setInput('event', ev({ category: 'deplacements' }))
    fixture.componentRef.setInput('bootstrapCategories', [{ slug: 'deplacements', label: 'Déplacements' }])
    fixture.componentRef.setInput('bootstrapOrganizers', [{ userId: 'organizer-1', displayName: 'Camille', email: 'camille@example.test', grantedAt: '' }])
    fixture.detectChanges()
    await fixture.whenStable()
    fixture.detectChanges()
    expect(document.querySelector('.event-infos__banner')?.textContent).not.toContain('Déplacements')
    const section = document.querySelector('.event-infos__expanded')!
    expect(section.textContent).toContain('Camille')
    expect(section.textContent).toContain('Déplacements')
    expect(section.querySelector('button')).toBeNull()
    expect(section.querySelector('[matChipRemove]')).toBeNull()
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
    expect(saison.closest('.event-infos__expanded')).not.toBeNull()
  })

  it('hides Saison section when troupe or season name is empty', () => {
    fixture.componentRef.setInput('troupeName', 'Les Improbots')
    fixture.componentRef.setInput('seasonTitle', '   ')
    fixture.detectChanges()

    expect(document.querySelector('.event-infos__saison')).toBeNull()
  })
})
