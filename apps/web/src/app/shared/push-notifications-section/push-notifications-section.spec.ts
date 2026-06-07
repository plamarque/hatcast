import { signal } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { MatSnackBar } from '@angular/material/snack-bar'
import { describe, expect, it, vi } from 'vitest'

import { PushNotificationsService, type PushUiState } from '../../core/push/push-notifications.service'
import { PushNotificationsSection } from './push-notifications-section'

async function setup(options: { initialState?: PushUiState } = {}) {
  const uiState = signal<PushUiState>('loading')
  const loadStatus = vi.fn().mockImplementation(async () => {
    const state = options.initialState ?? 'disabled'
    uiState.set(state)
    return { state }
  })
  const enable = vi.fn()
  const disable = vi.fn()
  const canUsePush = vi.fn().mockReturnValue(true)

  await TestBed.configureTestingModule({
    imports: [PushNotificationsSection, NoopAnimationsModule],
    providers: [
      {
        provide: PushNotificationsService,
        useValue: {
          loadStatus,
          enable,
          disable,
          canUsePush,
          uiState,
          getPermission: vi.fn().mockReturnValue('default'),
        },
      },
      { provide: MatSnackBar, useValue: { open: vi.fn() } },
    ],
  }).compileComponents()

  const fixture = TestBed.createComponent(PushNotificationsSection)
  fixture.detectChanges()
  await fixture.whenStable()
  await vi.waitFor(() => !fixture.nativeElement.querySelector('.push-notifications-section__loading'))
  fixture.detectChanges()
  return { fixture, enable, disable, loadStatus }
}

describe('PushNotificationsSection', () => {
  it('renders toggle with data-testid', async () => {
    const { fixture } = await setup({ initialState: 'disabled' })
    const toggle = fixture.nativeElement.querySelector('[data-testid="push-notifications-toggle"]')
    expect(toggle).toBeTruthy()
  })

  it('shows denied permission message', async () => {
    const { fixture } = await setup({ initialState: 'denied' })
    await fixture.whenStable()
    fixture.detectChanges()
    const text = fixture.nativeElement.textContent as string
    expect(text).toContain('Autorisation refusée sur cet appareil')
    expect(fixture.nativeElement.querySelector('[data-testid="push-notifications-reactivate-help"]')).toBeTruthy()
  })

  it('shows unsupported message when push unavailable', async () => {
    const uiState = signal<PushUiState>('loading')
    await TestBed.configureTestingModule({
      imports: [PushNotificationsSection, NoopAnimationsModule],
      providers: [
        {
          provide: PushNotificationsService,
          useValue: {
            loadStatus: vi.fn().mockImplementation(async () => {
              uiState.set('unsupported')
              return { state: 'unsupported' }
            }),
            uiState,
            canUsePush: vi.fn().mockReturnValue(false),
          },
        },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
      ],
    }).compileComponents()

    const fixture = TestBed.createComponent(PushNotificationsSection)
    fixture.detectChanges()
    await fixture.whenStable()
    await vi.waitFor(() => !fixture.nativeElement.querySelector('.push-notifications-section__loading'))
    fixture.detectChanges()

    const el = fixture.nativeElement.querySelector('[data-testid="push-notifications-unsupported"]')
    expect(el).toBeTruthy()
    expect(el.textContent).toContain('ne sont pas disponibles')
  })
})
