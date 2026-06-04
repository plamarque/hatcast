import { Component, computed, inject, OnInit, signal, ViewEncapsulation } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatMenuModule } from '@angular/material/menu'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'

import { MemberDisplayNameService } from '../../../core/account/member-display-name.service'
import { MePreferencesApiService } from '../../../core/account/me-preferences-api.service'
import { TroupeContextService } from '../../../core/troupes/troupe-context.service'
import { UserAvatarComponent } from '../../../shared/user-avatar/user-avatar'
import { AccountPageContext } from '../account-page-context'

@Component({
  selector: 'app-account-identity-tab',
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    UserAvatarComponent,
  ],
  templateUrl: './account-identity-tab.html',
  styleUrl: '../account-placeholder.scss',
  encapsulation: ViewEncapsulation.None,
})
export class AccountIdentityTab implements OnInit {
  protected readonly ctx = inject(AccountPageContext)
  private readonly mePreferencesApi = inject(MePreferencesApiService)
  private readonly troupeContext = inject(TroupeContextService)
  private readonly memberDisplayName = inject(MemberDisplayNameService)
  private readonly snack = inject(MatSnackBar)

  protected readonly pseudo = signal('')
  protected readonly pseudoError = signal(false)
  protected readonly preferencesLoading = signal(true)
  protected readonly saving = signal(false)
  protected readonly loadFailed = signal(false)

  private initialPseudo = ''

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
