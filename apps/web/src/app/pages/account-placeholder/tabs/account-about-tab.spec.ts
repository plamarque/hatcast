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
  function setup(
    options: {
      manualCheckAvailable?: boolean
      buildMeta?: { gitHash?: string; buildStamp?: string; channel?: 'staging' | 'local' } | null
    } = {},
  ) {
    const snackOpen = vi.fn()
    const checkForUpdatesManually = vi.fn().mockResolvedValue('up-to-date')
    const openChangelog = vi.fn()
    const buildMetaValue = options.buildMeta === undefined
      ? { gitHash: 'a0db03f7', buildStamp: '202606131249', channel: 'staging' as const }
      : options.buildMeta

    TestBed.configureTestingModule({
      imports: [AccountAboutTab, NoopAnimationsModule],
      providers: [
        {
          provide: AppVersionService,
          useValue: {
            version: signal('1.2.3'),
            buildMeta: signal(buildMetaValue),
          },
        },
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

  it('renders brand card with version, build meta and action list', () => {
    const { fixture } = setup()
    const el = fixture.nativeElement as HTMLElement

    expect(el.querySelector('[data-testid="account-app-version"]')?.textContent).toContain('1.2.3')
    expect(el.querySelector('[data-testid="account-app-build-meta"]')?.textContent).toContain(
      'a0db03f7 · 202606131249 · canal staging',
    )
    expect(el.querySelector('[data-testid="account-changelog"]')).toBeTruthy()
    expect(el.querySelector('[data-testid="account-check-updates"]')).toBeTruthy()
    expect(el.querySelector('[data-testid="account-about-copyright"]')?.textContent).toContain(
      'Patrice Lamarque',
    )
  })

  it('hides build meta when channel is unknown', () => {
    const { fixture } = setup({
      buildMeta: { gitHash: 'abc1234', buildStamp: '202606131249' },
    })
    const el = fixture.nativeElement as HTMLElement

    expect(el.querySelector('[data-testid="account-app-build-meta"]')).toBeNull()
  })

  it('hides build meta when buildMeta signal is null', () => {
    const { fixture } = setup({ buildMeta: null })
    const el = fixture.nativeElement as HTMLElement

    expect(el.querySelector('[data-testid="account-app-build-meta"]')).toBeNull()
  })

  it('links version label to build meta via aria-describedby when meta is shown', () => {
    const { fixture } = setup()
    const el = fixture.nativeElement as HTMLElement
    const versionEl = el.querySelector('[data-testid="account-app-version"]')

    expect(versionEl?.getAttribute('aria-describedby')).toBe('account-app-build-meta')
    expect(el.querySelector('#account-app-build-meta')).toBeTruthy()
  })

  it('hides check-updates when manual check is unavailable', () => {
    const { fixture } = setup({ manualCheckAvailable: false })
    const el = fixture.nativeElement as HTMLElement

    expect(el.querySelector('[data-testid="account-check-updates"]')).toBeNull()
    expect(el.querySelector('[data-testid="account-changelog"]')).toBeTruthy()
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
