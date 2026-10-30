import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ChunkRecoveryDialog } from './chunk-recovery-dialog';

describe('ChunkRecoveryDialog with real MatDialog', () => {
  afterEach(() => TestBed.inject(MatDialog).closeAll());
  it('renders approved copy, shared dismiss, primary action and retry feedback', async () => {
    TestBed.configureTestingModule({ imports: [ChunkRecoveryDialog] });
    const busy = signal(false),
      feedback = signal('');
    const confirm = vi.fn(),
      exit = vi.fn();
    TestBed.inject(MatDialog).open(ChunkRecoveryDialog, {
      data: { busy, feedback, canDismiss: true, confirm, exit },
    });
    TestBed.tick();
    const dialog = document.querySelector('mat-dialog-container')!;
    expect(dialog.textContent).toContain('Une mise à jour est nécessaire');
    expect(dialog.textContent).toContain('Mets HatCast à jour pour continuer.');
    expect(dialog.textContent).toContain(
      'Les modifications non enregistrées peuvent être perdues.',
    );
    const buttons = Array.from(dialog.querySelectorAll('button'));
    expect(buttons.map((b) => b.textContent?.trim())).toEqual([
      'Mettre à jour et continuer',
      'Plus tard',
    ]);
    buttons[0].click();
    expect(confirm).toHaveBeenCalledOnce();
    expect(exit).not.toHaveBeenCalled();
    buttons[1].click();
    expect(exit).toHaveBeenCalledOnce();
    busy.set(true);
    TestBed.tick();
    expect(buttons.every((b) => b.disabled)).toBe(true);
    busy.set(false);
    feedback.set('Vérifie ta connexion');
    TestBed.tick();
    expect(dialog.querySelector('[role="status"]')?.textContent).toContain('connexion');
    expect(buttons.every((b) => !b.disabled)).toBe(true);
    expect(document.querySelector('.cdk-overlay-backdrop')).toBeTruthy();
  });
  it('offers only update and retry for initial failure', () => {
    TestBed.configureTestingModule({ imports: [ChunkRecoveryDialog] });
    const exit = vi.fn();
    TestBed.inject(MatDialog).open(ChunkRecoveryDialog, {
      data: {
        busy: signal(false),
        feedback: signal(''),
        canDismiss: false,
        confirm: vi.fn(),
        exit,
      },
    });
    TestBed.tick();
    const button = document.querySelector('mat-dialog-container button') as HTMLButtonElement;
    expect(button.textContent).toContain('Mettre à jour et continuer');
    expect(document.querySelectorAll('mat-dialog-container button')).toHaveLength(1);
    expect(document.querySelector('mat-dialog-container')?.textContent).not.toContain(
      'Retour à l’accueil',
    );
    expect(exit).not.toHaveBeenCalled();
  });
});
