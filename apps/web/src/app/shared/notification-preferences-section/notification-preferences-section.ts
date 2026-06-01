import { NgTemplateOutlet } from '@angular/common'
import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core'
import { MatDividerModule } from '@angular/material/divider'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'

import {
  MeNotificationPreferencesApiService,
  type NotificationPreferenceCategory,
  type NotificationPreferenceKey,
} from '../../core/notifications/me-notification-preferences-api.service'
import {
  PushNotificationsService,
  type PushUiState,
} from '../../core/push/push-notifications.service'

type NotificationChannel = 'push' | 'email'

const PATCH_DEBOUNCE_MS = 300

@Component({
  selector: 'app-notification-preferences-section',
  imports: [NgTemplateOutlet, MatDividerModule, MatProgressSpinnerModule, MatSlideToggleModule, MatSnackBarModule],
  template: `
    <div class="notification-preferences">
      @if (loading()) {
        <div class="notification-preferences__loading" role="status" aria-label="Chargement des préférences">
          <mat-spinner diameter="24" />
        </div>
      } @else if (loadFailed()) {
        <p class="notification-preferences__hint notification-preferences__hint--warn">
          Impossible de charger tes préférences de notification.
        </p>
      } @else {
        @if (pushDisabled()) {
          <p class="notification-preferences__hint" data-testid="notification-preferences-push-disabled-hint">
            Les préférences ci-dessous sont désactivées car les notifications push ne sont pas activées sur cet
            appareil.
          </p>
        }

        <section class="notification-preferences__group" aria-labelledby="notification-preferences-main-heading">
          <h3 id="notification-preferences-main-heading" class="notification-preferences__group-title">
            Notifications
          </h3>
          @for (category of notificationCategories(); track category.key) {
            <ng-container
              [ngTemplateOutlet]="categoryRow"
              [ngTemplateOutletContext]="{ category: category }"
            />
          }
        </section>

        <mat-divider />

        <section class="notification-preferences__group" aria-labelledby="notification-preferences-reminders-heading">
          <h3 id="notification-preferences-reminders-heading" class="notification-preferences__group-title">
            Rappels automatiques
          </h3>
          @for (category of reminderCategories(); track category.key) {
            <ng-container
              [ngTemplateOutlet]="categoryRow"
              [ngTemplateOutletContext]="{ category: category }"
            />
          }
        </section>
      }
    </div>

    <ng-template #categoryRow let-category="category">
      <div class="notification-preferences__row">
        <p class="notification-preferences__label">{{ category.label }}</p>
        <div class="notification-preferences__toggles">
          <mat-slide-toggle
            [attr.data-testid]="testId(category.key, 'push')"
            [checked]="category.pushEnabled"
            [disabled]="pushDisabled() || isSaving(category.key, 'push')"
            [attr.aria-label]="ariaLabel(category, 'push')"
            (change)="onToggle(category, 'push', $event)"
          >
            Push
          </mat-slide-toggle>
          <mat-slide-toggle
            [attr.data-testid]="testId(category.key, 'email')"
            [checked]="category.emailEnabled"
            [disabled]="isSaving(category.key, 'email')"
            [attr.aria-label]="ariaLabel(category, 'email')"
            (change)="onToggle(category, 'email', $event)"
          >
            E-mail
          </mat-slide-toggle>
        </div>
      </div>
    </ng-template>
  `,
  styles: `
    .notification-preferences {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .notification-preferences__loading {
      min-height: 3rem;
      display: flex;
      align-items: center;
    }
    .notification-preferences__group {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .notification-preferences__group-title {
      margin: 0;
      font: var(--mat-sys-title-medium);
      color: var(--mat-sys-on-surface);
    }
    .notification-preferences__row {
      display: grid;
      gap: 0.75rem;
      padding: 0.5rem 0;
    }
    .notification-preferences__label {
      margin: 0;
      line-height: 1.45;
      color: color-mix(in srgb, var(--mat-sys-on-surface) 86%, transparent);
    }
    .notification-preferences__toggles {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem 1rem;
      align-items: center;
    }
    .notification-preferences__toggles mat-slide-toggle {
      min-height: 3rem;
      display: inline-flex;
      align-items: center;
    }
    .notification-preferences__hint {
      margin: 0;
      font-size: 0.85rem;
      line-height: 1.45;
      color: color-mix(in srgb, var(--mat-sys-on-surface) 75%, transparent);
    }
    .notification-preferences__hint--warn {
      color: var(--mat-sys-error);
    }
    @media (min-width: 560px) {
      .notification-preferences__row {
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: center;
      }
    }
  `,
})
export class NotificationPreferencesSection implements OnInit, OnDestroy {
  private readonly api = inject(MeNotificationPreferencesApiService)
  private readonly pushService = inject(PushNotificationsService)
  private readonly snack = inject(MatSnackBar)

  protected readonly loading = signal(true)
  protected readonly loadFailed = signal(false)
  protected readonly categories = signal<NotificationPreferenceCategory[]>([])
  protected readonly pushState = signal<PushUiState>('loading')
  private readonly saving = signal<Set<string>>(new Set())
  private readonly debounceTimers = new Map<string, ReturnType<typeof setTimeout>>()
  private readonly revertSnapshots = new Map<string, NotificationPreferenceCategory[]>()

