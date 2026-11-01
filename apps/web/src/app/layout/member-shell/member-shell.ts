import { Component, computed, DestroyRef, effect, inject, OnInit, signal } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { NavigationEnd, Router, RouterOutlet } from '@angular/router'
import { MatButtonModule } from '@angular/material/button'
import { filter } from 'rxjs/operators'

import { AuthApiService } from '../../core/auth/auth-api.service'
import { MemberInboxBadgeService } from '../../core/inbox/member-inbox-badge.service'
import {
  isPersistableMemberEntryPath,
  memberStatsSlugFromMemberEntryPath,
  rememberLastMemberEntryPath,
  seasonSlugFromMemberEntryPath,
} from '../../core/navigation/last-member-entry-path-storage'
import { MemberAccountMenuTrigger } from '../../shared/member-account-menu/member-account-menu-trigger'
import { MemberNav } from '../../shared/member-nav/member-nav'
import { pathFromUrl, shouldShowMemberNav } from './member-shell-nav-visibility'
import { isMemberMobileShellViewport, MEMBER_SHELL_MOBILE_MEDIA_QUERY } from './member-shell-viewport'

@Component({
  selector: 'app-member-shell',
  imports: [RouterOutlet, MemberNav, MemberAccountMenuTrigger, MatButtonModule],
  templateUrl: './member-shell.html',
  styleUrl: './member-shell.scss',
})
export class MemberShell implements OnInit {
  private readonly router = inject(Router)
  private readonly destroyRef = inject(DestroyRef)
  private readonly auth = inject(AuthApiService)
  private readonly inboxBadge = inject(MemberInboxBadgeService)

  protected readonly adventVisible = signal(false)
  protected readonly adventSparkle = signal(true)
  private adventIdentity: string | null = null
  private adventEpoch = 0
  private adventAccess: boolean | null = null

  constructor() {
    effect(() => {
      const identity = this.auth.sessionUser()?.id ?? null
      if (identity === this.adventIdentity) return
      if (this.adventIdentity) sessionStorage.removeItem("hatcast-advent-return")
      this.adventIdentity = identity
      this.adventAccess = null
      const epoch = ++this.adventEpoch
      this.adventVisible.set(false)
      if (identity) void this.checkAdvent(identity, epoch)
    })
  }

  private async checkAdvent(identity: string, epoch: number, allowAutoOpen = true, transitionOnly = false): Promise<void> {
    try {
      const response = await fetch('/v1/advent/entry', { credentials: 'include', cache: 'no-store', signal: AbortSignal.timeout(10_000) })
      if (epoch !== this.adventEpoch || identity !== this.auth.sessionUser()?.id) return
      if (!response.ok) {
        if (response.status === 404 || response.status === 403) this.adventAccess = false
        this.adventVisible.set(false)
        return
      }
      const state = await response.json() as { autoOpen: boolean }
      if (epoch !== this.adventEpoch || identity !== this.auth.sessionUser()?.id) return
      const openingTransition = this.adventAccess !== true
      this.adventAccess = true
      this.adventVisible.set(true)
      if (allowAutoOpen && (!transitionOnly || openingTransition) && state.autoOpen && shouldShowMemberNav(this.router.url)) await this.openAdvent()
    } catch { if (epoch === this.adventEpoch && identity === this.auth.sessionUser()?.id) this.adventVisible.set(false) }
  }

  protected async openAdvent(): Promise<void> {
    const path = this.router.url
    if (!shouldShowMemberNav(path)) return
    this.adventSparkle.set(false)
    sessionStorage.setItem('hatcast-advent-return', path)
    await this.router.navigateByUrl('/avent')
  }

  private readonly currentUrl = signal(this.router.url)

  protected readonly showNav = computed(() => shouldShowMemberNav(this.currentUrl()))

  protected readonly isMobileViewport = signal(isMemberMobileShellViewport())

  ngOnInit(): void {
    // Refresh server authorization even while the member stays on one page.
    const refresh = setInterval(() => {
      const identity = this.auth.sessionUser()?.id
      if (identity && shouldShowMemberNav(this.router.url)) void this.checkAdvent(identity, ++this.adventEpoch, true, true)
    }, 60_000)
    this.destroyRef.onDestroy(() => clearInterval(refresh))
    const initialPath = pathFromUrl(this.router.url)
    // Accueil todo owns a forced inbox fetch for list + badge (PERF-02).
    if (initialPath !== '/accueil') {
      void this.inboxBadge.refresh()
    }

    if (typeof globalThis.matchMedia === 'function') {
      const mq = globalThis.matchMedia(MEMBER_SHELL_MOBILE_MEDIA_QUERY)
      const onViewportChange = (): void => {
        this.isMobileViewport.set(mq.matches)
      }
      mq.addEventListener('change', onViewportChange)
      this.destroyRef.onDestroy(() => mq.removeEventListener('change', onViewportChange))
    }

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => {
        const returningFromAdvent = pathFromUrl(this.currentUrl()) === '/avent'
        this.currentUrl.set(event.urlAfterRedirects)
        if (returningFromAdvent) setTimeout(() => (document.getElementById(this.isMobileViewport() ? 'advent-entry-mobile' : 'advent-entry-desktop') ?? document.querySelector<HTMLElement>('.member-shell__content'))?.focus())
        const path = pathFromUrl(event.urlAfterRedirects)
        void this.persistMemberEntryPathIfNeeded(event.urlAfterRedirects, path)
        const identity = this.auth.sessionUser()?.id
        if (identity && shouldShowMemberNav(event.urlAfterRedirects)) void this.checkAdvent(identity, ++this.adventEpoch, !returningFromAdvent)
      })
  }

  private async persistMemberEntryPathIfNeeded(url: string, path: string): Promise<void> {
    if (!shouldShowMemberNav(url) || !isPersistableMemberEntryPath(path)) {
      return
    }
    // Season workspace: SeasonHome persists after a successful resolve only.
    if (seasonSlugFromMemberEntryPath(path)) {
      return
    }

    const membreSlug = memberStatsSlugFromMemberEntryPath(path)
    if (membreSlug) {
      const ownSlug = this.auth.sessionUser()?.slug?.trim()
      if (!ownSlug || membreSlug !== ownSlug) {
        return
      }
    }

    rememberLastMemberEntryPath(path)
  }
}
