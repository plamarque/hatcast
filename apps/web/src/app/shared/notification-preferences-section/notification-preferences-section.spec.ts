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
  const loadStatus = vi.fn().mockResolvedValue({ state: options.pushState ?? 'disabled' })
  const snack = { open: vi.fn() }

  await TestBed.configureTestingModule({
    imports: [NotificationPreferencesSection, NoopAnimationsModule],
    providers: [
      { provide: MeNotificationPreferencesApiService, useValue: { getPreferences, patchPreferences } },
      { provide: PushNotificationsService, useValue: { loadStatus } },
      { provide: MatSnackBar, useValue: snack },
    ],
  }).compileComponents()

  TestBed.overrideProvider(MatSnackBar, { useValue: snack })

  const fixture = TestBed.createComponent(NotificationPreferencesSection)
  fixture.detectChanges()
  await fixture.whenStable()
  await vi.waitFor(() => !fixture.nativeElement.querySelector('.notification-preferences__loading'))
  fixture.detectChanges()
  return { fixture, getPreferences, patchPreferences, loadStatus, snack }
}

function slideToggleInput(fixture: ComponentFixture<NotificationPreferencesSection>, testId: string) {
  return fixture.nativeElement.querySelector(`[data-testid="${testId}"] button`) as HTMLButtonElement
}

describe('NotificationPreferencesSection', () => {
  it('disables push category toggles when push is off and keeps email editable', async () => {
    const { fixture } = await setup({ pushState: 'disabled' })

    expect(fixture.nativeElement.textContent).toContain('Les préférences ci-dessous sont désactivées')
    expect(slideToggleInput(fixture, 'notification-pref-availability-request-push').disabled).toBe(true)
    expect(slideToggleInput(fixture, 'notification-pref-availability-request-email').disabled).toBe(false)
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

  it('renders French labels from the API catalog', async () => {
    const { fixture } = await setup({ pushState: 'enabled' })

    expect(fixture.nativeElement.textContent).toContain(
      "M'envoyer une notification lorsqu'un spectacle a besoin de personnes",
    )
    expect(fixture.nativeElement.textContent).toContain('Rappel automatique 1 jour avant un spectacle')
  })

  it('groups reminders using the server group field', async () => {
    const { fixture } = await setup({ pushState: 'enabled' })

    expect(fixture.nativeElement.textContent).toContain('Rappels automatiques')
    expect(fixture.nativeElement.textContent).toContain('Rappel automatique 1 jour avant un spectacle')
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
