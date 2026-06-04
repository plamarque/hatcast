import { Component, computed, DestroyRef, effect, inject, input, OnInit, signal } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { MatButtonModule } from '@angular/material/button'
import { MatMenuModule } from '@angular/material/menu'
import { NavigationEnd, Router } from '@angular/router'
import { filter } from 'rxjs/operators'

import { MemberDisplayNameService } from '../../core/account/member-display-name.service'
import { AuthApiService, type UserSummary } from '../../core/auth/auth-api.service'
import { UserAccountMenuItemsComponent } from '../user-account-menu/user-account-menu-items'
import { UserAvatarComponent } from '../user-avatar/user-avatar'
import {
  shouldShowAccountChrome,
  shouldShowAccountMenuLogout,
} from './member-account-menu-visibility'

export type MemberAccountMenuTriggerVariant = 'rail-footer' | 'shell-mobile-icon'

@Component({
  selector: 'app-member-account-menu-trigger',
  imports: [
    MatButtonModule,
    MatMenuModule,
    UserAccountMenuItemsComponent,
    UserAvatarComponent,
  ],
  templateUrl: './member-account-menu-trigger.html',
  styleUrl: './member-account-menu-trigger.scss',
})
export class MemberAccountMenuTrigger implements OnInit {
  readonly variant = input<MemberAccountMenuTriggerVariant>('rail-footer')
  readonly showLogout = input<boolean | null>(null)

  protected readonly auth = inject(AuthApiService)
  protected readonly sessionUser = computed(() => readAuthSessionUser(this.auth))
  private readonly router = inject(Router)
  private readonly destroyRef = inject(DestroyRef)
  private readonly memberDisplayName = inject(MemberDisplayNameService)

  private readonly currentUrl = signal(this.router.url)

  protected readonly visible = computed(
    () => !!this.sessionUser() && shouldShowAccountChrome(this.currentUrl()),
  )

  protected readonly effectiveShowLogout = computed(() => {
    const override = this.showLogout()
    if (override !== null) {
      return override
    }
    return shouldShowAccountMenuLogout(this.currentUrl())
  })

  protected readonly railLabel = computed(() =>
    this.memberDisplayName.railLabel(this.sessionUser()),
  )

  protected readonly accountAriaLabel = computed(
    () => `Menu compte : ${this.railLabel()}`,
  )

  constructor() {
    effect(() => {
      const user = this.sessionUser()
      this.memberDisplayName.syncSessionUser(user?.slug ?? null)
      if (user) {
        void this.memberDisplayName.loadFromApi()
      }
    })
  }

  ngOnInit(): void {
    this.syncCurrentUrl()

    const events = this.router.events
    if (events) {
      events
        .pipe(
          filter((event): event is NavigationEnd => event instanceof NavigationEnd),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe((event) => {
          this.currentUrl.set(event.urlAfterRedirects)
        })
    }

    void this.auth.ensureHatcastSession()
  }

  private syncCurrentUrl(): void {
    this.currentUrl.set(this.router.url)
  }
}

function readAuthSessionUser(auth: AuthApiService): UserSummary | null {
  const sessionUser = auth.sessionUser
  return typeof sessionUser === 'function' ? sessionUser() : null
}