  protected readonly pushDisabled = computed(() => this.pushState() !== 'enabled')
  protected readonly notificationCategories = computed(() =>
    this.categories().filter((category) => category.group === 'NOTIFICATIONS'),
  )
  protected readonly reminderCategories = computed(() =>
    this.categories().filter((category) => category.group === 'AUTOMATIC_REMINDERS'),
  )

  async ngOnInit(): Promise<void> {
    await this.load()
  }

  ngOnDestroy(): void {
    for (const timer of this.debounceTimers.values()) {
      window.clearTimeout(timer)
    }
    this.debounceTimers.clear()
    this.revertSnapshots.clear()
  }

  async updatePreference(
    key: NotificationPreferenceKey,
    channel: NotificationChannel,
    enabled: boolean,
  ): Promise<void> {
    const savingKey = this.savingKey(key, channel)
    this.markSaving(savingKey, true)
    const previous = this.categories()
    this.categories.set(this.applyLocalPreference(previous, key, channel, enabled))
    const result = await this.api.patchPreferences({
      preferences: { [key]: { [channel]: enabled } },
    })
    if (!result.ok || !result.data) {
      this.categories.set(previous)
      this.snack.open('Enregistrement des préférences impossible', 'OK', { duration: 5000 })
    } else {
      this.categories.set(result.data.categories)
    }
    this.markSaving(savingKey, false)
  }

  protected onToggle(
    category: NotificationPreferenceCategory,
    channel: NotificationChannel,
    change: MatSlideToggleChange,
  ): void {
    const savingKey = this.savingKey(category.key, channel)
    if (!this.revertSnapshots.has(savingKey)) {
      this.revertSnapshots.set(savingKey, this.categories())
    }
    this.categories.set(
      this.applyLocalPreference(this.categories(), category.key, channel, change.checked),
    )

    const existingTimer = this.debounceTimers.get(savingKey)
    if (existingTimer !== undefined) {
      window.clearTimeout(existingTimer)
    }

    this.debounceTimers.set(
      savingKey,
      window.setTimeout(() => {
        this.debounceTimers.delete(savingKey)
        const latest = this.categories().find((entry) => entry.key === category.key)
        if (!latest) {
          return
        }
        const enabled = channel === 'push' ? latest.pushEnabled : latest.emailEnabled
        void this.commitPreference(savingKey, category.key, channel, enabled)
      }, PATCH_DEBOUNCE_MS),
    )
  }

  protected isSaving(
    key: NotificationPreferenceKey,
    channel: NotificationChannel,
  ): boolean {
    return this.saving().has(this.savingKey(key, channel))
  }

  protected testId(
    key: NotificationPreferenceKey,
    channel: NotificationChannel,
  ): string {
    return `notification-pref-${key.toLowerCase().replaceAll('_', '-')}-${channel}`
  }

  protected ariaLabel(
    category: NotificationPreferenceCategory,
    channel: NotificationChannel,
  ): string {
    const channelLabel = channel === 'push' ? 'push' : 'e-mail'
    return `${category.label} — canal ${channelLabel}`
  }

  private async commitPreference(
    savingKey: string,
    key: NotificationPreferenceKey,
    channel: NotificationChannel,
    enabled: boolean,
  ): Promise<void> {
    const previous = this.revertSnapshots.get(savingKey) ?? this.categories()
    this.revertSnapshots.delete(savingKey)
    this.markSaving(savingKey, true)
    const result = await this.api.patchPreferences({
      preferences: { [key]: { [channel]: enabled } },
    })
    if (!result.ok || !result.data) {
      this.categories.set(previous)
      this.snack.open('Enregistrement des préférences impossible', 'OK', { duration: 5000 })
    } else {
      this.categories.set(result.data.categories)
    }
    this.markSaving(savingKey, false)
  }

  private async load(): Promise<void> {
    this.loading.set(true)
    this.loadFailed.set(false)
    try {
      const [preferencesResult, pushResult] = await Promise.all([
        this.api.getPreferences(),
        this.pushService.loadStatus(),
      ])
      this.pushState.set(pushResult.state)
      if (!preferencesResult.ok || !preferencesResult.data) {
        this.loadFailed.set(true)
        this.snack.open('Impossible de charger tes préférences de notification.', 'OK', { duration: 5000 })
        return
      }
      this.categories.set(preferencesResult.data.categories)
    } finally {
      this.loading.set(false)
    }
  }

  private applyLocalPreference(
    categories: NotificationPreferenceCategory[],
    key: NotificationPreferenceKey,
    channel: NotificationChannel,
    enabled: boolean,
  ): NotificationPreferenceCategory[] {
    return categories.map((category) =>
      category.key === key
        ? {
            ...category,
            pushEnabled: channel === 'push' ? enabled : category.pushEnabled,
            emailEnabled: channel === 'email' ? enabled : category.emailEnabled,
          }
        : category,
    )
  }

  private savingKey(
    key: NotificationPreferenceKey,
    channel: NotificationChannel,
  ): string {
    return `${key}:${channel}`
  }

  private markSaving(key: string, active: boolean): void {
    const next = new Set(this.saving())
    if (active) {
      next.add(key)
    } else {
      next.delete(key)
    }
    this.saving.set(next)
  }
}
