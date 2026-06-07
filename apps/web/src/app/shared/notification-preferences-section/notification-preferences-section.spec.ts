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
    key: 'COMPOSITION_SHARED',
    label: 'Composition partagée avec l’équipe',
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
] as const

async function setup(options: { pushState?: PushUiState; patchOk?: boolean } = {}) {
  const getPreferences = vi.fn().mockResolvedValue({ ok: true, status: 200, data: { categories } })
  const patchPreferences = vi.fn().mockImplementation(async () => {
    if (options.patchOk === false) {
      return { ok: false, status: 500 }
    }
    return { ok: true, status: 200, data: { categories } }
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
  it('hides ghost categories COMPOSITION_SHARED and TEAM_CONFIRMED from the DOM', async () => {
    const { fixture } = await setup({ pushState: 'enabled' })
    const text = fixture.nativeElement.textContent ?? ''

    expect(text).not.toContain('Composition partagée')
    expect(text).not.toContain('Équipe confirmée')
    expect(fixture.nativeElement.querySelector('[data-testid="notification-pref-composition-shared-push"]')).toBeNull()
    expect(fixture.nativeElement.querySelector('[data-testid="notification-pref-team-confirmed-push"]')).toBeNull()
  })

  it('renders member-facing copy for Disponibilités and Participation', async () => {
    const { fixture } = await setup({ pushState: 'enabled' })
    const text = fixture.nativeElement.textContent ?? ''

    expect(text).toContain('Disponibilités')
    expect(text).toContain('Participation')
    expect(text).toContain('Me prévenir quand on attend ma dispo')
    expect(text).toContain('Me prévenir quand je dois confirmer')
    expect(text).not.toContain("M'envoyer une notification lorsqu'un spectacle a besoin de personnes")
    expect(text).not.toContain('Si désactivé')
  })

  it('uses as-shipped aria-label format on category toggles', async () => {
    const { fixture } = await setup({ pushState: 'enabled' })

    const pushButton = slideToggleInput(fixture, 'notification-pref-availability-request-push')
    const emailButton = slideToggleInput(fixture, 'notification-pref-availability-request-email')

    expect(pushButton.getAttribute('aria-label')).toBe('Disponibilités — cet appareil')
    expect(emailButton.getAttribute('aria-label')).toBe('Disponibilités — e-mail')
  })

  it('renders section intros, channel labels and column headers', async () => {
    const { fixture } = await setup({ pushState: 'enabled' })
    const text = fixture.nativeElement.textContent ?? ''

    expect(text).toContain('Messages pour moi')
    expect(text).toContain('Tu reçois ces messages par défaut. Désactive ce que tu ne veux plus.')
    expect(text).toContain('Rappels automatiques')
    expect(text).toContain('Rappels liés au calendrier, pas aux actions des orgas.')
    expect(fixture.nativeElement.querySelectorAll('.notification-preferences__column-header').length).toBe(4)
    expect(fixture.nativeElement.querySelectorAll('.notification-preferences__channel-label').length).toBeGreaterThan(0)
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
