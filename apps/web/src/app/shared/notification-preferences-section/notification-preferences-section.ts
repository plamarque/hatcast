import { NgTemplateOutlet } from '@angular/common'
import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'

import {
  MEMBER_HIDDEN_NOTIFICATION_PREFERENCE_KEYS,
  MEMBER_NOTIFICATION_CATEGORY_ORDER,
  MEMBER_REMINDER_CATEGORY_ORDER,
  notificationPreferenceUiCopy,
} from '../../core/notifications/notification-preference-ui-copy'
import {
  DISPATCHED_ORGA_NOTIFICATION_PREFERENCE_KEYS,
  ORGA_IMMEDIATE_SIGNAL_KEYS,
  ORGA_SCHEDULED_REMINDER_KEYS,
  organizerNotificationPreferenceUiCopy,
} from '../../core/notifications/notification-preference-orga-ui-copy'
import {
  MeNotificationPreferencesApiService,
  type NotificationPreferenceCategory,
  type NotificationPreferenceKey,
  type OrgaNotificationPreferenceKey,
} from '../../core/notifications/me-notification-preferences-api.service'
import { PushNotificationsService } from '../../core/push/push-notifications.service'

type NotificationChannel = 'push' | 'email'

const PATCH_DEBOUNCE_MS = 300

