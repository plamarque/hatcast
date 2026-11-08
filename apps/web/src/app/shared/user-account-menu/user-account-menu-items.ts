import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { Router, RouterLink } from '@angular/router';

import { AuthApiService } from '../../core/auth/auth-api.service';
import { isAccountPath } from '../../layout/member-shell/member-shell-nav-visibility';
import { PwaInstallService } from '../../core/pwa/pwa-install.service';

/** Shared user menu: compte, PWA install, logout (nav principale via barre membre). */
@Component({
  selector: 'app-user-account-menu-items',
  imports: [MatMenuModule, RouterLink],
  template: `
    @if (showAccountLink()) {
      <a mat-menu-item routerLink="/compte">Mon compte</a>
    }
    @if (showAdventPreview()) {
      <a mat-menu-item routerLink="/avent" [queryParams]="{ preview: 1 }">Avent-première</a>
    }
    @if (showInstallApp()) {
      <button type="button" mat-menu-item (click)="onInstallApp()">Installer l'app</button>
    }
    @if (showLogout()) {
      <button type="button" mat-menu-item (click)="onLogout()">{{ logoutLabel() }}</button>
    }
  `,
})
export class UserAccountMenuItemsComponent {
  readonly showLogout = input(true);
  readonly logoutLabel = input('Se déconnecter');

  private readonly pwaInstall = inject(PwaInstallService);
  private readonly auth = inject(AuthApiService);
  private readonly router = inject(Router);
  private readonly previewIdentity = signal<number | null>(null);
  private requestGeneration = 0;
  protected readonly showAdventPreview = computed(() => {
    const userId = this.auth.sessionUser()?.id;
    return !!userId && this.previewIdentity() === this.auth.sessionIdentityVersion();
  });

  constructor() {
    effect((onCleanup) => {
      this.auth.sessionIdentityVersion();
      this.previewIdentity.set(null);
      onCleanup(() => { this.requestGeneration++; });
    });
  }

  refreshPreviewCapability(): void {
    const generation = ++this.requestGeneration;
    const userId = this.auth.sessionUser()?.id;
    const version = this.auth.sessionIdentityVersion();
    this.previewIdentity.set(null);
    if (!userId) return;
    void fetch('/v1/advent/preview-capability', { credentials: 'include', cache: 'no-store' })
      .then(async (response) => response.ok && (await response.json()).productionPreview === true)
      .then((allowed) => {
        if (generation === this.requestGeneration && allowed && this.auth.sessionIdentityVersion() === version) this.previewIdentity.set(version);
      })
      .catch(() => { /* Fail closed without exposing the preview. */ });
  }

  protected showAccountLink(): boolean {
    const path = (this.router.url ?? '').split('?')[0]?.split('#')[0] ?? '';
    return !isAccountPath(path);
  }

  protected showInstallApp(): boolean {
    return !this.pwaInstall.isPwaInstalled();
  }

  protected onInstallApp(): void {
    void this.pwaInstall.installFromUserMenu();
  }

  protected async onLogout(): Promise<void> {
    await this.auth.logout();
    await this.router.navigate(['/connexion'], { replaceUrl: true });
  }
}
