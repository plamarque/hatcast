import { Component, computed, inject, OnDestroy, OnInit, signal, ViewEncapsulation } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { onAuthStateChanged, type Auth } from 'firebase/auth'
import { MatButtonModule } from '@angular/material/button'
import { MatButtonToggleModule } from '@angular/material/button-toggle'
import { MatDialog } from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatListModule } from '@angular/material/list'
import { MatMenuModule } from '@angular/material/menu'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'

import {
  effectiveMemberGender,
  MEMBER_GENDER_FIELD_LABEL,
  type MemberGender,
} from '../../../core/account/member-gender'
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
    MatButtonToggleModule,
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
  protected readonly gender = signal<MemberGender>('non_specified')
  protected readonly genderFieldLabel = MEMBER_GENDER_FIELD_LABEL
  protected readonly preferencesLoading = signal(true)
  protected readonly saving = signal(false)
  protected readonly loadFailed = signal(false)
  protected readonly hasPasswordProvider = signal(false)

  private initialPseudo = ''
  private initialGender: MemberGender = 'non_specified'
  private authStateUnsubscribe: (() => void) | null = null

  protected readonly canSaveProfile = computed(() => {
    const trimmed = this.pseudo().trim()
    const pseudoDirty = trimmed !== this.initialPseudo
    const genderDirty = this.gender() !== this.initialGender
    return (
      (pseudoDirty || genderDirty) &&
      trimmed.length > 0 &&
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

  protected onGenderInput(value: MemberGender): void {
    const resolved = effectiveMemberGender(value)
    this.gender.set(resolved)
    this.memberDisplayName.setGenderPreview(resolved)
  }

  protected async saveProfile(): Promise<void> {
    const trimmed = this.pseudo().trim()
    if (!trimmed) {
      this.pseudoError.set(true)
      return
    }

    const pseudoDirty = trimmed !== this.initialPseudo
    const genderDirty = this.gender() !== this.initialGender
    if (!pseudoDirty && !genderDirty) {
      return
    }

    const body: { memberDisplayName?: string; gender?: MemberGender } = {}
    if (pseudoDirty) {
      body.memberDisplayName = trimmed
    }
    if (genderDirty) {
      body.gender = this.gender()
    }

    this.saving.set(true)
    try {
      const result = await this.mePreferencesApi.patchPreferences(body)
      if (!result.ok || !result.data) {
        this.pseudo.set(this.initialPseudo)
        this.gender.set(this.initialGender)
        this.memberDisplayName.setGenderPreview(null)
        this.snack.open('Enregistrement impossible', 'OK', { duration: 5000 })
        return
      }

      this.initialPseudo = result.data.memberDisplayName
      this.pseudo.set(result.data.memberDisplayName)
      this.initialGender = effectiveMemberGender(result.data.gender)
      this.gender.set(this.initialGender)
      this.memberDisplayName.setFromSave(result.data.memberDisplayName, this.initialGender)

      if (pseudoDirty) {
        for (const troupe of this.troupeContext.activeTroupes()) {
          this.troupeContext.patchMembershipDisplayName(
            troupe.id,
            result.data.memberDisplayName,
          )
        }
      }

      this.snack.open('Profil enregistré', 'OK', { duration: 3000 })
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
      const result = await this.mePreferencesApi.getPreferences()
      if (!result.ok || !result.data) {
        this.loadFailed.set(true)
        this.snack.open('Impossible de charger vos préférences.', 'OK', { duration: 5000 })
        return
      }

      this.initialPseudo = result.data.memberDisplayName
      this.pseudo.set(this.initialPseudo)
      const resolvedGender = effectiveMemberGender(result.data.gender)
      this.initialGender = resolvedGender
      this.gender.set(resolvedGender)
      this.memberDisplayName.setFromSave(result.data.memberDisplayName, resolvedGender)
    } finally {
      this.preferencesLoading.set(false)
    }
  }
}
