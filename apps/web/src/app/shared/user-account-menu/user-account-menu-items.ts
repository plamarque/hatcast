import { Component, inject, input } from '@angular/core';
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
