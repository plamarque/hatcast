import { Component, inject, OnInit, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'
import { Router, RouterLink } from '@angular/router'

import { AuthApiService } from '../../core/auth/auth-api.service'
import { TroupeApiService, type TroupeListItem } from '../../core/troupes/troupe-api.service'
import { TroupeContextService } from '../../core/troupes/troupe-context.service'

/** Placeholder story 1.6 — paramètres de compte (email, mot de passe connecté). Story 2.5 — pseudo par troupe. */
@Component({
  selector: 'app-account-placeholder',
  imports: [
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    RouterLink,
  ],
  templateUrl: './account-placeholder.html',
  styleUrl: './account-placeholder.scss',
})
export class AccountPlaceholder implements OnInit {
  private readonly auth = inject(AuthApiService)
  private readonly troupeApi = inject(TroupeApiService)
  private readonly troupeContext = inject(TroupeContextService)
  private readonly router = inject(Router)
  private readonly snack = inject(MatSnackBar)

  protected readonly loading = signal(true)
  protected readonly loadError = signal(false)
  protected readonly troupes = signal<TroupeListItem[]>([])
  protected readonly pseudoByTroupeId = signal<Record<string, string>>({})
  protected readonly savingTroupeId = signal<string | null>(null)
  protected readonly validationErrorByTroupeId = signal<Record<string, boolean>>({})

  async ngOnInit(): Promise<void> {
    const session = await this.auth.ensureHatcastSession()
    if (!session.ok || !session.data) {
      await this.router.navigate(['/connexion'], { replaceUrl: true })
      return
    }

    const loaded = await this.troupeContext.load()
    this.loading.set(false)
    if (!loaded) {
      this.loadError.set(true)
      return
    }

    const active = this.troupeContext.activeTroupes()
    this.troupes.set(active)
    this.pseudoByTroupeId.set(
      Object.fromEntries(active.map((troupe) => [troupe.id, troupe.membership.displayName])),
    )
  }

  protected onPseudoInput(troupeId: string, value: string): void {
    this.pseudoByTroupeId.update((current) => ({ ...current, [troupeId]: value }))
    if (value.trim()) {
      this.validationErrorByTroupeId.update((current) => {
        const next = { ...current }
        delete next[troupeId]
        return next
      })
    }
  }

  protected async savePseudo(troupe: TroupeListItem): Promise<void> {
    const next = this.pseudoByTroupeId()[troupe.id]?.trim() ?? ''
    if (!next) {
      this.validationErrorByTroupeId.update((current) => ({ ...current, [troupe.id]: true }))
      return
    }
    if (next === troupe.membership.displayName) {
      return
    }

    this.savingTroupeId.set(troupe.id)
    try {
      const result = await this.troupeApi.updateMyMembership(troupe.id, { displayName: next })
      if (!result.ok || !result.data) {
        this.snack.open('Enregistrement impossible', 'OK', { duration: 5000 })
        return
      }

      this.troupeContext.patchMembershipDisplayName(troupe.id, result.data.displayName)
      this.pseudoByTroupeId.update((current) => ({
        ...current,
        [troupe.id]: result.data!.displayName,
      }))
      this.troupes.set(this.troupeContext.activeTroupes())
      this.snack.open('Pseudo enregistré', 'OK', { duration: 3000 })
    } finally {
      this.savingTroupeId.set(null)
    }
  }
}
