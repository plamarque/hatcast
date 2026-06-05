import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  AppVersionService,
  DEFAULT_APP_VERSION,
} from '../../core/app/app-version.service';
import {
  SHOW_CHANGELOG_AFTER_RELOAD_KEY,
  changelogSeenStorageKey,
} from '../../core/app/changelog-keys';
import { ChangelogService } from '../../core/app/changelog.service';
import { ChangelogDialog } from './changelog-dialog/changelog-dialog';
import { ChangelogDialogService } from './changelog-dialog.service';

describe('ChangelogDialogService', () => {
  let dialogOpen: ReturnType<typeof vi.fn>;
  let afterClosed$: Subject<void>;
  let version: string;
  let ensureLoaded: ReturnType<typeof vi.fn>;
  let currentVersionHasUserFacingNotes: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    afterClosed$ = new Subject<void>();
    dialogOpen = vi.fn().mockReturnValue({
      afterClosed: () => afterClosed$.asObservable(),
    });
    version = '1.2.3';
    ensureLoaded = vi.fn().mockResolvedValue(undefined);
    currentVersionHasUserFacingNotes = vi.fn().mockResolvedValue(true);
    sessionStorage.clear();
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        ChangelogDialogService,
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: MatDialog, useValue: { open: dialogOpen } },
        {
          provide: AppVersionService,
          useValue: {
            version: () => version,
            ensureLoaded,
          },
        },
        {
          provide: ChangelogService,
          useValue: { currentVersionHasUserFacingNotes },
        },
      ],
    });
  });

  afterEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  function createService(): ChangelogDialogService {
    return TestBed.inject(ChangelogDialogService);
  }

  it('opens MatDialog with changelog panel options', () => {
    createService().open();

    expect(dialogOpen).toHaveBeenCalledWith(
      ChangelogDialog,
      expect.objectContaining({
        maxWidth: '42rem',
        maxHeight: '85vh',
        panelClass: 'changelog-dialog-panel',
      }),
    );
  });

  it('auto-opens after PWA reload flag and marks version seen on close', async () => {
    sessionStorage.setItem(SHOW_CHANGELOG_AFTER_RELOAD_KEY, '1');

    const pending = createService().maybeAutoOpenAfterPwaUpdate();
    await Promise.resolve();
    await Promise.resolve();

    expect(sessionStorage.getItem(SHOW_CHANGELOG_AFTER_RELOAD_KEY)).toBeNull();
    expect(ensureLoaded).toHaveBeenCalled();
    expect(currentVersionHasUserFacingNotes).toHaveBeenCalledWith('1.2.3');
    expect(dialogOpen).toHaveBeenCalled();
    expect(localStorage.getItem(changelogSeenStorageKey('1.2.3'))).toBeNull();

    afterClosed$.next();
    await pending;

    expect(localStorage.getItem(changelogSeenStorageKey('1.2.3'))).toBe('1');
  });

  it('skips auto-open when current version has no user-facing notes but marks it seen', async () => {
    currentVersionHasUserFacingNotes.mockResolvedValue(false);
    sessionStorage.setItem(SHOW_CHANGELOG_AFTER_RELOAD_KEY, '1');

    await createService().maybeAutoOpenAfterPwaUpdate();

    expect(sessionStorage.getItem(SHOW_CHANGELOG_AFTER_RELOAD_KEY)).toBeNull();
    expect(dialogOpen).not.toHaveBeenCalled();
    expect(localStorage.getItem(changelogSeenStorageKey('1.2.3'))).toBe('1');
  });

  it('does not mark version seen when changelog fetch fails', async () => {
    currentVersionHasUserFacingNotes.mockResolvedValue(null);
    sessionStorage.setItem(SHOW_CHANGELOG_AFTER_RELOAD_KEY, '1');

    await createService().maybeAutoOpenAfterPwaUpdate();

    expect(sessionStorage.getItem(SHOW_CHANGELOG_AFTER_RELOAD_KEY)).toBe('1');
    expect(dialogOpen).not.toHaveBeenCalled();
    expect(localStorage.getItem(changelogSeenStorageKey('1.2.3'))).toBeNull();
  });

  it('does not auto-open when version is fallback (keeps reload flag)', async () => {
    version = DEFAULT_APP_VERSION;
    sessionStorage.setItem(SHOW_CHANGELOG_AFTER_RELOAD_KEY, '1');

    await createService().maybeAutoOpenAfterPwaUpdate();

    expect(dialogOpen).not.toHaveBeenCalled();
    expect(sessionStorage.getItem(SHOW_CHANGELOG_AFTER_RELOAD_KEY)).toBe('1');
  });

  it('does not auto-open when version already seen', async () => {
    sessionStorage.setItem(SHOW_CHANGELOG_AFTER_RELOAD_KEY, '1');
    localStorage.setItem(changelogSeenStorageKey('1.2.3'), '1');

    await createService().maybeAutoOpenAfterPwaUpdate();

    expect(dialogOpen).not.toHaveBeenCalled();
    expect(sessionStorage.getItem(SHOW_CHANGELOG_AFTER_RELOAD_KEY)).toBeNull();
  });

  it('does not auto-open without reload flag', async () => {
    await createService().maybeAutoOpenAfterPwaUpdate();

    expect(dialogOpen).not.toHaveBeenCalled();
  });
});