function sortCategoriesByKeyOrder(
  categories: NotificationPreferenceCategory[],
  order: readonly NotificationPreferenceKey[],
): NotificationPreferenceCategory[] {
  const rank = new Map(order.map((key, index) => [key, index]))
  return [...categories].sort((left, right) => {
    const leftRank = rank.get(left.key) ?? Number.MAX_SAFE_INTEGER
    const rightRank = rank.get(right.key) ?? Number.MAX_SAFE_INTEGER
    return leftRank - rightRank
  })
}

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
        <section class="notification-preferences__section" aria-labelledby="notification-preferences-main-heading">
          <header class="notification-preferences__section-header">
            <h2 id="notification-preferences-main-heading" class="notification-preferences__section-title">
              Messages pour moi
            </h2>
            <p class="notification-preferences__intro">
              Tu reçois ces messages par défaut. Désactive ce que tu ne veux plus.
            </p>
          </header>
          <div class="notification-preferences__card">
            <ng-container
              [ngTemplateOutlet]="sectionGrid"
              [ngTemplateOutletContext]="{ categories: notificationCategories() }"
            />
          </div>
        </section>

        <section class="notification-preferences__section" aria-labelledby="notification-preferences-reminders-heading">
          <header class="notification-preferences__section-header">
            <h2 id="notification-preferences-reminders-heading" class="notification-preferences__section-title">
              Rappels automatiques
            </h2>
            <p class="notification-preferences__intro">
              Rappels liés au calendrier, pas aux actions des orgas.
            </p>
          </header>
          <div class="notification-preferences__card">
            <ng-container
              [ngTemplateOutlet]="sectionGrid"
              [ngTemplateOutletContext]="{ categories: reminderCategories() }"
            />
          </div>
        </section>

        @if (showOrganizerSection()) {
          <section class="notification-preferences__section" aria-labelledby="notification-preferences-orga-heading">
            <header class="notification-preferences__section-header">
              <h2 id="notification-preferences-orga-heading" class="notification-preferences__section-title">
                Alertes organisateur
              </h2>
              <p class="notification-preferences__intro">
                Pour les spectacles où tu organises. Active seulement ce dont tu as besoin.
              </p>
            </header>
            <div class="notification-preferences__card">
              <ng-container
                [ngTemplateOutlet]="orgaSectionGrid"
                [ngTemplateOutletContext]="{ categories: organizerCategories() }"
              />
            </div>
          </section>
        }
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

    <ng-template #orgaSectionGrid let-categories="categories">
      <div class="notification-preferences__grid">
        <div class="notification-preferences__column-headers" aria-hidden="true">
          <span class="notification-preferences__column-headers-spacer"></span>
          <span class="notification-preferences__column-header">Cet appareil</span>
          <span class="notification-preferences__column-header">E-mail</span>
        </div>
        @for (category of categories; track category.key) {
          @if (category.groupSubtitle) {
            <p class="notification-preferences__group-subtitle">{{ category.groupSubtitle }}</p>
          }
          <ng-container
            [ngTemplateOutlet]="categoryRow"
            [ngTemplateOutletContext]="{ category: category, orga: true }"
          />
        }
      </div>
    </ng-template>

    <ng-template #categoryRow let-category="category" let-orga="orga">
      <div class="notification-preferences__row">
        <div class="notification-preferences__content">
          <p class="notification-preferences__title">{{ rowCopy(category, orga).title }}</p>
          @if (rowCopy(category, orga).description) {
            <p class="notification-preferences__description">{{ rowCopy(category, orga).description }}</p>
          }
        </div>
        <mat-slide-toggle
          class="notification-preferences__toggle"
          [attr.data-testid]="testId(category.key, 'push')"
          [checked]="category.pushEnabled"
          [disabled]="pushDisabled() || isSaving(category.key, 'push')"
          [aria-label]="ariaLabel(category, 'push', orga)"
          (change)="onToggle(category, 'push', $event)"
        />
        <mat-slide-toggle
          class="notification-preferences__toggle"
          [attr.data-testid]="testId(category.key, 'email')"
          [checked]="category.emailEnabled"
          [disabled]="isSaving(category.key, 'email')"
          [aria-label]="ariaLabel(category, 'email', orga)"
          (change)="onToggle(category, 'email', $event)"
        />
      </div>
    </ng-template>
  `,
  styles: `
    .notification-preferences {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .notification-preferences__loading {
      min-height: 3rem;
      display: flex;
      align-items: center;
    }
    .notification-preferences__section {
      display: flex;
      flex-direction: column;
      gap: 0.625rem;
    }
    .notification-preferences__section-header {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .notification-preferences__section-title {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
      letter-spacing: -0.01em;
      line-height: 1.3;
      color: var(--mat-sys-on-surface);
    }
    .notification-preferences__intro {
      margin: 0;
      font: var(--mat-sys-body-medium);
      line-height: 1.4;
      color: color-mix(in srgb, var(--mat-sys-on-surface) 68%, transparent);
    }
    .notification-preferences__card {
      border-radius: 1rem;
      background: var(--mat-sys-surface-container-high);
      overflow: hidden;
    }
    .notification-preferences__grid {
      display: flex;
      flex-direction: column;
    }
    .notification-preferences__column-headers {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 4.75rem 4.75rem;
      gap: 0.5rem;
      align-items: end;
      padding: 0.625rem 1rem 0.25rem;
    }
    .notification-preferences__column-header {
      font: var(--mat-sys-label-small);
      font-weight: 500;
      line-height: 1.2;
      text-align: center;
      color: color-mix(in srgb, var(--mat-sys-on-surface) 70%, transparent);
    }
    .notification-preferences__row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 4.75rem 4.75rem;
      gap: 0.5rem;
      align-items: center;
      padding: 0.75rem 1rem;
      position: relative;
    }
    .notification-preferences__row:not(:last-child)::after {
      content: '';
      position: absolute;
      left: 1rem;
      right: 1rem;
      bottom: 0;
      border-bottom: 1px solid color-mix(in srgb, var(--mat-sys-outline-variant) 40%, transparent);
    }
    .notification-preferences__content {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
      min-width: 0;
    }
    .notification-preferences__title {
      margin: 0;
      font: var(--mat-sys-title-small);
      font-weight: 600;
      line-height: 1.35;
      color: var(--mat-sys-on-surface);
    }
    .notification-preferences__description {
      margin: 0;
      font: var(--mat-sys-body-small);
      line-height: 1.4;
      color: color-mix(in srgb, var(--mat-sys-on-surface) 72%, transparent);
    }
    .notification-preferences__toggle {
      justify-self: center;
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
    .notification-preferences__group-subtitle {
      margin: 0;
      padding: 0.5rem 1rem 0.125rem;
      font: var(--mat-sys-label-medium);
      font-weight: 600;
      color: color-mix(in srgb, var(--mat-sys-on-surface) 62%, transparent);
    }
    @media (min-width: 560px) {
      .notification-preferences__column-headers {
        grid-template-columns: minmax(0, 1fr) 5.5rem 4.5rem;
        gap: 0.75rem;
        padding: 0.75rem 1rem 0.375rem;
      }
      .notification-preferences__row {
        grid-template-columns: minmax(0, 1fr) 5.5rem 4.5rem;
        gap: 0.75rem;
        padding: 0.875rem 1rem;
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
  protected readonly hasOrganizerScope = signal(false)
  private readonly saving = signal<Set<string>>(new Set())
  private readonly debounceTimers = new Map<string, ReturnType<typeof setTimeout>>()
  private readonly revertSnapshots = new Map<string, NotificationPreferenceCategory[]>()

  protected readonly pushDisabled = computed(() => this.pushService.uiState() !== 'enabled')
  private readonly visibleCategories = computed(() =>
    this.categories().filter((category) => !MEMBER_HIDDEN_NOTIFICATION_PREFERENCE_KEYS.has(category.key)),
  )
  protected readonly notificationCategories = computed(() =>
    sortCategoriesByKeyOrder(
      this.visibleCategories().filter((category) => category.group === 'NOTIFICATIONS'),
      MEMBER_NOTIFICATION_CATEGORY_ORDER,
    ),
  )
  protected readonly reminderCategories = computed(() =>
    sortCategoriesByKeyOrder(
      this.visibleCategories().filter((category) => category.group === 'AUTOMATIC_REMINDERS'),
      MEMBER_REMINDER_CATEGORY_ORDER,
    ),
  )
  protected readonly showOrganizerSection = computed(
    () => this.hasOrganizerScope() && this.organizerCategories().length > 0,
  )
  protected readonly organizerCategories = computed(() => {
    const byKey = new Map(this.categories().map((category) => [category.key, category]))
    return DISPATCHED_ORGA_NOTIFICATION_PREFERENCE_KEYS.flatMap((key) => {
      const category = byKey.get(key)
      if (!category) {
        return []
      }
      const copy = organizerNotificationPreferenceUiCopy(key)
      const groupSubtitle = this.orgaGroupSubtitle(key)
      return [{ ...category, groupSubtitle }]
    })
  })

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

  protected rowCopy(category: NotificationPreferenceCategory, orga?: boolean) {
    if (orga && this.isOrgaKey(category.key)) {
      return organizerNotificationPreferenceUiCopy(category.key)
    }
    return this.copyFor(category)
  }

  private isOrgaKey(key: NotificationPreferenceKey): key is OrgaNotificationPreferenceKey {
    return (DISPATCHED_ORGA_NOTIFICATION_PREFERENCE_KEYS as readonly string[]).includes(key)
  }

  private orgaGroupSubtitle(key: OrgaNotificationPreferenceKey): string | undefined {
    const immediateIndex = ORGA_IMMEDIATE_SIGNAL_KEYS.indexOf(key)
    const scheduledIndex = ORGA_SCHEDULED_REMINDER_KEYS.indexOf(key)
    if (immediateIndex === 0) {
      return 'Signaux immédiats'
    }
    if (scheduledIndex === 0) {
      return 'Rappels planifiés'
    }
    return undefined
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
    orga?: boolean,
  ): string {
    const channelLabel = channel === 'push' ? 'cet appareil' : 'e-mail'
    return `${this.rowCopy(category, orga).title} — ${channelLabel}`
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
      this.hasOrganizerScope.set(preferencesResult.data.hasOrganizerScope)
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
