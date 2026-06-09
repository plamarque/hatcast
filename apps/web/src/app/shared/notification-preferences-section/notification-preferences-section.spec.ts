import { signal } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { MatSlideToggleChange } from '@angular/material/slide-toggle'
import { MatSnackBar } from '@angular/material/snack-bar'
import { describe, expect, it, vi } from 'vitest'

import { MeNotificationPreferencesApiService } from '../../core/notifications/me-notification-preferences-api.service'
import { PushNotificationsService, type PushUiState } from '../../core/push/push-notifications.service'
import { NotificationPreferencesSection } from './notification-preferences-section'

const categories = [
  {
    key: 'AVAILABILITY_REQUEST',
    label: "M'envoyer une notification lorsqu'un spectacle a besoin de personnes",
    group: 'NOTIFICATIONS',
    pushEnabled: true,
    emailEnabled: true,
  },
  {
    key: 'CONFIRMATION_REQUEST',
    label: 'M’envoyer une notification pour confirmer ma participation',
    group: 'NOTIFICATIONS',
    pushEnabled: true,
    emailEnabled: true,
  },
  {
    key: 'TEAM_CONFIRMED',
    label: 'Équipe confirmée pour un spectacle',
    group: 'NOTIFICATIONS',
    pushEnabled: true,
    emailEnabled: true,
  },
  {
    key: 'EVENT_DETAILS_CHANGED',
    label: 'Me prévenir quand la date, le lieu ou le format change sur un spectacle où j’ai déjà interagi (dispo ou participation)',
    group: 'NOTIFICATIONS',
    pushEnabled: true,
    emailEnabled: true,
  },
  {
    key: 'EVENT_ARCHIVED',
    label: 'Me prévenir quand un spectacle où j’ai déjà interagi (dispo ou participation) est annulé ou archivé',
    group: 'NOTIFICATIONS',
    pushEnabled: true,
    emailEnabled: true,
  },
  {
    key: 'COMPOSITION_SHARED',
    label: 'Composition partagée avec l’équipe',
    group: 'NOTIFICATIONS',
    pushEnabled: true,
    emailEnabled: true,
  },
  {
    key: 'AVAILABILITY_WEEKLY_REMINDER',
    label: 'Rappel automatique pour les disponibilités en attente',
    group: 'AUTOMATIC_REMINDERS',
    pushEnabled: true,
    emailEnabled: true,
  },
  {
    key: 'REMINDER_7_DAYS',
    label: 'Rappel automatique 7 jours avant un spectacle',
    group: 'AUTOMATIC_REMINDERS',
    pushEnabled: true,
    emailEnabled: false,
  },
  {
    key: 'REMINDER_1_DAY',
    label: 'Rappel automatique 1 jour avant un spectacle',
    group: 'AUTOMATIC_REMINDERS',
    pushEnabled: true,
    emailEnabled: false,
  },
  {
    key: 'ORG_TEAM_REGRESSED',
    label: "Me prévenir quand une équipe confirmée n'est plus complète.",
    group: 'ORGANIZER_ALERTS',
    pushEnabled: false,
    emailEnabled: false,
  },
  {
    key: 'ORG_SCOPE_GRANTED',
    label: "Me prévenir par notification push quand on m'ajoute comme orga.",
    group: 'ORGANIZER_ALERTS',
    pushEnabled: false,
    emailEnabled: false,
  },
  {
    key: 'ORG_TEAM_COMPLETE',
    label: 'Me prévenir quand la composition est bouclée.',
    group: 'ORGANIZER_ALERTS',
    pushEnabled: false,
    emailEnabled: false,
  },
  {
    key: 'ORG_DRAFT_COMPOSITION',
    label: 'Me prévenir quand un brouillon de compo est partagé dans le cercle orga.',
    group: 'ORGANIZER_ALERTS',
    pushEnabled: false,
    emailEnabled: false,
  },
  {
    key: 'ORG_EVENT_DRAFT_CREATED',
    label: 'Me prévenir quand un spectacle brouillon est créé.',
    group: 'ORGANIZER_ALERTS',
    pushEnabled: false,
    emailEnabled: false,
  },
  {
    key: 'ORG_COMPOSITION_INCOMPLETE',
    label: 'Me prévenir si des places manquent (rappels hebdo et à J-7).',
    group: 'ORGANIZER_ALERTS',
    pushEnabled: false,
    emailEnabled: false,
  },
  {
    key: 'ORG_SLA_OPEN_AVAILABILITY',
    label: 'Me prévenir quand un spectacle approche (~1 mois) sans dispos ouvertes.',
    group: 'ORGANIZER_ALERTS',
    pushEnabled: false,
    emailEnabled: false,
  },
] as const

