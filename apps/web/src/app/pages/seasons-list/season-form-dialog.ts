import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog'
import { MatDatepickerModule } from '@angular/material/datepicker'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { Subscription } from 'rxjs'

import {
  type SeasonResponse,
  SeasonApiService,
} from '../../core/seasons/season-api.service'

export interface SeasonFormDialogData {
  mode: 'create' | 'edit'
  troupeId: string
  season?: SeasonResponse
}

/** ISO local YYYY-MM-DD → Date (midi local pour éviter les décalages UTC). */
function parseIsoDateOnly(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d, 12, 0, 0, 0)
}

/** Date → YYYY-MM-DD pour l’API. */
function toIsoDateOnly(d: Date | null): string | null {
  if (!d) {
    return null
  }
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * Saison « un an » type rentrée → fin été : lendemain du dernier jour = +1 an sur la date de début, puis −1 jour.
 * Ex. 01/09/2026 → 31/08/2027.
 */
function defaultEndDateAfterOneSeasonYear(start: Date): Date {
  const end = new Date(start.getTime())
  end.setFullYear(end.getFullYear() + 1)
  end.setDate(end.getDate() - 1)
  return end
}

@Component({
  selector: 'app-season-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  template: `
    <h2 mat-dialog-title>
      {{ data.mode === 'create' ? 'Nouvelle saison' : 'Modifier la saison' }}
    </h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form">
        @if (data.mode === 'edit' && data.season) {
          <p class="slug-readonly">
            <span class="slug-readonly__label">Identifiant URL actuel</span>
            <code class="slug-readonly__value">{{ data.season.slug }}</code>
            <span class="slug-readonly__hint">
              Si vous modifiez le titre, l’URL sera recalculée pour rester unique.
            </span>
          </p>
        } @else {
          <p class="slug-hint">
            L’identifiant d’URL (slug) est généré automatiquement à partir du titre.
          </p>
        }
        <mat-form-field appearance="outline" class="full">
          <mat-label>Titre</mat-label>
          <input matInput formControlName="title" />
          @if (form.controls.title.touched && form.controls.title.errors?.['required']) {
            <mat-error>Obligatoire</mat-error>
          }
        </mat-form-field>
        <mat-form-field appearance="outline" class="full">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="3"></textarea>
        </mat-form-field>
        <p class="dates-hint">
          Si la date de fin est vide, elle est remplie automatiquement (ex. début 01/09/2026 → fin 31/08/2027).
        </p>
        <div class="dates">
          <mat-form-field appearance="outline">
            <mat-label>Début</mat-label>
            <input matInput [matDatepicker]="pickerStart" formControlName="startDate" />
            <mat-datepicker-toggle matIconSuffix [for]="pickerStart" />
            <mat-datepicker #pickerStart />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Fin</mat-label>
            <input matInput [matDatepicker]="pickerEnd" formControlName="endDate" />
            <mat-datepicker-toggle matIconSuffix [for]="pickerEnd" />
            <mat-datepicker #pickerEnd />
          </mat-form-field>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button type="button" mat-button (click)="cancel()" [disabled]="saving()">Annuler</button>
      <button
        type="button"
        mat-flat-button
        color="primary"
        (click)="submit()"
        [disabled]="saving()"
      >
        Enregistrer
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .form {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      min-width: min(100vw - 3rem, 22rem);
      padding-top: 0.5rem;
    }
    .full {
      width: 100%;
    }
    .dates-hint {
      font-size: 0.8rem;
      opacity: 0.88;
      margin: 0;
      line-height: 1.35;
    }
    .dates {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .dates mat-form-field {
      flex: 1 1 11rem;
    }
    .slug-hint,
    .slug-readonly__hint {
      font-size: 0.85rem;
      opacity: 0.85;
      margin: 0 0 0.5rem;
      line-height: 1.35;
    }
    .slug-readonly {
      margin: 0 0 0.75rem;
      padding: 0.75rem;
      border-radius: 8px;
      background: color-mix(in srgb, var(--mat-sys-on-surface) 6%, transparent);
    }
    .slug-readonly__label {
      display: block;
      font-size: 0.75rem;
      font-weight: 600;
      margin-bottom: 0.35rem;
      opacity: 0.9;
    }
    .slug-readonly__value {
      display: block;
      font-size: 0.9rem;
      word-break: break-all;
    }
  `,
})
export class SeasonFormDialog implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder)
  private readonly api = inject(SeasonApiService)
  private readonly ref = inject(MatDialogRef<SeasonFormDialog, string | boolean>)
  protected readonly data = inject<SeasonFormDialogData>(MAT_DIALOG_DATA)
  protected readonly saving = signal(false)

  private startDateSub: Subscription | undefined

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    description: [''],
    startDate: [null as Date | null],
    endDate: [null as Date | null],
  })

  ngOnInit(): void {
    const d = this.data
    if (d.mode === 'edit' && d.season) {
      const s = d.season
      this.form.patchValue({
        title: s.title,
        description: s.description ?? '',
        startDate: s.startDate ? parseIsoDateOnly(s.startDate) : null,
        endDate: s.endDate ? parseIsoDateOnly(s.endDate) : null,
      })
    }

    this.startDateSub = this.form.controls.startDate.valueChanges.subscribe((start) => {
      if (!start) {
        return
      }
      const endCurrent = this.form.controls.endDate.value
      if (endCurrent == null) {
        this.form.patchValue(
          { endDate: defaultEndDateAfterOneSeasonYear(start) },
          { emitEvent: false },
        )
      }
    })
  }

  ngOnDestroy(): void {
    this.startDateSub?.unsubscribe()
  }

  protected cancel(): void {
    this.ref.close()
  }

  protected async submit(): Promise<void> {
    this.form.markAllAsTouched()
    if (this.form.invalid) {
      return
    }
    this.saving.set(true)
    const v = this.form.getRawValue()
    const desc = v.description.trim() === '' ? null : v.description.trim()
    const start = toIsoDateOnly(v.startDate)
    const end = toIsoDateOnly(v.endDate)
    try {
      if (this.data.mode === 'create') {
        const r = await this.api.createSeason(this.data.troupeId, {
          title: v.title.trim(),
          description: desc,
          startDate: start,
          endDate: end,
        })
        if (r.ok && r.data) {
          this.ref.close(r.data.slug)
        }
      } else if (this.data.season) {
        const r = await this.api.updateSeason(this.data.season.id, {
          title: v.title.trim(),
          description: desc,
          startDate: start,
          endDate: end,
        })
        if (r.ok) {
          this.ref.close(true)
        }
      }
    } finally {
      this.saving.set(false)
    }
  }
}
