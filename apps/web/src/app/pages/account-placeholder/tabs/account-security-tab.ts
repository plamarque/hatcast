import { Component, inject, OnInit, signal, ViewEncapsulation } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { MatListModule } from '@angular/material/list'
import { MatSnackBar } from '@angular/material/snack-bar'

import { hasPasswordProvider } from '../../../core/auth/firebase-auth-providers'
import { FirebaseAuthService } from '../../../core/auth/firebase-auth.service'
import { AccountPageContext } from '../account-page-context'
import {
  AccountChangeEmailDialog,
  type AccountChangeEmailDialogData,
} from '../dialogs/account-change-email-dialog'
import {
  AccountChangePasswordDialog,
  type AccountChangePasswordDialogData,
} from '../dialogs/account-change-password-dialog'
import {
  AccountDeleteDialog,
  type AccountDeleteDialogData,
} from '../dialogs/account-delete-dialog'

@Component({
  selector: 'app-account-security-tab',
  imports: [MatListModule],
  templateUrl: './account-security-tab.html',
  styleUrl: '../account-placeholder.scss',
  encapsulation: ViewEncapsulation.None,
})
export class AccountSecurityTab implements OnInit {
  protected readonly ctx = inject(AccountPageContext)
  private readonly dialog = inject(MatDialog)
  private readonly firebaseAuth = inject(FirebaseAuthService)
  private readonly snack = inject(MatSnackBar)

  protected readonly hasPasswordProvider = signal(false)

  ngOnInit(): void {
    const auth = this.firebaseAuth.getAuthOrNull()
    if (auth?.currentUser) {
      this.hasPasswordProvider.set(hasPasswordProvider(auth))
    }
  }

  protected passwordRowLabel(): string {
    return this.hasPasswordProvider() ? 'Changer le mot de passe' : 'Définir un mot de passe'
  }

  protected openChangeEmailDialog(): void {
    const user = this.ctx.user()
    const email = user?.email?.trim()
    if (!email) {
      this.snack.open('Adresse e-mail non disponible. Veuillez vous reconnecter.', 'OK', {
        duration: 8000,
      })
      return
    }

    this.dialog.open(AccountChangeEmailDialog, {
      width: 'min(100vw - 2rem, 28rem)',
      panelClass: 'account-security-dialog',
      data: {
        currentEmail: email,
        hasGoogleAccount: user?.hasGoogleAccount === true,
      } satisfies AccountChangeEmailDialogData,
    })
  }

  protected openChangePasswordDialog(): void {
    const user = this.ctx.user()
    const email = user?.email?.trim()
    if (!email) {
      this.snack.open('Adresse e-mail non disponible. Veuillez vous reconnecter.', 'OK', {
        duration: 8000,
      })
      return
    }

    this.dialog.open(AccountChangePasswordDialog, {
      width: 'min(100vw - 2rem, 28rem)',
      panelClass: 'account-security-dialog',
      data: {
        hasPasswordProvider: this.hasPasswordProvider(),
        accountEmail: email,
      } satisfies AccountChangePasswordDialogData,
    })
  }

  protected openDeleteAccountDialog(): void {
    const user = this.ctx.user()
    const email = user?.email?.trim()
    if (!email) {
      this.snack.open('Adresse e-mail non disponible. Veuillez vous reconnecter.', 'OK', {
        duration: 8000,
      })
      return
    }

    this.dialog.open(AccountDeleteDialog, {
      width: 'min(100vw - 2rem, 32rem)',
      maxWidth: '100vw',
      data: {
        accountEmail: email,
        hasGoogleAccount: user?.hasGoogleAccount ?? false,
      } satisfies AccountDeleteDialogData,
    })
  }
}
