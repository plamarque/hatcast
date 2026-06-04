import { Component, computed, inject, OnDestroy, OnInit, signal, ViewEncapsulation } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { onAuthStateChanged, type Auth } from 'firebase/auth'
import { MatButtonModule } from '@angular/material/button'
import { MatDialog } from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatListModule } from '@angular/material/list'
import { MatMenuModule } from '@angular/material/menu'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'

import { MemberDisplayNameService } from '../../../core/account/member-display-name.service'
import { MePreferencesApiService } from '../../../core/account/me-preferences-api.service'
import { hasPasswordProvider } from '../../../core/auth/firebase-auth-providers'
import { FirebaseAuthService } from '../../../core/auth/firebase-auth.service'
import { TroupeContextService } from '../../../core/troupes/troupe-context.service'
import { UserAvatarComponent } from '../../../shared/user-avatar/user-avatar'
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
  selector: 'app-account-profile-tab',
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    UserAvatarComponent,
  ],
  templateUrl: './account-profile-tab.html',
  styleUrl: '../account-placeholder.scss',
  encapsulation: ViewEncapsulation.None,
})
export class AccountProfileTab implements OnInit, OnDestroy {
  protected readonly ctx = inject(AccountPageContext)
  private readonly mePreferencesApi = inject(MePreferencesApiService)
  private readonly troupeContext = inject(TroupeContextService)
  private readonly memberDisplayName = inject(MemberDisplayNameService)
  private readonly snack = inject(MatSnackBar)
  private readonly dialog = inject(MatDialog)
  private readonly firebaseAuth = inject(FirebaseAuthService)

  protected readonly pseudo = signal('')
  protected readonly pseudoError = signal(false)
  protected readonly preferencesLoading = signal(true)
  protected readonly saving = signal(false)
  protected readonly loadFailed = signal(false)
  protected readonly hasPasswordProvider = signal(false)

  private initialPseudo = ''
  private authStateUnsubscribe: (() => void) | null = null

  protected readonly canSavePseudo = computed(() => {
    const trimmed = this.pseudo().trim()
    return (
      trimmed.length > 0 &&
      trimmed !== this.initialPseudo &&
      !this.saving() &&
      !this.preferencesLoading() &&
      !this.loadFailed()
    )
  })

  async ngOnInit(): Promise<void> {
    await this.loadPreferences()
    const auth = this.firebaseAuth.getAuthOrNull()
    if (!auth) {
      return
    }
    this.refreshPasswordProvider(auth)
    try {
      this.authStateUnsubscribe = onAuthStateChanged(auth, () => this.refreshPasswordProvider(auth))
    } catch {
      // Test doubles may not implement the modular Firebase Auth API.
    }
  }

  ngOnDestroy(): void {
    this.authStateUnsubscribe?.()
    this.authStateUnsubscribe = null
  }

  protected onPseudoInput(value: string): void {
    this.pseudo.set(value)
    if (value.trim()) {
      this.pseudoError.set(false)
    }
  }

  protected async savePseudo(): Promise<void> {
    const nextPseudo = this.pseudo().trim()
    if (!nextPseudo) {
      this.pseudoError.set(true)
      return
    }

    this.saving.set(true)
    try {
      const result = await this.mePreferencesApi.patchPreferences({
        memberDisplayName: nextPseudo,
      })
      if (!result.ok || !result.data) {
        this.snack.open('Enregistrement impossible', 'OK', { duration: 5000 })
        return
      }

      this.initialPseudo = result.data.memberDisplayName
      this.pseudo.set(result.data.memberDisplayName)
      this.memberDisplayName.setFromSave(result.data.memberDisplayName)

      for (const troupe of this.troupeContext.activeTroupes()) {
        this.troupeContext.patchMembershipDisplayName(
          troupe.id,
          result.data.memberDisplayName,
        )
      }

      this.snack.open('Pseudo enregistré', 'OK', { duration: 3000 })
    } finally {
      this.saving.set(false)
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

    const ref = this.dialog.open(AccountChangePasswordDialog, {
      width: 'min(100vw - 2rem, 28rem)',
      panelClass: 'account-security-dialog',
      data: {
        hasPasswordProvider: this.hasPasswordProvider(),
        accountEmail: email,
      } satisfies AccountChangePasswordDialogData,
    })
    ref.afterClosed().subscribe(() => {
      const authAfter = this.firebaseAuth.getAuthOrNull()
      if (authAfter) {
        this.refreshPasswordProvider(authAfter)
      }
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

  private refreshPasswordProvider(auth: Auth): void {
    this.hasPasswordProvider.set(hasPasswordProvider(auth))
  }

  private async loadPreferences(): Promise<void> {
    this.preferencesLoading.set(true)
    this.loadFailed.set(false)
    try {
      this.memberDisplayName.syncSessionUser(this.ctx.user()?.slug ?? null)
      const ok = await this.memberDisplayName.loadFromApi()
      if (!ok) {
        this.loadFailed.set(true)
        this.snack.open('Impossible de charger vos préférences.', 'OK', { duration: 5000 })
        return
      }
      this.initialPseudo = this.memberDisplayName.memberDisplayName()
      this.pseudo.set(this.initialPseudo)
    } finally {
      this.preferencesLoading.set(false)
    }
  }
}
