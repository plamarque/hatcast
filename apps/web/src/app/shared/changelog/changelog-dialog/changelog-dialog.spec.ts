import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogRef } from '@angular/material/dialog';
import { describe, expect, it, vi } from 'vitest';

import { ChangelogService, type ChangelogVersion } from '../../../core/app/changelog.service';
import { ChangelogDialog } from './changelog-dialog';

describe('ChangelogDialog', () => {
  async function setup(options: {
    loading?: boolean;
    error?: boolean;
    versions?: ChangelogVersion[];
  } = {}) {
    const loadChangelog = vi.fn().mockResolvedValue(undefined);

    await TestBed.configureTestingModule({
      imports: [ChangelogDialog, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
        {
          provide: ChangelogService,
          useValue: {
            loading: signal(options.loading ?? false),
            error: signal(options.error ?? false),
            versions: signal(options.versions ?? []),
            loadChangelog,
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ChangelogDialog);
    fixture.detectChanges();
    await fixture.whenStable();

    return { fixture, loadChangelog };
  }

  it('loads changelog on init', async () => {
    const { loadChangelog } = await setup();
    expect(loadChangelog).toHaveBeenCalled();
  });

  it('shows loading state in French', async () => {
    const { fixture } = await setup({ loading: true });
    const text = fixture.nativeElement.textContent ?? '';
    expect(text).toContain('Chargement des nouveautés');
  });

  it('shows error state in French', async () => {
    const { fixture } = await setup({ error: true });
    expect(fixture.nativeElement.textContent).toContain(
      'Impossible de charger les nouveautés',
    );
  });

  it('shows empty state in French', async () => {
    const { fixture } = await setup({ versions: [] });
    expect(fixture.nativeElement.textContent).toContain('Aucune nouveauté récente');
  });

  it('uses mat-button for Fermer dismiss (not flat primary)', async () => {
    const { fixture } = await setup({
      versions: [
        {
          version: '1.0.0',
          date: '2026-06-02',
          changes: [{ id: '1.0.0-0', emoji: '✨', description: 'Test' }],
        },
      ],
    })

    const closeBtn = fixture.nativeElement.querySelector(
      '.changelog-dialog__close',
    ) as HTMLButtonElement
    expect(closeBtn?.textContent?.trim()).toBe('Fermer')
    expect(closeBtn?.classList.contains('mat-mdc-button-base')).toBe(true)
    expect(closeBtn?.classList.contains('mat-mdc-unelevated-button')).toBe(false)
  })

  it('lists versions with emoji changes', async () => {
    const { fixture } = await setup({
      versions: [
        {
          version: '1.0.0',
          date: '2026-06-02',
          changes: [{ id: '1.0.0-0', emoji: '✨', description: 'Test' }],
        },
      ],
    });

    const text = fixture.nativeElement.textContent ?? '';
    expect(text).toContain('Nouveautés');
    expect(text).toContain('Version 1.0.0');
    expect(text).toContain('Test');
  });

  it('lists only versions with user-facing changes', async () => {
    const { fixture } = await setup({
      versions: [
        {
          version: '2.0.3',
          date: '2026-06-04',
          changes: [{ id: '2.0.3-0', emoji: '✨', description: 'Visible change' }],
        },
      ],
    });

    const text = fixture.nativeElement.textContent ?? '';
    expect(text).toContain('Version 2.0.3');
    expect(text).toContain('Visible change');
    expect(text).not.toContain('Version 2.0.4');
    expect(text).not.toContain('Cette mise à jour ne change rien de visible pour toi');
  });
});
