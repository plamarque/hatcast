import { Component, computed, inject, OnInit, signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog'
import { MatIconModule } from '@angular/material/icon'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatRadioModule } from '@angular/material/radio'
import { Router } from '@angular/router'

import { troupeAdminSettingsPath } from '../../core/navigation/troupe-routes'
import {
  type TroupeCategory,
  TroupeApiService,
} from '../../core/troupes/troupe-api.service'

export const CATEGORY_HELP =
  'Choisis la catégorie dans laquelle ce spectacle comptera pour les statistiques et les tirages.'

/** Libellé affiché quand `category` est absent (= pool principal, ADR 0013). */
export const DEFAULT_CATEGORY_DISPLAY_LABEL = 'Spectacle ordinaire'

export interface EventCategoryDialogData {
  troupeId: string
  troupeSlug: string
  /** Current event category slug; `null` = Spectacle ordinaire. */
  initialCategorySlug: string | null
  canManageTroupe: boolean
}

/** `undefined` = cancelled; `null` = ordinaire; `string` = glossary slug. */
export type EventCategoryDialogResult = string | null | undefined

interface CategoryOption {
  slug: string | null
  label: string
}

@Component({
  selector: 'app-event-category-dialog',
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatRadioModule,
  ],
  template: `
    <h2 mat-dialog-title id="event-category-dialog-title">Catégorie</h2>
    <mat-dialog-content class="category-dialog">
      <p class="category-dialog__intro">{{ helpText }}</p>
      @if (loading()) {
        <div class="category-dialog__loading" role="status" aria-live="polite">
          <mat-spinner diameter="28" />
        </div>
      } @else {
        <mat-radio-group
          class="category-dialog__options"
          [value]="selectedSlug()"
          (change)="onSelectionChange($event.value)"
          aria-labelledby="event-category-dialog-title"
        >
          @for (option of categoryOptions(); track option.slug ?? 'ordinaire') {
            <mat-radio-button class="category-dialog__option" [value]="option.slug">
              {{ option.label }}
            </mat-radio-button>
          }
        </mat-radio-group>
      }
      @if (data.canManageTroupe) {
        <button
          type="button"
          class="category-dialog__manage-link"
          (click)="navigateToCategorySettings()"
        >
          <mat-icon aria-hidden="true">settings</mat-icon>
          Gérer les catégories
        </button>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button type="button" mat-button mat-dialog-close>Annuler</button>
      <button
        type="button"
        mat-flat-button
        color="primary"
        [disabled]="loading() || !hasChanges()"
        (click)="submit()"
      >
        Enregistrer
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .category-dialog {
        display: grid;
        gap: 0.75rem;
        min-width: min(32rem, calc(100vw - 3rem));
      }

      .category-dialog__intro {
        margin: 0;
        color: var(--mat-sys-on-surface-variant);
        font-size: 0.875rem;
        line-height: 1.35;
      }

      .category-dialog__loading {
        display: flex;
        justify-content: center;
        min-height: 6rem;
        align-items: center;
      }

      .category-dialog__options {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .category-dialog__option {
        min-height: 48px;
      }

      .category-dialog__manage-link {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        align-self: flex-start;
        padding: 0.35rem 0.5rem;
        border: none;
        border-radius: 0.5rem;
        background: transparent;
        color: var(--mat-sys-primary);
        font: inherit;
        font-size: 0.875rem;
        cursor: pointer;
      }

      .category-dialog__manage-link:hover,
      .category-dialog__manage-link:focus-visible {
        background: color-mix(in srgb, var(--mat-sys-on-surface) 6%, transparent);
      }

      .category-dialog__manage-link mat-icon {
        font-size: 1.1rem;
        width: 1.1rem;
        height: 1.1rem;
      }
    `,
  ],
})
export class EventCategoryDialog implements OnInit {
  private readonly troupeApi = inject(TroupeApiService)
  private readonly router = inject(Router)
  private readonly ref = inject(MatDialogRef<EventCategoryDialog, EventCategoryDialogResult>)
  protected readonly data = inject<EventCategoryDialogData>(MAT_DIALOG_DATA)

  protected readonly helpText = CATEGORY_HELP
  protected readonly loading = signal(true)
  protected readonly glossary = signal<TroupeCategory[]>([])
  protected readonly selectedSlug = signal<string | null>(this.data.initialCategorySlug)

  protected readonly categoryOptions = computed((): CategoryOption[] => {
    const entries = this.glossary()
    const deplacements = entries.find((t) => t.slug === 'deplacements')
    const custom = entries
      .filter((t) => t.slug !== 'deplacements')
      .sort((a, b) => a.label.localeCompare(b.label, 'fr'))

    const options: CategoryOption[] = [
      { slug: null, label: DEFAULT_CATEGORY_DISPLAY_LABEL },
    ]
    if (deplacements) {
      options.push(deplacements)
    }
    options.push(...custom)
    return options
  })

  ngOnInit(): void {
    void this.loadGlossary()
  }

  protected onSelectionChange(value: string | null): void {
    this.selectedSlug.set(value)
  }

  protected hasChanges(): boolean {
    return this.selectedSlug() !== this.data.initialCategorySlug
  }

  protected submit(): void {
    this.ref.close(this.selectedSlug())
  }

  protected navigateToCategorySettings(): void {
    this.ref.close(undefined)
    void this.router.navigate(troupeAdminSettingsPath(this.data.troupeSlug), {
      queryParams: { tab: 'categories' },
    })
  }

  private async loadGlossary(): Promise<void> {
    this.loading.set(true)
    try {
      const r = await this.troupeApi.listCategories(this.data.troupeId)
      if (r.ok && r.data) {
        this.glossary.set(r.data)
      }
    } finally {
      this.loading.set(false)
    }
  }
}
