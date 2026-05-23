import { Component, inject, OnInit, signal } from '@angular/core'
import { DatePipe } from '@angular/common'
import { MatButtonModule } from '@angular/material/button'
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSelectModule } from '@angular/material/select'

import {
  type MemberImportResult,
  type UserImportResult,
  type TroupeBaselineRole,
  type TroupeMemberAdmin,
  type TroupeMembershipStatus,
  TroupeApiService,
} from '../../core/troupes/troupe-api.service'
import { ConfirmDialog, type ConfirmDialogData } from '../seasons-list/confirm-dialog'

export interface TroupeMembersDialogData {
  troupeId: string
}

type MemberDraft = {
  displayName: string
  status: TroupeMembershipStatus
  baselineRole: TroupeBaselineRole
}

@Component({
  selector: 'app-troupe-members-dialog',
  imports: [
    MatButtonModule,
    DatePipe,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
  ],
  template: `
    <h2 mat-dialog-title>Membres</h2>
    <mat-dialog-content class="members">
      <p class="members__help">
        Gérez les membres actifs ou désactivés de la troupe. Pour une migration V1, importez d'abord
        les utilisateurs (email, nom affiché), puis les membres (email, nom, rôle, statut).
        Chaque utilisateur importé devra se connecter une fois en V2 pour activer son compte.
      </p>

      <section class="members__add" aria-label="Ajouter un membre">
        <mat-form-field appearance="outline">
          <mat-label>Email utilisateur</mat-label>
          <input
            matInput
            [value]="addEmail"
            (input)="addEmail = $any($event.target).value"
            placeholder="membre@example.com"
          />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Nom affiché</mat-label>
          <input
            matInput
            [value]="addDisplayName"
            (input)="addDisplayName = $any($event.target).value"
            placeholder="Optionnel"
          />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Rôle de base</mat-label>
          <mat-select [value]="addBaselineRole" (selectionChange)="addBaselineRole = $event.value">
            <mat-option value="MEMBER">Membre</mat-option>
            <mat-option value="TROUPE_ADMIN">Administrateur·ice de troupe</mat-option>
          </mat-select>
        </mat-form-field>
        <button type="button" mat-flat-button color="primary" [disabled]="saving()" (click)="addMember()">
          Ajouter un membre
        </button>
      </section>

      <section class="members__csv" aria-label="Actions CSV">
        <h3 class="members__csv-title">Utilisateurs (migration)</h3>
        <p class="members__csv-hint">Format : email, displayName — à importer avant les membres.</p>
        <div class="members__csv-actions">
          <label class="members__import-label">
            <input
              type="file"
              accept=".csv,text/csv"
              [disabled]="saving()"
              (change)="onImportUsersFileSelected($event)"
            />
            <span mat-stroked-button>Importer utilisateurs CSV</span>
          </label>
        </div>
        @if (userImportResult()) {
          <div class="members__import-summary" role="status">
            Import utilisateurs :
            {{ userImportResult()!.summary.success }} succès,
            {{ userImportResult()!.summary.skipped }} ignorées,
            {{ userImportResult()!.summary.error }} erreurs.
          </div>
          <table class="members__import-table">
            <thead>
              <tr>
                <th scope="col">Ligne</th>
                <th scope="col">Email</th>
                <th scope="col">Résultat</th>
                <th scope="col">Message</th>
              </tr>
            </thead>
            <tbody>
              @for (row of userImportResult()!.rows; track row.rowNumber) {
                <tr [class.members__import-row--error]="row.outcome === 'ERROR'">
                  <td>{{ row.rowNumber }}</td>
                  <td>{{ row.email || '—' }}</td>
                  <td>{{ importOutcomeLabel(row.outcome) }}</td>
                  <td>{{ row.message || '' }}</td>
                </tr>
              }
            </tbody>
          </table>
        }

        <h3 class="members__csv-title">Membres de troupe</h3>
        <p class="members__csv-hint">Format : email, displayName, baselineRole, status</p>
        <div class="members__csv-actions">
          <button type="button" mat-stroked-button [disabled]="saving()" (click)="exportCsv()">
            Exporter CSV
          </button>
          <label class="members__import-label">
            <input
              type="file"
              accept=".csv,text/csv"
              [disabled]="saving()"
              (change)="onImportFileSelected($event)"
            />
            <span mat-stroked-button>Importer membres CSV</span>
          </label>
        </div>
        @if (importResult()) {
          <div class="members__import-summary" role="status">
            Import terminé :
            {{ importResult()!.summary.success }} succès,
            {{ importResult()!.summary.skipped }} ignorées,
            {{ importResult()!.summary.error }} erreurs.
          </div>
          <table class="members__import-table">
            <thead>
              <tr>
                <th scope="col">Ligne</th>
                <th scope="col">Email</th>
                <th scope="col">Résultat</th>
                <th scope="col">Message</th>
              </tr>
            </thead>
            <tbody>
              @for (row of importResult()!.rows; track row.rowNumber) {
                <tr [class.members__import-row--error]="row.outcome === 'ERROR'">
                  <td>{{ row.rowNumber }}</td>
                  <td>{{ row.email || '—' }}</td>
                  <td>{{ importOutcomeLabel(row.outcome) }}</td>
                  <td>{{ row.message || importErrorLabel(row.code) }}</td>
                </tr>
              }
            </tbody>
          </table>
        }
      </section>

      @if (loading()) {
        <mat-spinner diameter="28" />
      } @else if (members().length === 0) {
        <p class="members__empty">Aucun membre dans cette troupe.</p>
      } @else {
        <div class="members__list">
          @for (member of members(); track member.id) {
            <article class="members__row">
              <div class="members__identity">
                <strong>{{ member.displayName }}</strong>
                <small>{{ member.email || 'Email indisponible' }}</small>
                <small>Créé le {{ member.createdAt | date: 'short' }} · Mis à jour le {{ member.updatedAt | date: 'short' }}</small>
              </div>

              <mat-form-field appearance="outline">
                <mat-label>Nom affiché</mat-label>
                <input
                  matInput
                  [value]="draft(member).displayName"
                  (input)="updateDraft(member.id, 'displayName', $any($event.target).value)"
                />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Statut</mat-label>
                <mat-select
                  [value]="draft(member).status"
                  (selectionChange)="updateDraft(member.id, 'status', $event.value)"
                >
                  <mat-option value="ACTIVE">Actif</mat-option>
                  <mat-option value="INACTIVE">Inactif</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Rôle de base</mat-label>
                <mat-select
                  [value]="draft(member).baselineRole"
                  (selectionChange)="updateDraft(member.id, 'baselineRole', $event.value)"
                >
                  <mat-option value="MEMBER">Membre</mat-option>
                  <mat-option value="TROUPE_ADMIN">Administrateur·ice de troupe</mat-option>
                </mat-select>
              </mat-form-field>

              <div class="members__actions">
                <button type="button" mat-stroked-button [disabled]="saving()" (click)="saveMember(member)">
                  Enregistrer
                </button>
                @if (member.status !== 'INACTIVE') {
                  <button type="button" mat-button color="warn" [disabled]="saving()" (click)="confirmDeactivate(member)">
                    Désactiver
                  </button>
                }
              </div>
            </article>
          }
        </div>
      }

      @if (message()) {
        <p class="members__message" role="status">{{ message() }}</p>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button type="button" mat-button [mat-dialog-close]="changed()">Fermer</button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .members {
        display: grid;
        gap: 1rem;
        min-width: min(56rem, calc(100vw - 3rem));
      }
      .members__help,
      .members__empty,
      .members__message,
      .members__import-summary {
        color: rgba(0, 0, 0, 0.65);
        margin: 0;
      }
      .members__add,
      .members__row {
        display: grid;
        gap: 0.75rem;
      }
      .members__add {
        align-items: start;
        grid-template-columns: minmax(10rem, 1.2fr) minmax(10rem, 1fr) minmax(10rem, 1fr) auto;
      }
      .members__csv,
      .members__row {
        border: 1px solid rgba(0, 0, 0, 0.12);
        border-radius: 0.85rem;
        padding: 0.75rem;
      }
      .members__csv {
        display: grid;
        gap: 0.75rem;
      }
      .members__csv-title {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
      }
      .members__csv-hint {
        margin: 0;
        font-size: 0.85rem;
        color: rgba(0, 0, 0, 0.55);
      }
      .members__csv-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        align-items: center;
      }
      .members__import-label input[type='file'] {
        display: none;
      }
      .members__import-label span {
        display: inline-flex;
        align-items: center;
        min-height: 2.25rem;
        padding: 0 1rem;
        border: 1px solid rgba(0, 0, 0, 0.38);
        border-radius: 4px;
        cursor: pointer;
      }
      .members__import-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.875rem;
      }
      .members__import-table th,
      .members__import-table td {
        border: 1px solid rgba(0, 0, 0, 0.12);
        padding: 0.35rem 0.5rem;
        text-align: left;
      }
      .members__import-row--error {
        background: rgba(211, 47, 47, 0.08);
      }
      .members__list {
        display: grid;
        gap: 0.75rem;
      }
      .members__row {
        align-items: start;
        grid-template-columns: minmax(12rem, 1.4fr) minmax(10rem, 1fr) minmax(9rem, 0.8fr) minmax(11rem, 1fr) auto;
      }
      .members__identity,
      .members__actions {
        display: grid;
        gap: 0.35rem;
      }
      .members__identity small {
        font-size: 0.78rem;
        opacity: 0.75;
      }
      @media (max-width: 900px) {
        .members__add,
        .members__row {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class TroupeMembersDialog implements OnInit {
  private readonly api = inject(TroupeApiService)
  private readonly dialog = inject(MatDialog)
  protected readonly data = inject<TroupeMembersDialogData>(MAT_DIALOG_DATA)

  protected readonly members = signal<TroupeMemberAdmin[]>([])
  protected readonly drafts = signal<Record<string, MemberDraft>>({})
  protected readonly loading = signal(false)
  protected readonly saving = signal(false)
  protected readonly changed = signal(false)
  protected readonly message = signal('')
  protected readonly importResult = signal<MemberImportResult | null>(null)
  protected readonly userImportResult = signal<UserImportResult | null>(null)

  addEmail = ''
  addDisplayName = ''
  addBaselineRole: TroupeBaselineRole = 'MEMBER'

  ngOnInit(): void {
    void this.reload()
  }

  protected draft(member: TroupeMemberAdmin): MemberDraft {
    return this.drafts()[member.id] ?? {
      displayName: member.displayName,
      status: member.status,
      baselineRole: member.baselineRole,
    }
  }

  protected updateDraft(
    memberId: string,
    field: keyof MemberDraft,
    value: string,
  ): void {
    const current = this.drafts()[memberId]
    if (!current) return
    this.drafts.update((drafts) => ({
      ...drafts,
      [memberId]: {
        ...current,
        [field]: value,
      },
    }))
  }

  protected async addMember(): Promise<void> {
    const email = this.addEmail.trim()
    if (!email) {
      this.message.set('Saisissez un email.')
      return
    }
    this.saving.set(true)
    try {
      const r = await this.api.addMember(this.data.troupeId, {
        email,
        displayName: this.addDisplayName,
        baselineRole: this.addBaselineRole,
      })
      if (!r.ok) {
        this.message.set(this.errorMessage(r.status, 'Ajout impossible.'))
        return
      }
      this.addEmail = ''
      this.addDisplayName = ''
      this.addBaselineRole = 'MEMBER'
      this.changed.set(true)
      this.message.set('Membre ajouté.')
      await this.reload()
    } finally {
      this.saving.set(false)
    }
  }

  protected async saveMember(member: TroupeMemberAdmin): Promise<void> {
    const draft = this.draft(member)
    this.saving.set(true)
    try {
      const r = await this.api.updateMember(this.data.troupeId, member.id, draft)
      if (!r.ok) {
        this.message.set(this.errorMessage(r.status, 'Mise à jour impossible.'))
        return
      }
      this.changed.set(true)
      this.message.set('Membre mis à jour.')
      await this.reload()
    } finally {
      this.saving.set(false)
    }
  }

  protected confirmDeactivate(member: TroupeMemberAdmin): void {
    const ref = this.dialog.open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
      data: {
        title: 'Désactiver le membre',
        message: `Désactiver « ${member.displayName} » ? Son accès à cette troupe sera retiré.`,
        confirmLabel: 'Désactiver',
      },
    })
    ref.afterClosed().subscribe((ok) => {
      if (ok) void this.deactivateMember(member)
    })
  }

  protected async exportCsv(): Promise<void> {
    this.saving.set(true)
    try {
      const r = await this.api.exportMembersCsv(this.data.troupeId)
      if (!r.ok || !r.data) {
        this.message.set(this.errorMessage(r.status, 'Export CSV impossible.'))
        return
      }
      const url = URL.createObjectURL(r.data)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `troupe-members-${this.data.troupeId}.csv`
      anchor.click()
      URL.revokeObjectURL(url)
      this.message.set('Export CSV téléchargé.')
    } finally {
      this.saving.set(false)
    }
  }

  protected async onImportUsersFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    input.value = ''
    if (!file) return
    this.saving.set(true)
    try {
      const r = await this.api.importUsersCsv(this.data.troupeId, file)
      if (!r.ok || !r.data) {
        this.message.set(this.errorMessage(r.status, 'Import utilisateurs impossible.'))
        this.userImportResult.set(null)
        return
      }
      this.userImportResult.set(r.data)
      this.message.set('Import utilisateurs terminé.')
    } finally {
      this.saving.set(false)
    }
  }

  protected async onImportFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    input.value = ''
    if (!file) return
    this.saving.set(true)
    try {
      const r = await this.api.importMembersCsv(this.data.troupeId, file)
      if (!r.ok || !r.data) {
        this.message.set(this.errorMessage(r.status, 'Import CSV impossible.'))
        this.importResult.set(null)
        return
      }
      this.importResult.set(r.data)
      this.changed.set(true)
      this.message.set('Import CSV terminé.')
      await this.reload()
    } finally {
      this.saving.set(false)
    }
  }

  protected importOutcomeLabel(outcome: MemberImportResult['rows'][number]['outcome']): string {
    switch (outcome) {
      case 'SUCCESS':
        return 'Succès'
      case 'SKIPPED':
        return 'Ignorée'
      case 'ERROR':
        return 'Erreur'
    }
  }

  protected importErrorLabel(code: MemberImportResult['rows'][number]['code']): string {
    switch (code) {
      case 'USER_NOT_FOUND':
        return 'Utilisateur non importé — importez d\'abord le CSV utilisateurs.'
      case 'INVALID_EMAIL':
        return 'Email invalide.'
      case 'LAST_ADMIN_VIOLATION':
        return 'Dernier administrateur actif.'
      default:
        return ''
    }
  }

  private async deactivateMember(member: TroupeMemberAdmin): Promise<void> {
    this.saving.set(true)
    try {
      const r = await this.api.deactivateMember(this.data.troupeId, member.id)
      if (!r.ok) {
        this.message.set(this.errorMessage(r.status, 'Désactivation impossible.'))
        return
      }
      this.changed.set(true)
      this.message.set('Membre désactivé.')
      await this.reload()
    } finally {
      this.saving.set(false)
    }
  }

  private async reload(): Promise<void> {
    this.loading.set(true)
    try {
      const r = await this.api.listMembers(this.data.troupeId, 0, 100)
      if (!r.ok || !r.data) {
        this.message.set('Chargement des membres impossible.')
        return
      }
      this.members.set(r.data.content)
      this.drafts.set(
        Object.fromEntries(
          r.data.content.map((member) => [
            member.id,
            {
              displayName: member.displayName,
              status: member.status,
              baselineRole: member.baselineRole,
            },
          ]),
        ),
      )
    } finally {
      this.loading.set(false)
    }
  }

  private errorMessage(status: number, fallback: string): string {
    if (status === 404) return 'Ressource introuvable.'
    if (status === 409) return 'La troupe doit conserver au moins un administrateur actif.'
    if (status === 403) return 'Vous ne pouvez pas administrer les membres de cette troupe.'
    return fallback
  }
}
