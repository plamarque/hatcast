import { Component, inject, ViewEncapsulation } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { Router } from '@angular/router'

import { AuthApiService } from '../../../core/auth/auth-api.service'
import { UserAvatarComponent } from '../../../shared/user-avatar/user-avatar'
import { AccountPageContext } from '../account-page-context'

@Component({
  selector: 'app-account-identity-tab',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    UserAvatarComponent,
  ],
  templateUrl: './account-identity-tab.html',
  styleUrl: '../account-placeholder.scss',
  encapsulation: ViewEncapsulation.None,
})
export class AccountIdentityTab {
  private readonly auth = inject(AuthApiService)
  private readonly router = inject(Router)

  protected readonly ctx = inject(AccountPageContext)

  protected async logout(): Promise<void> {
    await this.auth.logout()
    await this.router.navigate(['/connexion'], { replaceUrl: true })
  }
}
