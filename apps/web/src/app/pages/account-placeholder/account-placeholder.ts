import { Component, inject, OnInit, signal } from '@angular/core'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar } from '@angular/material/snack-bar'
import { MatTabLink, MatTabNav, MatTabNavPanel } from '@angular/material/tabs'
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router'

import { AppVersionService } from '../../core/app/app-version.service'
import { AuthApiService } from '../../core/auth/auth-api.service'
import { rememberCurrentUrlForPostLogin } from '../../core/navigation/auth-redirect.helper'
import { AccountPageContext } from './account-page-context'

/** Mon compte — shell hub avec onglets (story 17.34). */
@Component({
  selector: 'app-account-placeholder',
  imports: [
    MatProgressSpinnerModule,
    MatTabNav,
    MatTabLink,
    MatTabNavPanel,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
  ],
  providers: [AccountPageContext],
  templateUrl: './account-placeholder.html',
  styleUrl: './account-placeholder.scss',
})
export class AccountPlaceholder implements OnInit {
  private readonly auth = inject(AuthApiService)
  private readonly router = inject(Router)
  private readonly snack = inject(MatSnackBar)
  private readonly appVersion = inject(AppVersionService)
  private readonly ctx = inject(AccountPageContext)

  protected readonly loading = signal(true)

  async ngOnInit(): Promise<void> {
    void this.appVersion.ensureLoaded()
    await this.redirectLegacyNotificationsFragment()

    const session = await this.auth.ensureHatcastSession()
    if (!session.ok || !session.data) {
      await this.redirectToLogin()
      return
    }
    this.ctx.setUser(session.data.user)
    this.loading.set(false)
  }

  protected user() {
    return this.ctx.user()
  }

  private async redirectLegacyNotificationsFragment(): Promise<void> {
    const tree = this.router.parseUrl(this.router.url)
    if (tree.fragment === 'notifications') {
      await this.router.navigate(['/compte/notifications'], { replaceUrl: true })
    }
  }

  private async redirectToLogin(): Promise<void> {
    this.loading.set(false)
    this.snack.open('Votre session a expiré ou vous n’êtes pas connecté.', 'OK', {
      duration: 6000,
    })
    rememberCurrentUrlForPostLogin(this.router)
    await this.router.navigate(['/connexion'], { replaceUrl: true })
  }
}
