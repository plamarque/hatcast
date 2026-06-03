import { Component, inject, ViewEncapsulation } from '@angular/core'
import { MatListModule } from '@angular/material/list'
import { MatTooltipModule } from '@angular/material/tooltip'

import { AccountPageContext } from '../account-page-context'

const COMING_SOON_TOOLTIP = 'Fonctionnalité à venir (prochaine livraison).'
const PASSWORD_COMING_SOON_TOOLTIP =
  'Fonctionnalité à venir. Pour un mot de passe oublié, utilise le parcours de réinitialisation depuis la connexion.'

@Component({
  selector: 'app-account-security-tab',
  imports: [MatListModule, MatTooltipModule],
  templateUrl: './account-security-tab.html',
  styleUrl: '../account-placeholder.scss',
  encapsulation: ViewEncapsulation.None,
})
export class AccountSecurityTab {
  protected readonly ctx = inject(AccountPageContext)

  protected readonly emailComingSoonTooltip = COMING_SOON_TOOLTIP
  protected readonly passwordComingSoonTooltip = PASSWORD_COMING_SOON_TOOLTIP
  protected readonly deleteComingSoonTooltip = COMING_SOON_TOOLTIP
}
