import { Component, inject, signal } from '@angular/core'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'

import { TroupeApiService } from '../../core/troupes/troupe-api.service'

@Component({
  selector: 'app-create-troupe-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <h2 mat-dialog-title>Créer une troupe</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form">
        <p class="slug-hint">
          L’identifiant d’URL (slug) est généré automatiquement à partir du nom.
        </p>
        <mat-form-field appearance="outline" class="full">
          <mat-label>Nom de la troupe</mat-label>
          <input matInput formControlName="name" autocomplete="organization" maxlength="255" />
          @if (form.controls.name.touched && form.controls.name.errors?.['required']) {
            <mat-error>Obligatoire</mat-error>
          }
          @if (serverError()) {
            <mat-error>{{ serverError() }}</mat-error>
          }
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button type="button" mat-button mat-dialog-close [disabled]="saving()">Annuler</button>
      <button
        type="button"
        mat-flat-button
        color="primary"
        (click)="submit()"
        [disabled]="saving()"
      >
        Créer
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .form {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      min-width: min(100vw - 2rem, 28rem);
      padding-top: 0.5rem;
    }
    .full {
      width: 100%;
    }
    .slug-hint {
      font-size: 0.85rem;
      opacity: 0.85;
      margin: 0 0 0.5rem;
      line-height: 1.35;
    }
  `,
})
export class CreateTroupeDialog {
  private readonly fb = inject(FormBuilder)
  private readonly api = inject(TroupeApiService)
  private readonly ref = inject(MatDialogRef<CreateTroupeDialog, string | undefined>)

  protected readonly saving = signal(false)
  protected readonly serverError = signal<string | null>(null)

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
  })

  protected async submit(): Promise<void> {
    this.serverError.set(null)
    this.form.markAllAsTouched()
    if (this.form.invalid) {
      return
    }
    this.saving.set(true)
    try {
      const r = await this.api.createTroupe({ name: this.form.controls.name.value.trim() })
      if (r.ok && r.data?.slug) {
        this.ref.close(r.data.slug)
        return
      }
      if (r.status === 400) {
        this.serverError.set('Nom invalide ou impossible à convertir en identifiant URL.')
        return
      }
      if (r.status === 409) {
        this.serverError.set('Conflit temporaire, réessayez.')
        return
      }
      this.serverError.set('Impossible de créer la troupe pour le moment.')
    } finally {
      this.saving.set(false)
    }
  }
}