async function setup(
  options: { pushState?: PushUiState; patchOk?: boolean; hasOrganizerScope?: boolean } = {},
) {
  const getPreferences = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    data: { categories, hasOrganizerScope: options.hasOrganizerScope ?? false },
  })
  const patchPreferences = vi.fn().mockImplementation(async () => {
    if (options.patchOk === false) {
      return { ok: false, status: 500 }
    }
    return { ok: true, status: 200, data: { categories, hasOrganizerScope: options.hasOrganizerScope ?? false } }
  })
  const uiState = signal<PushUiState>(options.pushState ?? 'disabled')
  const loadStatus = vi.fn().mockImplementation(async () => {
    const state = uiState()
    return { state }
  })
  const snack = { open: vi.fn() }

  await TestBed.configureTestingModule({
    imports: [NotificationPreferencesSection, NoopAnimationsModule],
    providers: [
      { provide: MeNotificationPreferencesApiService, useValue: { getPreferences, patchPreferences } },
      { provide: PushNotificationsService, useValue: { loadStatus, uiState } },
      { provide: MatSnackBar, useValue: snack },
    ],
  }).compileComponents()

  TestBed.overrideProvider(MatSnackBar, { useValue: snack })

  const fixture = TestBed.createComponent(NotificationPreferencesSection)
  fixture.detectChanges()
  await fixture.whenStable()
  await vi.waitFor(() => !fixture.nativeElement.querySelector('.notification-preferences__loading'))
  fixture.detectChanges()
  return { fixture, getPreferences, patchPreferences, loadStatus, snack, uiState }
}

function slideToggleInput(fixture: ComponentFixture<NotificationPreferencesSection>, testId: string) {
  return fixture.nativeElement.querySelector(`[data-testid="${testId}"] button`) as HTMLButtonElement
}

