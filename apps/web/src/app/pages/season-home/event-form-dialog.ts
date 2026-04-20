import { Component, inject, OnInit } from '@angular/core'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'

import {
  type EventResponse,
  EventApiService,
} from '../../core/events/event-api.service'

export interface EventFormDialogData {
  mode: 'create' | 'edit'
  seasonId: string
  event?: EventResponse
}

/** Instant ISO → valeur `datetime-local` (heure locale). */
function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

@Component({
  selector: 'app-event-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <h2 mat-dialog-title>
      {{ data.mode === 'create' ? 'Nouveau spectacle' : 'Modifier le spectacle' }}
    </h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form">
        <mat-form-field appearance="outline" class="full">
          <mat-label>Titre</mat-label>
          <input matInput formControlName="title" />
          @if (form.controls.title.touched && form.controls.title.errors?.['required']) {
            <mat-error>Obligatoire</mat-error>
          }
        </mat-form-field>
        <mat-form-field appearance="outline" class="full">
          <mat-label>Date et heure de début</mat-label>
          <input matInput type="datetime-local" formControlName="startsAtLocal" />
          @if (form.controls.startsAtLocal.touched && form.controls.startsAtLocal.errors?.['required']) {
            <mat-error>Obligatoire</mat-error>
          }
        </mat-form-field>
        <mat-form-field appearance="outline" class="full">
          <mat-label>Lieu (optionnel)</mat-label>
          <input matInput formControlName="location" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="full">
          <mat-label>Description (optionnel)</mat-label>
          <textarea matInput formControlName="description" rows="3"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button type="button" mat-button mat-dialog-close>Annuler</button>
      <button
        type="button"
        mat-flat-button
        color="primary"
        [disabled]="form.invalid || saving"
        (click)="submit()"
      >
        {{ data.mode === 'create' ? 'Créer' : 'Enregistrer' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .form {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      min-width: min(100vw - 3rem, 22rem);
    }
    .full {
      width: 100%;
    }
  `,
})
export class EventFormDialog implements OnInit {
  private readonly fb = inject(FormBuilder)
  private readonly api = inject(EventApiService)
  private readonly ref = inject(MatDialogRef<EventFormDialog, boolean>)
  protected readonly data = inject<EventFormDialogData>(MAT_DIALOG_DATA)

  protected saving = false

  protected readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    startsAtLocal: ['', [Validators.required]],
    location: [''],
    description: [''],
  })

  ngOnInit(): void {
    if (this.data.mode === 'edit' && this.data.event) {
      const e = this.data.event
      this.form.patchValue({
        title: e.title,
        startsAtLocal: toDatetimeLocalValue(e.startsAt),
        location: e.location ?? '',
        description: e.description ?? '',
      })
    }
  }

  protected async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched()
      return
    }
    const v = this.form.getRawValue()
    const startsAt = new Date(v.startsAtLocal).toISOString()
    this.saving = true
    try {
      if (this.data.mode === 'create') {
        const r = await this.api.createEvent(this.data.seasonId, {
          title: v.title.trim(),
          startsAt,
          location: v.location.trim() || null,
          description: v.description.trim() || null,
        })
        this.ref.close(r.ok)
      } else if (this.data.event) {
        const r = await this.api.updateEvent(this.data.seasonId, this.data.event.id, {
          title: v.title.trim(),
          startsAt,
          location: v.location.trim() || null,
          description: v.description.trim() || null,
        })
        this.ref.close(r.ok)
      }
    } finally {
      this.saving = false
    }
  }
}
