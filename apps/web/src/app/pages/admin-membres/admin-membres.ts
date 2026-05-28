import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'
import { ActivatedRoute, Router } from '@angular/router'
import { Subscription } from 'rxjs'
import { distinctUntilChanged, map } from 'rxjs/operators'

import { AuthApiService, type UserSummary } from '../../core/auth/auth-api.service'
import { rememberCurrentUrlForPostLogin } from '../../core/navigation/auth-redirect.helper'
import {
  saisonAdminParticipantsPath,
  troupeAdminMembresPath,
  troupesListPath,
} from '../../core/navigation/troupe-routes'
import {
  OrganizerApiService,
  type MySeasonPermissions,
} from '../../core/permissions/organizer-api.service'
import {
  SeasonApiService,
  type SeasonResponse,
} from '../../core/seasons/season-api.service'
import { TroupeSeasonResolverService } from '../../core/troupes/troupe-season-resolver.service'
import { TroupeContextService } from '../../core/troupes/troupe-context.service'
import { ContextBreadcrumb } from '../../shared/context-breadcrumb/context-breadcrumb'
import { MembresTab } from './membres-tab'

function pickProfileSeason(
  seasons: SeasonResponse[],
  preferSlug?: string,
): SeasonResponse | null {
  if (preferSlug) {
    const bySlug = seasons.find((s) => s.slug === preferSlug)
    if (bySlug) return bySlug
  }
  const active = seasons.find((s) => s.active && !s.archived)
  if (active) return active
  return seasons[0] ?? null
}

@Component({
  selector: 'app-admin-membres',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    ContextBreadcrumb,
    MembresTab,
  ],
  templateUrl: './admin-membres.html',
  styleUrl: './admin-membres.scss',
})
export class AdminMembres implements OnDestroy, OnInit {
  private readonly auth = inject(AuthApiService)
  private readonly troupeContext = inject(TroupeContextService)
  private readonly troupeSeasonResolver = inject(TroupeSeasonResolverService)
  private readonly organizerApi = inject(OrganizerApiService)
  private readonly seasonApi = inject(SeasonApiService)
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly snack = inject(MatSnackBar)
  private routeSubscription = Subscription.EMPTY
  private loadRequestId = 0

  protected readonly loading = signal(true)
  protected readonly profileSeason = signal<SeasonResponse | null>(null)
  protected readonly troupeId = signal<string | null>(null)
  protected readonly troupeName = signal<string | null>(null)
  protected readonly troupeSlug = signal<string | null>(null)
  protected readonly isTroupeAdmin = signal(false)
  protected readonly user = signal<UserSummary | null>(null)

  protected readonly profileSeasonId = computed(() => this.profileSeason()?.id ?? '')
  protected readonly profileSeasonSlug = computed(() => this.profileSeason()?.slug ?? '')
  protected readonly showBreadcrumb = computed(
    () =>
      !!this.troupeName()?.trim() &&
      !!this.troupeSlug()?.trim() &&
      !this.loading(),
  )

