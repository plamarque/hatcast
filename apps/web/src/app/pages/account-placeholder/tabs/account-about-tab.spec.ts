import { signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { MatSnackBar } from '@angular/material/snack-bar'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { describe, expect, it, vi } from 'vitest'

import { AppVersionService } from '../../../core/app/app-version.service'
import { PwaUpdateService } from '../../../core/pwa/pwa-update.service'
import { ChangelogDialogService } from '../../../shared/changelog/changelog-dialog.service'
import { AccountAboutTab } from './account-about-tab'

describe('AccountAboutTab', () => {
  function setup(options: { manualCheckAvailable?: boolean } = {}) {
    const snackOpen = vi.fn()
    const checkForUpdatesManually = vi.fn().mockResolvedValue('up-to-date')
    const openChangelog = vi.fn()

    TestBed.configureTestingModule({
      imports: [AccountAboutTab, NoopAnimationsModule],
      providers: [
        { provide: AppVersionService, useValue: { version: signal('1.2.3') } },
        { provide: ChangelogDialogService, useValue: { open: openChangelog } },
        {
          provide: PwaUpdateService,
          useValue: {
            checking: signal(false),
            isManualCheckAvailable: options.manualCheckAvailable ?? true,
            checkForUpdatesManually,
          },
        },
      ],
    })
    TestBed.overrideProvider(MatSnackBar, { useValue: { open: snackOpen } })

    const fixture = TestBed.createComponent(AccountAboutTab)
    fixture.detectChanges()

    return { fixture, snackOpen, checkForUpdatesManually, openChangelog }
  }

  it('renders version button and check-updates when manual check is available', () => {
    const { fixture } = setup()
    const el = fixture.nativeElement as HTMLElement

    expect(el.querySelector('[data-testid="account-app-version"]')?.textContent).toContain('1.2.3')
    expect(el.querySelector('[data-testid="account-check-updates"]')).toBeTruthy()
  })

  it('hides check-updates when manual check is unavailable', () => {
    const { fixture } = setup({ manualCheckAvailable: false })
    const el = fixture.nativeElement as HTMLElement

    expect(el.querySelector('[data-testid="account-check-updates"]')).toBeNull()
  })

  it('checkForUpdates shows snackbar with result message', async () => {
    const { fixture, snackOpen, checkForUpdatesManually } = setup()
    checkForUpdatesManually.mockResolvedValue('available')

    await fixture.componentInstance['checkForUpdates']()

    expect(checkForUpdatesManually).toHaveBeenCalledOnce()
    expect(snackOpen).toHaveBeenCalledWith('Une mise à jour est disponible.', undefined, {
      duration: 4_000,
    })
  })
})
