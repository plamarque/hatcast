import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { NavigationEnd, Router, RouterOutlet } from '@angular/router'
import { filter } from 'rxjs/operators'

import { AuthApiService } from '../../core/auth/auth-api.service'
import { MemberInboxBadgeService } from '../../core/inbox/member-inbox-badge.service'
import {
  isPersistableMemberEntryPath,
  memberStatsSlugFromMemberEntryPath,
  rememberLastMemberEntryPath,
} from '../../core/navigation/last-member-entry-path-storage'
import { MemberNav } from '../../shared/member-nav/member-nav'
import { pathFromUrl, shouldShowMemberNav } from './member-shell-nav-visibility'

@Component({
  selector: 'app-member-shell',
  imports: [RouterOutlet, MemberNav],
  templateUrl: './member-shell.html',
  styleUrl: './member-shell.scss',
})
export class MemberShell implements OnInit {
  private readonly router = inject(Router)
  private readonly destroyRef = inject(DestroyRef)
  private readonly auth = inject(AuthApiService)
  private readonly inboxBadge = inject(MemberInboxBadgeService)

  private readonly currentUrl = signal(this.router.url)

  protected readonly showNav = computed(() => shouldShowMemberNav(this.currentUrl()))

  ngOnInit(): void {
    void this.inboxBadge.refresh()

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => {
        this.currentUrl.set(event.urlAfterRedirects)
        const path = pathFromUrl(event.urlAfterRedirects)
        if (path === '/accueil') {
          void this.inboxBadge.refresh()
        }
        void this.persistMemberEntryPathIfNeeded(event.urlAfterRedirects, path)
      })
  }

  private async persistMemberEntryPathIfNeeded(url: string, path: string): Promise<void> {
    if (!shouldShowMemberNav(url) || !isPersistableMemberEntryPath(path)) {
      return
    }

    const membreSlug = memberStatsSlugFromMemberEntryPath(path)
    if (membreSlug) {
      const session = await this.auth.ensureHatcastSession()
      const ownSlug = session.data?.user.slug?.trim()
      if (!ownSlug || membreSlug !== ownSlug) {
        return
      }
    }

    rememberLastMemberEntryPath(path)
  }
}
