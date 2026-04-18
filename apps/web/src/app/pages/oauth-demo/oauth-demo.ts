import { AfterViewInit, Component, ElementRef, inject, signal, viewChild } from '@angular/core'
import { MatCardModule } from '@angular/material/card'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Router } from '@angular/router'

import { AuthApiService } from '../../core/auth/auth-api.service'
import { userMessageForGoogleSignInFailure } from '../../core/auth/auth-user-message'
import { environment } from '../../../environments/environment'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (cfg: {
            client_id: string
            callback: (resp: { credential: string }) => void
          }) => void
          renderButton: (
            el: HTMLElement,
            opts: { theme?: string; size?: string; type?: string },
          ) => void
        }
      }
    }
  }
}

@Component({
  selector: 'app-oauth-demo',
  imports: [MatCardModule],
  templateUrl: './oauth-demo.html',
  styleUrl: './oauth-demo.scss',
})
export class OauthDemo implements AfterViewInit {
  private readonly googleHost = viewChild<ElementRef<HTMLDivElement>>('googleButtonHost')
  private readonly auth = inject(AuthApiService)
  private readonly router = inject(Router)
  private readonly snack = inject(MatSnackBar)

  protected readonly isDev = !environment.production
  /** Journal technique réservé au dev local (pas affiché en production). */
  protected readonly devLog = signal<string | null>(null)

  ngAfterViewInit(): void {
    const clientId = environment.googleOAuthWebClientId
    if (!clientId) {
      this.snack.open(
        'Configurez googleOAuthWebClientId dans environment.development.ts (voir README).',
        'OK',
        { duration: 12_000 },
      )
      this.devLog.set('googleOAuthWebClientId manquant.')
      return
    }

    const tryInit = () => {
      const g = window.google?.accounts?.id
      const host = this.googleHost()?.nativeElement
      if (!g || !host) return
      g.initialize({
        client_id: clientId,
        callback: (resp) => void this.onGoogleCredential(resp.credential),
      })
      g.renderButton(host, { theme: 'outline', size: 'large', type: 'standard' })
    }

    const id = window.setInterval(() => {
      if (window.google?.accounts?.id && this.googleHost()?.nativeElement) {
        window.clearInterval(id)
        tryInit()
      }
    }, 100)
    window.setTimeout(() => {
      window.clearInterval(id)
      if (!window.google?.accounts?.id) {
        this.snack.open(
          'Le script Google Identity Services n’a pas pu être chargé (réseau ou bloqueur).',
          'OK',
          { duration: 8000 },
        )
      }
    }, 12_000)
  }

  private async onGoogleCredential(idToken: string): Promise<void> {
    this.devLog.set(null)
    const r = await this.auth.signInWithGoogleIdToken(idToken)
    if (r.ok) {
      this.snack.open('Connexion réussie.', 'OK', { duration: 3500 })
      await this.router.navigate(['/accueil'])
      return
    }
    const msg = userMessageForGoogleSignInFailure(r.status)
    this.snack.open(msg, 'OK', { duration: 8000 })
    if (this.isDev) {
      this.devLog.set(JSON.stringify({ status: r.status, hint: 'voir logs API pour le détail' }, null, 2))
    }
  }
}
