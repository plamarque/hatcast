import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, InjectionToken, PLATFORM_ID, signal } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { ChunkRecoveryDialog } from '../../shared/pwa/chunk-recovery-dialog/chunk-recovery-dialog';

/** Same-document addresses still require a full load, including fragment-only changes. */
export function navigateRecoveryDocument(document: Document, path: string): void {
  const target = new URL(path, document.location.origin);
  if (
    target.pathname === document.location.pathname &&
    target.search === document.location.search
  ) {
    document.defaultView!.history.replaceState(null, '', target.href);
    document.location.reload();
  } else {
    document.location.assign(target.href);
  }
}

export const RECOVERY_NAVIGATE = new InjectionToken<(path: string) => void>(
  'Recovery document navigation',
  {
    providedIn: 'root',
    factory: () => {
      const document = inject(DOCUMENT);
      return (path) => navigateRecoveryDocument(document, path);
    },
  },
);

export function isRouteImportFailure(error: unknown): boolean {
  const message = error instanceof Error ? error.message : typeof error === 'string' ? error : '';
  return /failed to fetch dynamically imported module|error loading dynamically imported module|importing a module script failed|failed to load module script:.*(?:mime|javascript)|not a valid javascript mime type for module script|disallowed mime type.*(?:module|text\/html)|loading chunk [\w-]+ failed/i.test(
    message,
  );
}

export function safeRecoveryPath(path: string, origin: string): string | null {
  if (!/^\/(?!\/)/.test(path) || /[\\\u0000-\u0020\u007f]/.test(path)) return null;
  try {
    const url = new URL(path, origin);
    return url.origin === origin ? url.pathname + url.search + url.hash : null;
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class ChunkRecoveryService {
  private readonly router = inject(Router);
  private readonly dialogs = inject(MatDialog);
  private readonly sw = inject(SwUpdate);
  private readonly document = inject(DOCUMENT);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly navigate = inject(RECOVERY_NAVIGATE);
  readonly active = signal(false);
  private ref: MatDialogRef<ChunkRecoveryDialog> | null = null;
  private rendered = this.router.navigated && this.router.url.split(/[?#]/)[0] !== '/';
  private invalidateConfirmation: (() => void) | null = null;
  private attempt = 0;

  constructor() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) this.invalidateConfirmation?.();
      if (event instanceof NavigationEnd) {
        if (event.urlAfterRedirects.split(/[?#]/)[0] !== '/') this.rendered = true;
        this.ref?.close();
      }
    });
  }

  handle(error: NavigationError): void {
    if (!this.browser || this.ref || !isRouteImportFailure(error.error)) return;
    const destination = safeRecoveryPath(error.url, this.document.location.origin);
    if (!destination) return;
    const busy = signal(false);
    const feedback = signal('');
    const canDismiss = this.rendered;
    const ref = this.dialogs.open(ChunkRecoveryDialog, {
      width: '440px',
      maxWidth: 'calc(100vw - 32px)',
      closeOnNavigation: false,
      disableClose: !canDismiss,
      restoreFocus: true,
      data: {
        busy,
        feedback,
        canDismiss,
        confirm: () => {
          void confirm();
        },
        exit: () => {
          if (busy() || !canDismiss) return;
          ref.close();
        },
      },
    });
    this.ref = ref;
    this.active.set(true);
    this.invalidateConfirmation = () => {
      ++this.attempt;
      busy.set(false);
      ref.disableClose = !canDismiss;
    };
    ref.beforeClosed().subscribe(() => {
      if (this.ref === ref) {
        ++this.attempt;
        this.ref = null;
        this.invalidateConfirmation = null;
        this.active.set(false);
      }
    });
    const confirm = async () => {
      if (busy() || this.ref !== ref) return;
      const attempt = ++this.attempt;
      busy.set(true);
      feedback.set('');
      ref.disableClose = true;
      let navigating = false;
      try {
        if (this.document.defaultView?.navigator.onLine === false) throw new Error('offline');
        const controlled = this.document.defaultView?.navigator.serviceWorker?.controller;
        if (controlled && !(await this.prepareUpdate())) throw new Error('not ready');
        if (this.ref !== ref || attempt !== this.attempt) return;
        this.navigate(destination);
        navigating = true;
      } catch {
        if (this.ref === ref && attempt === this.attempt) {
          feedback.set('Impossible de vérifier la mise à jour. Vérifie ta connexion et réessaie.');
        }
      } finally {
        if (!navigating && this.ref === ref && attempt === this.attempt) {
          busy.set(false);
          ref.disableClose = !canDismiss;
        }
      }
    };
  }

  private async prepareUpdate(): Promise<boolean> {
    if (!this.sw.isEnabled) return false;
    let knownManifest = false;
    const subscription = this.sw.versionUpdates.subscribe((event) => {
      if (event.type === 'NO_NEW_VERSION_DETECTED') knownManifest = true;
    });
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      return await Promise.race([
        this.sw.checkForUpdate().then((ready) => ready || knownManifest),
        new Promise<boolean>((resolve) => {
          timer = setTimeout(() => resolve(false), 30_000);
        }),
      ]);
    } finally {
      clearTimeout(timer);
      subscription.unsubscribe();
    }
  }
}
