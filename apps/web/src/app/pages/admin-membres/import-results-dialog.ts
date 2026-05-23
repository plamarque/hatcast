import { Component, inject } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog'

import type {
  MemberImportResult,
  UserImportResult,
} from '../../core/troupes/troupe-api.service'
import { importErrorLabel, importOutcomeLabel } from './import-csv.helpers'

export interface ImportResultsDialogData {
  result: MemberImportResult | UserImportResult
  /** True when member list should refresh on close (any success row). */
  refreshOnClose: boolean
}

@Component({
  selector: 'app-import-results-dialog',
  imports: [MatButtonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>Résultat de l'import</h2>
    <mat-dialog-content class="import-results">
      <p class="import-results__summary" role="status">
        {{ data.result.summary.success }} succès,
        {{ data.result.summary.skipped }} ignorées,
        {{ data.result.summary.error }} erreurs.
      </p>
      <div class="import-results__table-wrap">
        <table class="import-results__table">
          <thead>
            <tr>
              <th scope="col">Ligne</th>
              <th scope="col">Email</th>
              <th scope="col">Résultat</th>
              <th scope="col">Message</th>
            </tr>
          </thead>
          <tbody>
            @for (row of data.result.rows; track row.rowNumber) {
              <tr [class.import-results__row--error]="row.outcome === 'ERROR'">
                <td>{{ row.rowNumber }}</td>
                <td>{{ row.email || '—' }}</td>
                <td>{{ importOutcomeLabel(row.outcome) }}</td>
                <td>{{ rowMessage(row) }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button type="button" mat-flat-button color="primary" [mat-dialog-close]="data.refreshOnClose">
        Fermer
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .import-results {
        display: grid;
        gap: 0.75rem;
        min-width: min(40rem, calc(100vw - 3rem));
      }
      .import-results__summary {
        margin: 0;
        color: rgba(0, 0, 0, 0.65);
      }
      .import-results__table-wrap {
        max-height: min(24rem, 50vh);
        overflow: auto;
      }
      .import-results__table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.875rem;
      }
      .import-results__table th,
      .import-results__table td {
        border: 1px solid rgba(0, 0, 0, 0.12);
        padding: 0.35rem 0.5rem;
        text-align: left;
      }
      .import-results__row--error {
        background: rgba(211, 47, 47, 0.08);
      }
    `,
  ],
})
export class ImportResultsDialog {
  protected readonly data = inject<ImportResultsDialogData>(MAT_DIALOG_DATA)
  protected readonly importOutcomeLabel = importOutcomeLabel

  protected rowMessage(row: ImportResultsDialogData['result']['rows'][number]): string {
    if (row.message) {
      return row.message
    }
    if ('code' in row && row.code) {
      return importErrorLabel(row.code)
    }
    return ''
  }
}