describe('NotificationPreferencesSection', () => {
  it('hides ghost category COMPOSITION_SHARED from the DOM', async () => {
    const { fixture } = await setup({ pushState: 'enabled' })
    const text = fixture.nativeElement.textContent ?? ''

    expect(text).not.toContain('Composition partagée')
    expect(fixture.nativeElement.querySelector('[data-testid="notification-pref-composition-shared-push"]')).toBeNull()
  })

  it('renders Équipe au complet after Spectacle annulé regardless of API category order', async () => {
    const { fixture } = await setup({ pushState: 'enabled' })
    const titles = Array.from(
      fixture.nativeElement.querySelectorAll('.notification-preferences__title') as NodeListOf<HTMLElement>,
      (element) => element.textContent?.trim() ?? '',
    )

    const archivedIndex = titles.indexOf('Spectacle annulé')
    const teamCompleteIndex = titles.indexOf('Équipe au complet')

    expect(archivedIndex).toBeGreaterThanOrEqual(0)
    expect(teamCompleteIndex).toBeGreaterThan(archivedIndex)
  })

  it('renders Équipe au complet preference row with as-shipped copy', async () => {
    const { fixture } = await setup({ pushState: 'enabled' })
    const text = fixture.nativeElement.textContent ?? ''

    expect(text).toContain('Équipe au complet')
    expect(text).toContain('Me prévenir quand tous les participant·es ont confirmé')
    expect(text).not.toContain('Équipe confirmée pour un spectacle')
    expect(fixture.nativeElement.querySelector('[data-testid="notification-pref-team-confirmed-push"]')).toBeTruthy()
    expect(fixture.nativeElement.querySelector('[data-testid="notification-pref-team-confirmed-email"]')).toBeTruthy()
  })

  it('renders member-facing copy for Disponibilités and Participation', async () => {
    const { fixture } = await setup({ pushState: 'enabled' })
    const text = fixture.nativeElement.textContent ?? ''

    expect(text).toContain('Disponibilités')
    expect(text).toContain('Participation')
    expect(text).toContain('Changements importants')
    expect(text).toContain('Spectacle annulé')
    expect(text).toContain('Me prévenir quand on attend ma dispo')
    expect(text).toContain('Me prévenir quand je dois confirmer')
    expect(text).toContain('Me prévenir quand la date, le lieu ou le format change')
    expect(text).toContain('Me prévenir quand un spectacle où j’ai déjà interagi')
    expect(text).not.toContain("M'envoyer une notification lorsqu'un spectacle a besoin de personnes")
    expect(text).not.toContain('Si désactivé')
  })

  it('renders eight visible member preference rows when API includes 8.8 and 8.9 categories', async () => {
    const { fixture } = await setup({ pushState: 'enabled' })
    const visibleToggles = fixture.nativeElement.querySelectorAll(
      '[data-testid^="notification-pref-"][data-testid$="-push"]',
    )

    expect(visibleToggles.length).toBe(8)
    expect(fixture.nativeElement.querySelector('[data-testid="notification-pref-event-details-changed-push"]')).toBeTruthy()
    expect(fixture.nativeElement.querySelector('[data-testid="notification-pref-event-archived-push"]')).toBeTruthy()
  })

  it('uses as-shipped aria-label format on category toggles', async () => {
    const { fixture } = await setup({ pushState: 'enabled' })

    const pushButton = slideToggleInput(fixture, 'notification-pref-availability-request-push')
    const emailButton = slideToggleInput(fixture, 'notification-pref-availability-request-email')

    expect(pushButton.getAttribute('aria-label')).toBe('Disponibilités — cet appareil')
    expect(emailButton.getAttribute('aria-label')).toBe('Disponibilités — e-mail')
  })

  it('hides organizer section when hasOrganizerScope is false', async () => {
    const { fixture } = await setup({ pushState: 'enabled', hasOrganizerScope: false })
    const text = fixture.nativeElement.textContent ?? ''

    expect(text).not.toContain('Alertes organisateur')
    expect(text).not.toContain('Équipe plus complète')
    expect(fixture.nativeElement.querySelectorAll('.notification-preferences__section-title').length).toBe(2)
    expect(fixture.nativeElement.querySelectorAll('.notification-preferences__card').length).toBe(2)
  })

  it('renders organizer section with Équipe plus complète when hasOrganizerScope is true', async () => {
    const { fixture } = await setup({ pushState: 'enabled', hasOrganizerScope: true })
    const text = fixture.nativeElement.textContent ?? ''

    expect(text).toContain('Alertes organisateur')
    expect(text).toContain('Pour les spectacles où tu organises. Active seulement ce dont tu as besoin.')
    expect(text).toContain('Équipe plus complète')
    expect(text).toContain("Me prévenir quand une équipe confirmée n'est plus complète")
    expect(fixture.nativeElement.querySelectorAll('.notification-preferences__section-title').length).toBe(3)
    expect(fixture.nativeElement.querySelector('[data-testid="notification-pref-org-team-regressed-push"]')).toBeTruthy()
  })

  it('renders v2 organizer copy for Nouveau spectacle, Compo proposée and Nouveau rôle orga', async () => {
    const { fixture } = await setup({ pushState: 'enabled', hasOrganizerScope: true })
    const text = fixture.nativeElement.textContent ?? ''

    expect(text).toContain('Nouveau spectacle')
    expect(text).toContain('Me prévenir quand un spectacle en brouillon est créé')
    expect(text).toContain('Compo proposée')
    expect(text).toContain('Me prévenir quand une composition est partagée avec le cercle orga')
    expect(text).toContain('Nouveau rôle orga')
    expect(text).toContain("Me prévenir par notification push quand on m'ajoute comme orga")
    expect(text).not.toContain('Nouveau brouillon')
    expect(text).not.toContain('Brouillon partagé')
    expect(text).not.toContain('Déclin immédiat')
    expect(fixture.nativeElement.querySelector('[data-testid="notification-pref-org-event-draft-created-push"]')).toBeTruthy()
    expect(fixture.nativeElement.querySelector('[data-testid="notification-pref-org-draft-composition-push"]')).toBeTruthy()
    expect(fixture.nativeElement.querySelector('[data-testid="notification-pref-org-scope-granted-push"]')).toBeTruthy()
  })

  it('renders member/orga footnote when organizer section is visible', async () => {
    const { fixture } = await setup({ pushState: 'enabled', hasOrganizerScope: true })
    const text = fixture.nativeElement.textContent ?? ''

    expect(text).toContain('Les messages membre concernent ta participation.')
    expect(text).toContain('Les alertes orga concernent la coordination')
    expect(fixture.nativeElement.querySelector('.notification-preferences__footnote')).toBeTruthy()
  })

  it('renders section intros and channel legend once per card', async () => {
    const { fixture } = await setup({ pushState: 'enabled' })
    const text = fixture.nativeElement.textContent ?? ''

    expect(text).toContain('Messages pour moi')
    expect(text).toContain('Tu reçois ces messages par défaut. Désactive ce que tu ne veux plus.')
    expect(text).toContain('Rappels automatiques')
    expect(text).toContain('Rappels liés au calendrier, pas aux actions des orgas.')
    expect(fixture.nativeElement.querySelectorAll('.notification-preferences__column-header').length).toBe(4)
    expect(fixture.nativeElement.querySelectorAll('.notification-preferences__channel-label').length).toBe(0)
    expect(fixture.nativeElement.querySelectorAll('.notification-preferences__card').length).toBe(2)
    expect(text).toMatch(/Cet appareil/)
    expect(text).toMatch(/E-mail/)
  })

  it('disables push category toggles when push is off and keeps email editable', async () => {
    const { fixture } = await setup({ pushState: 'disabled' })

    expect(fixture.nativeElement.querySelector('[data-testid="notification-preferences-push-disabled-hint"]')).toBeNull()
    expect(slideToggleInput(fixture, 'notification-pref-availability-request-push').disabled).toBe(true)
    expect(slideToggleInput(fixture, 'notification-pref-availability-request-email').disabled).toBe(false)
  })

  it('enables push category toggles when shared push ui state becomes enabled', async () => {
    const { fixture, uiState } = await setup({ pushState: 'disabled' })

    expect(slideToggleInput(fixture, 'notification-pref-availability-request-push').disabled).toBe(true)

    uiState.set('enabled')
    fixture.detectChanges()

    expect(slideToggleInput(fixture, 'notification-pref-availability-request-push').disabled).toBe(false)
  })

  it('patches a category channel when toggled', async () => {
    const { fixture, patchPreferences } = await setup({ pushState: 'enabled' })
    const component = fixture.componentInstance as unknown as {
      updatePreference: (key: string, channel: 'push' | 'email', enabled: boolean) => Promise<void>
    }

    await component.updatePreference('AVAILABILITY_REQUEST', 'push', false)

    expect(patchPreferences).toHaveBeenCalledWith({
      preferences: { AVAILABILITY_REQUEST: { push: false } },
    })
  })

  it('groups reminders using the server group field', async () => {
    const { fixture } = await setup({ pushState: 'enabled' })

    expect(fixture.nativeElement.textContent).toContain('Veille du spectacle')
    const reminderToggle = slideToggleInput(fixture, 'notification-pref-reminder-1-day-email')
    expect(reminderToggle).toBeTruthy()
  })

  it('rolls back and shows snackbar when patch fails', async () => {
    const { fixture, patchPreferences, snack } = await setup({ pushState: 'enabled', patchOk: false })
    const component = fixture.componentInstance as unknown as {
      updatePreference: (key: string, channel: 'push' | 'email', enabled: boolean) => Promise<void>
    }

    await component.updatePreference('AVAILABILITY_REQUEST', 'email', false)

    expect(patchPreferences).toHaveBeenCalled()
    const emailToggle = slideToggleInput(fixture, 'notification-pref-availability-request-email')
    expect(emailToggle.getAttribute('aria-checked')).toBe('true')
    expect(snack.open).toHaveBeenCalledWith('Enregistrement des préférences impossible', 'OK', { duration: 5000 })
  })

  it('debounces rapid toggles into a single patch', async () => {
    const { fixture, patchPreferences } = await setup({ pushState: 'enabled' })
    const component = fixture.componentInstance as unknown as {
      onToggle: (
        category: (typeof categories)[number],
        channel: 'email',
        change: MatSlideToggleChange,
      ) => void
    }
    const category = categories[0]
    const change = (checked: boolean) => ({ checked, source: null } as unknown as MatSlideToggleChange)

    component.onToggle(category, 'email', change(false))
    component.onToggle(category, 'email', change(true))
    await new Promise((resolve) => window.setTimeout(resolve, 350))
    await fixture.whenStable()

    expect(patchPreferences).toHaveBeenCalledTimes(1)
    expect(patchPreferences).toHaveBeenCalledWith({
      preferences: { AVAILABILITY_REQUEST: { email: true } },
    })
  })
})
