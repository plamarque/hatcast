import { Component, computed, inject, input, signal } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { Router, RouterLink } from '@angular/router';

import { AuthApiService } from '../../core/auth/auth-api.service';
import { PwaInstallService } from '../../core/pwa/pwa-install.service';

/** Shared user menu entries (compte, season glance, optional agenda, PWA install, logout). */
@Component({
  selector: 'app-user-account-menu-items',
  imports: [MatMenuModule, RouterLink],
  template: `
    <a mat-menu-item routerLink="/compte">Mon compte</a>
    @if (showSeasonGlanceLink() && seasonGlanceSlug()) {
      <a
        mat-menu-item
        [routerLink]="['/membre', seasonGlanceSlug()!]"
        [queryParams]="seasonGlanceQueryParams()"
      >
        Ma saison en un clin d'œil
      </a>
    }
    @if (showAgendaLink()) {
      <a mat-menu-item routerLink="/agenda">Mon agenda</a>
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
  /** Account slug for `/membre/:userSlug`; when omitted, resolved once from session. */
  readonly userSlug = input<string | null | undefined>(undefined);
  readonly glanceTroupeId = input<string | null | undefined>(undefined);
  readonly glanceLeagueId = input<string | null | undefined>(undefined);
  readonly showSeasonGlanceLink = input(true);
  readonly showLogout = input(true);
  readonly showAgendaLink = input(false);
  readonly logoutLabel = input('Se déconnecter');

  private readonly pwaInstall = inject(PwaInstallService);
  private readonly auth = inject(AuthApiService);
  private readonly router = inject(Router);

  private readonly sessionSlug = signal<string | null>(null);

  protected readonly seasonGlanceSlug = computed(() => {
    const fromInput = this.userSlug()?.trim();
    if (fromInput) {
      return fromInput;
    }
    return this.sessionSlug();
  });

  protected readonly seasonGlanceQueryParams = computed(() => {
    const queryParams: Record<string, string> = {};
    const troupeId = this.glanceTroupeId()?.trim();
    const leagueId = this.glanceLeagueId()?.trim();
    if (troupeId) {
      queryParams['troupeId'] = troupeId;
    }
    if (leagueId) {
      queryParams['leagueId'] = leagueId;
    }
    return queryParams;
  });

  constructor() {
    void this.resolveSlugFromSessionIfNeeded();
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

  private async resolveSlugFromSessionIfNeeded(): Promise<void> {
    if (this.userSlug()?.trim()) {
      return;
    }
    const r = await this.auth.ensureHatcastSession();
    const slug = r.data?.user.slug?.trim();
    if (slug) {
      this.sessionSlug.set(slug);
    }
  }
}
