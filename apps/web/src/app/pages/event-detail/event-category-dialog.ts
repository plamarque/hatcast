import { Component, computed, inject, OnInit, signal } from '@angular/core'
import { MatAutocompleteModule } from '@angular/material/autocomplete'
import { MatButtonModule } from '@angular/material/button'
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'

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
  /** Prefilled display value (label or slug). */
  initialQuery?: string
}

/** `undefined` = cancelled; `null` = clear tag; `string` = set tag (trimmed). */
export type EventCategoryDialogResult = string | null | undefined

@Component({
  selector: 'app-event-category-dialog',
  imports: [
    MatAutocompleteModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <h2 mat-dialog-title>Catégorie</h2>
    <mat-dialog-content class="category-dialog">
      <mat-form-field appearance="outline" class="category-dialog__field">
        <mat-label>Catégorie (optionnelle)</mat-label>
        <input
          matInput
          autofocus
          [value]="query()"
          (input)="onQueryInput($any($event.target).value)"
          [matAutocomplete]="auto"
          placeholder="Ex. Déplacements, Apérock…"
        />
        <mat-autocomplete #auto="matAutocomplete" (optionSelected)="onOptionSelected($event.option.value)">
          @for (tag of filteredTags(); track tag.slug) {
            <mat-option [value]="tag">{{ tag.label }}</mat-option>
          }
        </mat-autocomplete>
        <mat-hint>{{ helpText }}</mat-hint>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button type="button" mat-button mat-dialog-close>Annuler</button>
      <button type="button" mat-flat-button color="primary" (click)="submit()">
        Enregistrer
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .category-dialog {
        display: grid;
        gap: 0.5rem;
        min-width: min(32rem, calc(100vw - 3rem));
      }
      .category-dialog__field {
        width: 100%;
      }
      .category-dialog__field ::ng-deep .mat-mdc-form-field-hint {
        white-space: normal;
        line-height: 1.35;
      }
    `,
  ],
})
export class EventCategoryDialog implements OnInit {
  private readonly troupeApi = inject(TroupeApiService)
  private readonly ref = inject(MatDialogRef<EventCategoryDialog, EventCategoryDialogResult>)
  protected readonly data = inject<EventCategoryDialogData>(MAT_DIALOG_DATA)

  protected readonly helpText = CATEGORY_HELP
  protected readonly query = signal('')
  protected readonly glossary = signal<TroupeCategory[]>([])

  protected readonly filteredTags = computed(() => {
    const q = this.query().trim().toLowerCase()
    const entries = this.glossary()
    if (!q) {
      return entries.slice(0, 8)
    }
    return entries
      .filter(
        (t) =>
          t.label.toLowerCase().includes(q) ||
          t.slug.toLowerCase().includes(q),
      )
      .slice(0, 8)
  })

  ngOnInit(): void {
    this.query.set(this.data.initialQuery?.trim() ?? '')
    void this.loadGlossary()
  }

  protected onQueryInput(value: string): void {
    this.query.set(value)
  }

  protected onOptionSelected(tag: TroupeCategory): void {
    this.query.set(tag.label)
  }

  protected submit(): void {
    const trimmed = this.query().trim()
    this.ref.close(trimmed.length > 0 ? trimmed : null)
  }

  private async loadGlossary(): Promise<void> {
    const r = await this.troupeApi.listCategories(this.data.troupeId)
    if (r.ok && r.data) {
      this.glossary.set(r.data)
    }
  }
}
