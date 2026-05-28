import { Component, inject, OnInit, signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'
import { MatTooltipModule } from '@angular/material/tooltip'
import { Router, RouterLink } from '@angular/router'

import { AuthApiService } from '../../core/auth/auth-api.service'
import { rememberCurrentUrlForPostLogin } from '../../core/navigation/auth-redirect.helper'
import { TroupeApiService, type TroupeListItem } from '../../core/troupes/troupe-api.service'
import { TroupeCard } from '../../shared/troupe-card/troupe-card'
import { environment } from '../../../environments/environment'

@Component({
  selector: 'app-troupes-list',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    RouterLink,
    TroupeCard,
  ],
  templateUrl: './troupes-list.html',
  styleUrl: './troupes-list.scss',
})
export class TroupesList implements OnInit {
  private readonly auth = inject(AuthApiService)
  private readonly troupeApi = inject(TroupeApiService)
  private readonly router = inject(Router)
  private readonly snack = inject(MatSnackBar)

  protected readonly loadingSession = signal(true)
  protected readonly loadingList = signal(false)
  protected readonly loadError = signal(false)
  protected readonly joiningDemo = signal(false)
  protected readonly troupes = signal<TroupeListItem[]>([])

  async ngOnInit(): Promise<void> {
    const r = await this.auth.ensureHatcastSession()
    if (!r.ok || !r.data) {
      this.snack.open(
        'Votre session a expiré ou vous n’êtes pas connecté.',
        'OK',
        { duration: 6000 },
      )
      rememberCurrentUrlForPostLogin(this.router)
      await this.router.navigate(['/connexion'], { replaceUrl: true })
      return
    }
    this.loadingSession.set(false)
    await this.loadTroupes()
  }

  protected async loadTroupes(): Promise<void> {
    this.loadingList.set(true)
    this.loadError.set(false)
    const r = await this.troupeApi.listMyTroupes()
    this.loadingList.set(false)
    if (!r.ok || !r.data) {
      this.loadError.set(true)
      return
    }
    this.troupes.set(r.data)
  }

  protected async joinDemoTroupe(): Promise<void> {
    const demoId = environment.demoTroupeId
    if (!demoId) {
      this.snack.open('Troupe de démonstration indisponible.', 'OK', { duration: 6000 })
      return
    }
    this.joiningDemo.set(true)
    const jr = await this.troupeApi.joinTroupe(demoId)
    this.joiningDemo.set(false)
    if (!jr.ok) {
      this.snack.open('Impossible de rejoindre la troupe de démonstration.', 'OK', { duration: 6000 })
      return
    }
    await this.loadTroupes()
  }
}
