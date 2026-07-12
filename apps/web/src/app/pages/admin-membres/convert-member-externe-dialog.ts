import { Component, inject, signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog'
import { MatRadioModule } from '@angular/material/radio'

import {
  type MemberConversionContext,
  type TroupeMemberAdmin,
  TroupeApiService,
} from '../../core/troupes/troupe-api.service'

export interface ConvertMemberExterneDialogData {
  troupeId: string
  member: TroupeMemberAdmin
}

type SeasonChoice = 'GUEST_SEASON' | 'REMOVE'

@Component({
  selector: 'app-convert-member-externe-dialog',
  imports: [MatButtonModule, MatDialogModule, MatRadioModule],
  template: `
    <h2 mat-dialog-title>Passer en externe</h2>
    <mat-dialog-content>
      <p class="convert-dialog__intro">
        {{ data.member.displayName }} devient <strong>externe</strong> dans la troupe. Le compte
        HatCast lié est conservé. Les saisons passées restent en historique membre.
      </p>
      @if (loading()) {
        <p>Chargement des saisons…</p>
      } @else if (seasons().length === 0) {
        <p>Aucune saison active avec roster — seul le rôle troupe change.</p>
      } @else {
        <p class="convert-dialog__hint">Pour chaque saison active :</p>
        <ul class="convert-dialog__seasons">
          @for (season of seasons(); track season.seasonId) {
            <li class="convert-dialog__season">
              <span class="convert-dialog__season-title">{{ season.seasonTitle }}</span>
              <mat-radio-group
                [value]="choiceFor(season.seasonId)"
                (change)="setChoice(season.seasonId, $event.value)"
                [attr.aria-label]="'Choix pour ' + season.seasonTitle"
              >
                <mat-radio-button value="GUEST_SEASON">Externe saison</mat-radio-button>
                <mat-radio-button value="REMOVE">Retirer du roster</mat-radio-button>
              </mat-radio-group>
            </li>
          }
        </ul>
      }
      @if (error()) {
        <p class="convert-dialog__error" role="alert">{{ error() }}</p>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button type="button" mat-button mat-dialog-close>Annuler</button>
      <button
        type="button"
        mat-flat-button
        color="primary"
        [disabled]="saving() || loading() || !!error()"
        (click)="submit()"
      >
        Passer en externe
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      :host mat-dialog-content {
        overflow-x: hidden;
        max-height: min(70vh, 28rem);
      }

      .convert-dialog__intro {
        margin: 0 0 1rem;
        color: var(--mat-sys-on-surface-variant);
      }

      .convert-dialog__hint {
        margin: 0 0 0.5rem;
        font-size: 0.875rem;
        color: var(--mat-sys-on-surface-variant);
      }

      .convert-dialog__error {
        color: var(--mat-sys-error);
      }

      .convert-dialog__seasons {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        gap: 0.75rem;
      }

      .convert-dialog__season {
        display: grid;
        gap: 0.35rem;
        padding: 0.5rem 0;
        border-bottom: 1px solid color-mix(in srgb, var(--mat-sys-outline) 35%, transparent);
      }

      .convert-dialog__season-title {
        font-weight: 500;
      }

      mat-radio-group {
        display: grid;
        gap: 0.25rem;
      }

      mat-radio-button {
        min-height: 48px;
      }
    `,
  ],
})
export class ConvertMemberExterneDialog {
  protected readonly data = inject<ConvertMemberExterneDialogData>(MAT_DIALOG_DATA)
  private readonly dialogRef = inject(MatDialogRef<ConvertMemberExterneDialog, boolean>)
  private readonly api = inject(TroupeApiService)

  protected readonly loading = signal(true)
  protected readonly saving = signal(false)
  protected readonly error = signal<string | null>(null)
  protected readonly seasons = signal<MemberConversionContext['activeSeasons']>([])
  private readonly choices = signal<Record<string, SeasonChoice>>({})

  constructor() {
    void this.loadContext()
  }

  protected choiceFor(seasonId: string): SeasonChoice {
    return this.choices()[seasonId] ?? 'GUEST_SEASON'
  }

  protected setChoice(seasonId: string, value: SeasonChoice): void {
    this.choices.update((current) => ({ ...current, [seasonId]: value }))
  }

  protected async submit(): Promise<void> {
    if (this.saving()) {
      return
    }
    this.saving.set(true)
    this.error.set(null)
    const choices = this.choices()
    const seasonsToGuestSeason: string[] = []
    const seasonsToRemove: string[] = []
    for (const season of this.seasons()) {
      const choice = choices[season.seasonId] ?? 'GUEST_SEASON'
      if (choice === 'GUEST_SEASON') {
        seasonsToGuestSeason.push(season.seasonId)
      } else {
        seasonsToRemove.push(season.seasonId)
      }
    }
    const result = await this.api.convertMemberToExterne(this.data.troupeId, this.data.member.id, {
      seasonsToGuestSeason,
      seasonsToRemove,
    })
    if (!result.ok) {
      this.error.set(
        result.errorMessage ?? 'Conversion impossible. Vérifiez vos choix et réessayez.',
      )
      this.saving.set(false)
      return
    }
    this.dialogRef.close(true)
  }

  private async loadContext(): Promise<void> {
    const result = await this.api.getMemberConversionContext(
      this.data.troupeId,
      this.data.member.id,
    )
    this.loading.set(false)
    if (!result.ok || !result.data) {
      this.error.set('Impossible de charger les saisons actives.')
      return
    }
    this.seasons.set(result.data.activeSeasons)
    const defaults: Record<string, SeasonChoice> = {}
    for (const season of result.data.activeSeasons) {
      defaults[season.seasonId] = 'GUEST_SEASON'
    }
    this.choices.set(defaults)
  }
}
