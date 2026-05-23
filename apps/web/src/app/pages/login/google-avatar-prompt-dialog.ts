import { Component, inject } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog'

@Component({
  selector: 'app-google-avatar-prompt-dialog',
  imports: [MatButtonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>Utiliser votre photo Google ?</h2>
    <mat-dialog-content>
      <p>Souhaitez-vous importer votre photo de profil Google dans HatCast ?</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button type="button" mat-button [mat-dialog-close]="false">Non</button>
      <button type="button" mat-flat-button color="primary" [mat-dialog-close]="true">Oui</button>
    </mat-dialog-actions>
  `,
})
export class GoogleAvatarPromptDialog {
  readonly dialogRef = inject(MatDialogRef<GoogleAvatarPromptDialog, boolean>)
}
