import { NgTemplateOutlet } from '@angular/common'
import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'

import {
  MEMBER_HIDDEN_NOTIFICATION_PREFERENCE_KEYS,
  notificationPreferenceUiCopy,
} from '../../core/notifications/notification-preference-ui-copy'
import {
  MeNotificationPreferencesApiService,
  type NotificationPreferenceCategory,
  type NotificationPreferenceKey,
} from '../../core/notifications/me-notification-preferences-api.service'
import { PushNotificationsService } from '../../core/push/push-notifications.service'

type NotificationChannel = 'push' | 'email'

const PATCH_DEBOUNCE_MS = 300

@Component({
  selector: 'app-notification-preferences-section',
  imports: [NgTemplateOutlet, MatProgressSpinnerModule, MatSlideToggleModule, MatSnackBarModule],
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
        <section class="notification-preferences__group" aria-labelledby="notification-preferences-main-heading">
          <header class="notification-preferences__group-header">
            <h3 id="notification-preferences-main-heading" class="notification-preferences__group-title">
              Messages pour moi
            </h3>
            <p class="notification-preferences__intro">
              Tu reçois ces messages par défaut. Désactive ce que tu ne veux plus.
            </p>
          </header>
          <div class="notification-preferences__group-body">
            <ng-container
              [ngTemplateOutlet]="sectionGrid"
              [ngTemplateOutletContext]="{ categories: notificationCategories() }"
            />
          </div>
        </section>

        <section class="notification-preferences__group" aria-labelledby="notification-preferences-reminders-heading">
          <header class="notification-preferences__group-header">
            <h3 id="notification-preferences-reminders-heading" class="notification-preferences__group-title">
              Rappels automatiques
            </h3>
            <p class="notification-preferences__intro">
              Rappels liés au calendrier, pas aux actions des orgas.
            </p>
          </header>
          <div class="notification-preferences__group-body">
            <ng-container
              [ngTemplateOutlet]="sectionGrid"
              [ngTemplateOutletContext]="{ categories: reminderCategories() }"
            />
          </div>
        </section>
      }
    </div>

    <ng-template #sectionGrid let-categories="categories">
      <div class="notification-preferences__grid">
        <div class="notification-preferences__column-headers" aria-hidden="true">
          <span class="notification-preferences__column-headers-spacer"></span>
          <span class="notification-preferences__column-header">Cet appareil</span>
          <span class="notification-preferences__column-header">E-mail</span>
        </div>
        @for (category of categories; track category.key) {
          <ng-container
            [ngTemplateOutlet]="categoryRow"
            [ngTemplateOutletContext]="{ category: category }"
          />
        }
      </div>
    </ng-template>

    <ng-template #categoryRow let-category="category">
      <div class="notification-preferences__row">
        <div class="notification-preferences__content">
          <p class="notification-preferences__title">{{ copyFor(category).title }}</p>
          @if (copyFor(category).description) {
            <p class="notification-preferences__description">{{ copyFor(category).description }}</p>
          }
        </div>
        <div class="notification-preferences__toggles">
          <div class="notification-preferences__channel">
            <span class="notification-preferences__channel-label">Cet appareil</span>
            <mat-slide-toggle
              [attr.data-testid]="testId(category.key, 'push')"
              [checked]="category.pushEnabled"
              [disabled]="pushDisabled() || isSaving(category.key, 'push')"
              [aria-label]="ariaLabel(category, 'push')"
              (change)="onToggle(category, 'push', $event)"
            />
          </div>
          <div class="notification-preferences__channel">
            <span class="notification-preferences__channel-label">E-mail</span>
            <mat-slide-toggle
              [attr.data-testid]="testId(category.key, 'email')"
              [checked]="category.emailEnabled"
              [disabled]="isSaving(category.key, 'email')"
              [aria-label]="ariaLabel(category, 'email')"
              (change)="onToggle(category, 'email', $event)"
            />
          </div>
        </div>
      </div>
    </ng-template>
  `,
  styles: `
    .notification-preferences {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .notification-preferences__loading {
      min-height: 3rem;
      display: flex;
      align-items: center;
    }
    .notification-preferences__group {
      display: flex;
      flex-direction: column;
      border-radius: 0.75rem;
      overflow: hidden;
      border: 1px solid color-mix(in srgb, var(--mat-sys-outline-variant) 45%, transparent);
      background: color-mix(in srgb, var(--mat-sys-surface-container) 40%, transparent);
    }
    .notification-preferences__group-header {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      padding: 0.875rem 1rem 0.75rem;
      background: color-mix(in srgb, var(--mat-sys-surface-container-high) 55%, transparent);
      border-bottom: 1px solid color-mix(in srgb, var(--mat-sys-outline-variant) 50%, transparent);
    }
    .notification-preferences__group-title {
      margin: 0;
      font: var(--mat-sys-headline-small);
      letter-spacing: 0.01em;
      color: var(--mat-sys-on-surface);
    }
    .notification-preferences__intro {
      margin: 0;
      font: var(--mat-sys-body-medium);
      line-height: 1.4;
      color: color-mix(in srgb, var(--mat-sys-on-surface) 68%, transparent);
    }
    .notification-preferences__group-body {
      padding: 0 1rem;
    }
    .notification-preferences__grid {
      display: flex;
      flex-direction: column;
    }
    .notification-preferences__column-headers {
      display: none;
    }
    .notification-preferences__row {
      display: flex;
      flex-direction: column;
      gap: 0.625rem;
      padding: 0.75rem 0;
      border-bottom: 1px solid color-mix(in srgb, var(--mat-sys-outline-variant) 55%, transparent);
    }
    .notification-preferences__row:last-child {
      border-bottom: none;
    }
    .notification-preferences__content {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }
    .notification-preferences__title {
      margin: 0;
      font: var(--mat-sys-body-large);
      font-weight: 600;
      line-height: 1.35;
      color: color-mix(in srgb, var(--mat-sys-on-surface) 92%, transparent);
    }
    .notification-preferences__description {
      margin: 0;
      font: var(--mat-sys-body-medium);
      line-height: 1.4;
      color: color-mix(in srgb, var(--mat-sys-on-surface) 72%, transparent);
    }
    .notification-preferences__toggles {
      display: flex;
      gap: 1.25rem;
      align-items: flex-end;
    }
    .notification-preferences__channel {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      min-width: 4.75rem;
      max-width: 5.5rem;
    }
    .notification-preferences__channel-label {
      font-size: 0.7rem;
      font-weight: 500;
      line-height: 1.2;
      text-align: center;
      color: color-mix(in srgb, var(--mat-sys-on-surface) 70%, transparent);
    }
    .notification-preferences__channel mat-slide-toggle {
      min-height: 3rem;
      min-width: 3rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
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
      .notification-preferences__group-header {
        padding: 1rem 1.25rem 0.875rem;
      }
      .notification-preferences__group-body {
        padding: 0 1.25rem 0.25rem;
      }
      .notification-preferences__column-headers {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 5.5rem 4.5rem;
        gap: 0.75rem;
        align-items: end;
        padding: 0.25rem 0 0;
      }
      .notification-preferences__column-header {
        font-size: 0.7rem;
        font-weight: 500;
        line-height: 1.2;
        text-align: center;
        color: color-mix(in srgb, var(--mat-sys-on-surface) 70%, transparent);
      }
      .notification-preferences__channel-label {
        display: none;
      }
      .notification-preferences__row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 5.5rem 4.5rem;
        gap: 0.75rem;
        align-items: center;
      }
      .notification-preferences__toggles {
        display: contents;
      }
      .notification-preferences__channel {
        display: contents;
      }
      .notification-preferences__channel mat-slide-toggle {
        justify-self: center;
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
  private readonly saving = signal<Set<string>>(new Set())
  private readonly debounceTimers = new Map<string, ReturnType<typeof setTimeout>>()
  private readonly revertSnapshots = new Map<string, NotificationPreferenceCategory[]>()

  protected readonly pushDisabled = computed(() => this.pushService.uiState() !== 'enabled')
  private readonly visibleCategories = computed(() =>
    this.categories().filter((category) => !MEMBER_HIDDEN_NOTIFICATION_PREFERENCE_KEYS.has(category.key)),
  )
  protected readonly notificationCategories = computed(() =>
    this.visibleCategories().filter((category) => category.group === 'NOTIFICATIONS'),
  )
  protected readonly reminderCategories = computed(() =>
    this.visibleCategories().filter((category) => category.group === 'AUTOMATIC_REMINDERS'),
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

  protected copyFor(category: NotificationPreferenceCategory) {
    return notificationPreferenceUiCopy(category.key, category.label)
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
    const channelLabel = channel === 'push' ? 'cet appareil' : 'e-mail'
    return `${this.copyFor(category).title} — ${channelLabel}`
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
      const [preferencesResult] = await Promise.all([
        this.api.getPreferences(),
        this.pushService.loadStatus(),
      ])
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
