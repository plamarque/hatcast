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

  protected readonly data = this.sheetData ?? this.dialogData!
  protected readonly breakdown = signal<ChanceBreakdown>(this.data.breakdown)

  protected openDrawChancesHelp(): void {
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

  protected chanceTodayLabel(): string {
    return this.viewingSelf() ? 'Ta chance aujourd’hui' : 'Sa chance aujourd’hui'
  }

  protected referenceLineLabel(): string {
    const count = this.breakdown().candidateCount
    if (count == null || count <= 0) {
      return 'Chance de base'
    }
    const label = count === 1 ? '1 candidat' : `${count} candidats`
    return `Chance de base pour les ${label}`
  }

  protected poolRankSummary(): string {
    const current = this.breakdown()
    const total = current.candidateCount
    let poolRank = current.poolRank ?? null
    let aheadCount = current.aheadCount ?? null
    const tiedAtChance = current.tiedAtChanceCount
    if ((poolRank == null || aheadCount == null) && current.pool?.peers != null) {
      aheadCount = current.pool.peers.length
      poolRank = aheadCount + 1
    }
    if (total == null || total <= 0 || poolRank == null || aheadCount == null) {
      return 'Classement indisponible.'
    }
    const chancePercent = current.chancePercent
    const totalLabel = `${total} candidat${total > 1 ? 's' : ''}`
    const aheadLabel = this.viewingSelf() ? 'devant toi' : 'devant lui·elle'
    if (poolRank === 1 && (tiedAtChance ?? 1) > 1) {
      return `Ex aequo en tête du pool · ${tiedAtChance} candidats à ${chancePercent} %`
    }
    if (poolRank === 1) {
      return 'En tête du pool pour ce rôle.'
    }
    const ordinal = this.rankOrdinal(poolRank)
    const exAequoSuffix = (tiedAtChance ?? 1) > 1 ? ' ex aequo' : ''
    return `${ordinal}${exAequoSuffix} sur ${totalLabel} · ${aheadCount} ${aheadLabel}`
  }

  private rankOrdinal(rank: number): string {
    return rank === 1 ? '1er' : `${rank}e`
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
