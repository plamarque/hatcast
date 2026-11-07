import { Component, inject } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog'
import { TroupeCategoriesTab } from './troupe-categories-tab'

@Component({
  selector: 'app-troupe-categories-dialog',
  imports: [MatButtonModule, MatDialogModule, TroupeCategoriesTab],
  template: `
    <h2 mat-dialog-title>Gérer les catégories</h2>
    <mat-dialog-content><app-troupe-categories-tab [troupeId]="data.troupeId" /></mat-dialog-content>
    <mat-dialog-actions align="end"><button type="button" mat-button mat-dialog-close>Fermer</button></mat-dialog-actions>
  `,
})
export class TroupeCategoriesDialog {
  protected readonly data = inject<{ troupeId: string }>(MAT_DIALOG_DATA)
}
