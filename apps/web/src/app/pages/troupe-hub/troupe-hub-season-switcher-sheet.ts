import { Component, inject } from '@angular/core'
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatListModule } from '@angular/material/list'

import type { SeasonResponse } from '../../core/seasons/season-api.service'

export interface TroupeHubSeasonSwitcherSheetData {
  seasons: SeasonResponse[]
  selectedSeasonId: string | null
}

@Component({
  selector: 'app-troupe-hub-season-switcher-sheet',
  imports: [MatButtonModule, MatIconModule, MatListModule],
  template: `
    <div class="troupe-hub-season-sheet">
      <div class="troupe-hub-season-sheet__header">
        <h2 class="troupe-hub-season-sheet__title">Choisir une saison</h2>
        <button
          mat-icon-button
          type="button"
          aria-label="Fermer"
          (click)="dismiss()"
        >
          <mat-icon>close</mat-icon>
        </button>
      </div>
      <mat-action-list>
        @for (season of data.seasons; track season.id) {
          <button
            mat-list-item
            type="button"
            [attr.aria-current]="season.id === data.selectedSeasonId ? 'true' : null"
            (click)="pick(season)"
          >
            <span matListItemTitle>{{ season.title }}</span>
            @if (season.id === data.selectedSeasonId) {
              <mat-icon matListItemMeta aria-hidden="true">check</mat-icon>
            }
          </button>
        }
      </mat-action-list>
    </div>
  `,
  styles: `
    .troupe-hub-season-sheet {
      padding: 0.5rem 0 1rem;
    }

    .troupe-hub-season-sheet__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      padding: 0 0.5rem 0.25rem;
    }

    .troupe-hub-season-sheet__title {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
    }
  `,
})
export class TroupeHubSeasonSwitcherSheet {
  protected readonly data = inject<TroupeHubSeasonSwitcherSheetData>(MAT_BOTTOM_SHEET_DATA)
  private readonly sheetRef = inject(
    MatBottomSheetRef<TroupeHubSeasonSwitcherSheet, SeasonResponse | undefined>,
  )

  protected pick(season: SeasonResponse): void {
    this.sheetRef.dismiss(season)
  }

  protected dismiss(): void {
    this.sheetRef.dismiss()
  }
}