  async ngOnInit(): Promise<void> {
    const session = await this.auth.ensureHatcastSession()
    if (!session.ok) {
      rememberCurrentUrlForPostLogin(this.router)
      await this.router.navigate(['/connexion'], { replaceUrl: true })
      return
    }
    if (session.data?.user) {
      this.user.set(session.data.user)
    }

    this.routeSubscription = this.route.paramMap
      .pipe(
        map((p) => {
          const routePath = this.route.snapshot.routeConfig?.path ?? ''
          const isTroupesHubAdmin = routePath.startsWith('troupes/')
          const slugParam = p.get('slug') ?? ''
          return {
            troupeSlug: isTroupesHubAdmin ? slugParam : (p.get('troupeSlug') ?? ''),
            legacySeasonSlug: isTroupesHubAdmin ? '' : slugParam,
          }
        }),
        distinctUntilChanged(
          (a, b) =>
            a.troupeSlug === b.troupeSlug && a.legacySeasonSlug === b.legacySeasonSlug,
        ),
      )
      .subscribe((params) => {
        void this.loadPage(params)
      })
  }

  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe()
  }

  private async loadPage(routeParams: {
    troupeSlug: string
    legacySeasonSlug: string
  }): Promise<void> {
    const requestId = ++this.loadRequestId
    this.loading.set(true)
    this.profileSeason.set(null)
    this.troupeSlug.set(null)
    const { troupeSlug, legacySeasonSlug } = routeParams

    const loaded = await this.troupeContext.load()
    if (requestId !== this.loadRequestId) return

    if (!loaded) {
      this.loading.set(false)
      this.snack.open('Impossible de charger vos troupes.', 'OK', { duration: 6000 })
      await this.router.navigate(troupesListPath())
      return
    }

    let troupe = this.troupeContext.selectedTroupe()
    let legacySeason: SeasonResponse | null = null

    if (troupeSlug) {
      const match = this.troupeContext.activeTroupes().find((t) => t.slug === troupeSlug)
      if (!match) {
        this.loading.set(false)
        this.snack.open('Troupe introuvable.', 'OK', { duration: 6000 })
        await this.router.navigate(troupesListPath())
        return
      }
      this.troupeContext.selectTroupe(match.id)
      troupe = match
    } else if (legacySeasonSlug) {
      const resolved = await this.troupeSeasonResolver.resolveSeasonSlug(legacySeasonSlug)
      if (requestId !== this.loadRequestId) return
      if (resolved.kind === 'resolved') {
        this.troupeContext.selectTroupe(resolved.troupe.id)
        troupe = this.troupeContext.selectedTroupe() ?? resolved.troupe
        legacySeason = resolved.season
      } else if (resolved.kind === 'ambiguous') {
        this.loading.set(false)
        this.snack.open(
          'Cette saison existe dans plusieurs troupes. Choisissez d’abord la troupe depuis la liste des saisons.',
          'OK',
          { duration: 8000 },
        )
        await this.router.navigate(troupesListPath())
        return
      } else {
        this.loading.set(false)
        this.snack.open('Saison introuvable.', 'OK', { duration: 6000 })
        await this.router.navigate(troupesListPath())
        return
      }
    }

    if (!troupe) {
      this.loading.set(false)
      await this.router.navigate(troupesListPath())
      return
    }

    const isTroupeAdmin = troupe.membership.baselineRole === 'TROUPE_ADMIN'
    this.troupeId.set(troupe.id)
    this.troupeName.set(troupe.name)
    this.troupeSlug.set(troupe.slug)
    this.isTroupeAdmin.set(isTroupeAdmin)

    const sr = await this.seasonApi.listSeasons(troupe.id, 0, 100)
    if (requestId !== this.loadRequestId) return
    const troupeSeasons = sr.ok && sr.data ? sr.data.content : []
    this.profileSeason.set(pickProfileSeason(troupeSeasons, legacySeason?.slug))

    let seasonOrganizerPerms = false
    if (legacySeason) {
      const pr = await this.organizerApi.mySeasonPermissions(legacySeason.id)
      if (requestId !== this.loadRequestId) return
      seasonOrganizerPerms = pr.ok && pr.data?.canManageSeasonOrganizers === true
    }

    this.loading.set(false)

    if (legacySeasonSlug) {
      if (isTroupeAdmin) {
        await this.router.navigate(troupeAdminMembresPath(troupe.slug), { replaceUrl: true })
        return
      }
      if (seasonOrganizerPerms) {
        await this.router.navigate(saisonAdminParticipantsPath(legacySeasonSlug), {
          replaceUrl: true,
        })
        return
      }
      this.snack.open('Accès non autorisé', 'OK', { duration: 5000 })
      await this.router.navigate(troupesListPath())
      return
    }

    if (!isTroupeAdmin) {
      this.snack.open('Accès non autorisé', 'OK', { duration: 5000 })
      await this.router.navigate(troupesListPath())
    }
  }
}
