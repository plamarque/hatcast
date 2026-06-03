import { Component, inject, ViewEncapsulation } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'

import { UserAvatarComponent } from '../../../shared/user-avatar/user-avatar'
import { AccountPageContext } from '../account-page-context'

@Component({
  selector: 'app-account-identity-tab',
  imports: [
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
  protected readonly ctx = inject(AccountPageContext)
}
