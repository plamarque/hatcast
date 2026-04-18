import { Component, inject, OnInit, signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Router } from '@angular/router'

import { AuthApiService, type UserSummary } from '../../core/auth/auth-api.service'
import { userMessageForLogoutFailure } from '../../core/auth/auth-user-message'

@Component({
  selector: 'app-home-signed-in',
  imports: [MatButtonModule, MatCardModule],
  templateUrl: './home-signed-in.html',
  styleUrl: './home-signed-in.scss',
})
export class HomeSignedIn implements OnInit {
  private readonly auth = inject(AuthApiService)
  private readonly router = inject(Router)
  private readonly snack = inject(MatSnackBar)

  protected readonly user = signal<UserSummary | null>(null)

  async ngOnInit(): Promise<void> {
    const r = await this.auth.getMe()
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
