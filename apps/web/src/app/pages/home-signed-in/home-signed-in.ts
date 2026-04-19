import { Component, inject, OnInit, signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Router, RouterLink } from '@angular/router'

import { AuthApiService, type UserSummary } from '../../core/auth/auth-api.service'
import { userMessageForLogoutFailure } from '../../core/auth/auth-user-message'

@Component({
  selector: 'app-home-signed-in',
  imports: [MatButtonModule, MatCardModule, MatIconModule, MatMenuModule, RouterLink],
  templateUrl: './home-signed-in.html',
  styleUrl: './home-signed-in.scss',
})
export class HomeSignedIn implements OnInit {
  private readonly auth = inject(AuthApiService)
  private readonly router = inject(Router)
  private readonly snack = inject(MatSnackBar)

  protected readonly user = signal<UserSummary | null>(null)
  /** Évite d’afficher « connecté » avant que GET /v1/auth/me ait validé la session (cookie / serveur). */
  protected readonly loadingSession = signal(true)

  async ngOnInit(): Promise<void> {
    const r = await this.auth.ensureHatcastSession()
    if (!r.ok || !r.data) {
      this.snack.open(
        'Votre session a expiré ou vous n’êtes pas connecté.',
        'OK',
        { duration: 6000 },
      )
      await this.router.navigate(['/connexion'], { replaceUrl: true })
      return
    }
    this.user.set(r.data.user)
    this.loadingSession.set(false)
  }

  protected async logout(): Promise<void> {
    const ok = await this.auth.logout()
    if (ok) {
      this.snack.open('Vous êtes déconnecté.', 'OK', { duration: 4000 })
      await this.router.navigate(['/connexion'])
    } else {
      this.snack.open(userMessageForLogoutFailure(), 'OK', { duration: 6000 })
    }
  }
}
