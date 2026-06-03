import { Component, computed, inject, OnInit, signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatDialog } from '@angular/material/dialog'
import { MatIconModule } from '@angular/material/icon'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'
import { MatTooltipModule } from '@angular/material/tooltip'
import { Router, RouterLink } from '@angular/router'

import { AuthApiService } from '../../core/auth/auth-api.service'
import { DemoTroupeJoinService } from '../../core/troupes/demo-troupe-join.service'
import { rememberCurrentUrlForPostLogin } from '../../core/navigation/auth-redirect.helper'
import { troupeHubPath } from '../../core/navigation/troupe-routes'
import {
  TroupeApiService,
  type PublicTroupeDirectoryItem,
  type TroupeListItem,
} from '../../core/troupes/troupe-api.service'
import { TroupeCard } from '../../shared/troupe-card/troupe-card'
import { CreateTroupeDialog } from './create-troupe-dialog'

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
  private readonly demoJoin = inject(DemoTroupeJoinService)
  private readonly router = inject(Router)
  private readonly snack = inject(MatSnackBar)
  private readonly dialog = inject(MatDialog)

  protected readonly loadingSession = signal(true)
  protected readonly authenticated = signal(false)
  protected readonly loadingList = signal(false)
  protected readonly loadError = signal(false)
  protected readonly loadingDiscover = signal(true)
  protected readonly discoverError = signal(false)
  protected readonly joiningDemo = this.demoJoin.joining
  protected readonly troupes = signal<TroupeListItem[]>([])
  protected readonly discoverTroupes = signal<PublicTroupeDirectoryItem[]>([])

  protected readonly filteredDiscoverTroupes = computed(() => {
    const mySlugs = new Set(this.troupes().map((troupe) => troupe.slug))
    return this.discoverTroupes().filter((troupe) => !mySlugs.has(troupe.slug))
  })

  async ngOnInit(): Promise<void> {
    const session = await this.auth.ensureHatcastSession()
    this.loadingSession.set(false)
    if (session.ok && session.data) {
      this.authenticated.set(true)
      await Promise.all([this.loadTroupes(), this.loadDiscover(true)])
    } else {
      await this.loadDiscover(false)
    }
  }

  protected async loadTroupes(): Promise<void> {
    this.loadingList.set(true)
    this.loadError.set(false)
    const result = await this.troupeApi.listMyTroupes()
    this.loadingList.set(false)
    if (!result.ok || !result.data) {
      this.loadError.set(true)
      return
    }
    this.troupes.set(result.data)
  }

  protected async loadDiscover(authenticated: boolean): Promise<void> {
    this.loadingDiscover.set(true)
    this.discoverError.set(false)
    const result = authenticated
      ? await this.troupeApi.listDiscoverTroupes()
      : await this.troupeApi.listPublicTroupes()
    this.loadingDiscover.set(false)
    if (!result.ok || !result.data) {
      this.discoverError.set(true)
      return
    }
    this.discoverTroupes.set(result.data)
  }

  protected goToLogin(): void {
    rememberCurrentUrlForPostLogin(this.router)
    void this.router.navigate(['/connexion'])
  }

  protected openCreateTroupeDialog(): void {
    const ref = this.dialog.open<CreateTroupeDialog, undefined, string | undefined>(
      CreateTroupeDialog,
      { width: 'min(100vw - 2rem, 28rem)' },
    )
    ref.afterClosed().subscribe((slug) => {
      if (!slug) {
        return
      }
      this.snack.open('Troupe créée.', 'OK', { duration: 4000 })
      void this.router.navigate(troupeHubPath(slug))
    })
  }

  protected async joinDemoTroupe(): Promise<void> {
    await this.demoJoin.join()
  }
}
