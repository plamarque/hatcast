import { Component, inject, signal } from '@angular/core'
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet'
import { MatButtonModule } from '@angular/material/button'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { MatIconModule } from '@angular/material/icon'
import { MatTooltip, MatTooltipModule } from '@angular/material/tooltip'

import {
  type ChanceAdjustment,
  type ChanceBreakdown,
} from '../../../core/composition/composition-api.service'
import type {
  ChanceBreakdownEntryPoint,
  Fr47EventContext,
} from '../../../core/analytics/fr47-event-names'
import { ProductAnalyticsService } from '../../../core/analytics/product-analytics.service'
import { multiPlaceChanceTooltipCopy } from '../../../core/account/member-gender'
import { chanceColorClass } from '../../../core/availability/availability-chances'
import { UserAvatarComponent } from '../../user-avatar/user-avatar'
import { DrawChancesHelpService } from '../draw-chances-help.service'

/** Category scope is not a breakdown row (BUG-012); hide defensively if API regresses. */
const BREAKDOWN_HIDDEN_FACTOR_IDS = new Set(['equity_tag'])

export interface ChanceBreakdownSheetData {
  seasonId: string
  eventId: string
  roleKey: string
  roleHeaderLabel: string
  stepBanner?: string | null
  breakdown: ChanceBreakdown
  isDesktop: boolean
  viewerParticipantIds: string[]
  analyticsContext?: Fr47EventContext
  entryPoint?: ChanceBreakdownEntryPoint
}

@Component({
  selector: 'app-chance-breakdown-sheet',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    UserAvatarComponent,
  ],
  templateUrl: './chance-breakdown-sheet.html',
  styleUrl: './chance-breakdown-sheet.scss',
})
export class ChanceBreakdownSheet {
  private readonly sheetRef = inject(MatBottomSheetRef<ChanceBreakdownSheet>, { optional: true })
  private readonly dialogRef = inject(MatDialogRef<ChanceBreakdownSheet>, { optional: true })
  private readonly sheetData = inject<ChanceBreakdownSheetData | null>(MAT_BOTTOM_SHEET_DATA, {
    optional: true,
  })
  private readonly dialogData = inject<ChanceBreakdownSheetData | null>(MAT_DIALOG_DATA, {
    optional: true,
  })
  private readonly drawChancesHelp = inject(DrawChancesHelpService)
  private readonly analytics = inject(ProductAnalyticsService)

  protected readonly data = this.sheetData ?? this.dialogData!
  protected readonly breakdown = signal<ChanceBreakdown>(this.data.breakdown)

  protected openDrawChancesHelp(): void {
    if (this.data.analyticsContext && this.data.entryPoint) {
      try {
        this.analytics.captureChanceBreakdownHelpOpened(this.data.analyticsContext, {
          entry_point: this.data.entryPoint,
        })
      } catch {
        /* Observability must not block the existing help action. */
      }
    }
    void this.drawChancesHelp.open()
  }

  protected chanceColorClass(percent: number): string {
    return `chance-breakdown-sheet__chance--${chanceColorClass(percent)}`
  }

  protected viewingSelf(): boolean {
    return this.data.viewerParticipantIds.includes(this.breakdown().participantId)
  }

  protected chanceScaleTitle(): string {
    return 'D’où vient ce % ?'
  }

  protected recordedLabel(): string {
    return this.breakdown().recordedSource === 'draw_opening'
      ? 'Estimation enregistrée à l’ouverture du tirage'
      : 'Estimation enregistrée lors de la sélection'
  }

  protected recordedDate(): string | null {
    const date = this.breakdown().recordedAt
    return date ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(date)) : null
  }

  protected recordedPersonLabel(): string {
    const name = this.breakdown().displayName.trim()
    return /^[aàâäeéèêëiîïoôöuùûüyÿh]/i.test(name) ? `d’${name}` : `de ${name}`
  }

  protected chanceTodayLabel(): string {
    return this.viewingSelf() ? 'Ta chance estimée' : 'Sa chance estimée'
  }

  protected referenceLineLabel(): string {
    const count = this.breakdown().candidateCount
    if (count == null || count <= 0) {
      return 'Chance de base'
    }
    const label = count === 1 ? '1 candidat' : `${count} candidats`
    return `Chance de base pour les ${label}`
  }

  protected showMultiPlaceHint(): boolean {
    return (this.breakdown().requiredCount ?? 0) > 1
  }

  protected multiPlacePlacesLabel(): string {
    const n = this.breakdown().requiredCount ?? 0
    return `${n} place${n > 1 ? 's' : ''} à pourvoir`
  }

  protected onHintClick(event: MouseEvent, tooltip: MatTooltip): void {
    event.stopPropagation()
    tooltip.toggle()
  }

  protected multiPlaceChanceExplanation(): string {
    return multiPlaceChanceTooltipCopy({
      viewingSelf: this.viewingSelf(),
      gender: this.breakdown().gender,
      placesCount: this.breakdown().requiredCount ?? 0,
    })
  }

  protected close(): void {
    this.sheetRef?.dismiss()
    this.dialogRef?.close()
  }

  protected deltaIcon(delta: number): string {
    return delta < 0 ? 'trending_down' : 'trending_up'
  }

  protected deltaClass(delta: number): string {
    return delta < 0
      ? 'chance-breakdown-sheet__adjustment--negative'
      : 'chance-breakdown-sheet__adjustment--positive'
  }

  protected visibleAdjustments(): ChanceAdjustment[] {
    return this.breakdown().adjustments.filter(
      (adjustment) => !BREAKDOWN_HIDDEN_FACTOR_IDS.has(adjustment.factorId),
    )
  }
}
