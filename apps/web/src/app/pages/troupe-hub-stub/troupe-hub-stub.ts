import { Component, computed, inject, OnInit, signal } from '@angular/core'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { map } from 'rxjs/operators'
import { toSignal } from '@angular/core/rxjs-interop'

import { AuthApiService } from '../../core/auth/auth-api.service'
import { rememberCurrentUrlForPostLogin } from '../../core/navigation/auth-redirect.helper'
import { troupeAdminMembresPath } from '../../core/navigation/troupe-routes'
import { TroupeContextService } from '../../core/troupes/troupe-context.service'
import {
  ScopeAdminMenu,
  type ScopeAdminMenuItem,
} from '../../shared/scope-admin-menu/scope-admin-menu'

/** Minimal hub placeholder until Story 17.4 — avoids 404 on breadcrumb troupe links. */
@Component({
  selector: 'app-troupe-hub-stub',
  imports: [MatProgressSpinnerModule, RouterLink, ScopeAdminMenu],
  templateUrl: './troupe-hub-stub.html',
  styleUrl: './troupe-hub-stub.scss',
})
export class TroupeHubStub implements OnInit {
  private readonly auth = inject(AuthApiService)
  private readonly troupeContext = inject(TroupeContextService)
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)

  protected readonly slug = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('slug') ?? '')),
    { initialValue: '' },
  )

  protected readonly loading = signal(true)
  protected readonly troupeName = signal<string | null>(null)
  protected readonly notFound = signal(false)
  protected readonly isTroupeAdmin = signal(false)

  protected readonly troupeAdminItems = computed<ScopeAdminMenuItem[]>(() => {
    if (!this.isTroupeAdmin()) {
      return []
    }
    const slug = this.slug()
    if (!slug) {
      return []
    }
    return [
      {
        label: 'Membres',
        icon: 'groups',
        routerLink: troupeAdminMembresPath(slug),
      },
    ]
  })

  async ngOnInit(): Promise<void> {
    const session = await this.auth.ensureHatcastSession()
    if (!session.ok || !session.data) {
      rememberCurrentUrlForPostLogin(this.router)
      await this.router.navigate(['/connexion'], { replaceUrl: true })
      return
    }

    const loaded = await this.troupeContext.load()
    this.loading.set(false)
    if (!loaded) {
      this.notFound.set(true)
      return
    }

    const slug = this.slug()
    const troupe = this.troupeContext
      .activeTroupes()
      .find((t) => t.slug === slug)
    if (!troupe) {
      this.notFound.set(true)
      return
    }
    this.troupeContext.selectTroupe(troupe.id)
    this.troupeName.set(troupe.name)
    this.isTroupeAdmin.set(troupe.membership.baselineRole === 'TROUPE_ADMIN')
  }
}
