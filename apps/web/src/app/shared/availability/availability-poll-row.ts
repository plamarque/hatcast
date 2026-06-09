import { Component, input, output } from '@angular/core'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatIconModule } from '@angular/material/icon'
import { MatProgressBarModule } from '@angular/material/progress-bar'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'

import type { CompositionPoolPreviewSegment } from '../../core/composition/composition-api.service'
import type { SummaryRoleCandidate } from '../../core/availability/availability-api.service'
import { CompositionPoolPreview } from '../composition/composition-pool-preview'
import { UserAvatarComponent } from '../user-avatar/user-avatar'
import type { PollRowKind } from './availability-vote.utils'

@Component({
  selector: 'app-availability-poll-row',
  imports: [
    MatCheckboxModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    CompositionPoolPreview,
    UserAvatarComponent,
  ],
  templateUrl: './availability-poll-row.html',
  styleUrl: './availability-poll-row.scss',
})
export class AvailabilityPollRow {
  readonly rowKind = input.required<PollRowKind>()
  readonly roleKey = input<string | null>(null)
  readonly label = input.required<string>()
  readonly emoji = input<string | null>(null)
  readonly checked = input(false)
  readonly disabled = input(false)
  readonly fillPercent = input(0)
  readonly counterText = input('')
  readonly avatars = input<SummaryRoleCandidate[]>([])
  readonly expanded = input(false)
  readonly poolLoading = input(false)
  readonly poolSegments = input<CompositionPoolPreviewSegment[]>([])
  readonly poolInteractive = input(false)
  readonly saving = input(false)
  readonly hasCandidates = input(false)

  readonly checkedChange = output<boolean>()
  readonly poolTrigger = output<void>()
  readonly poolSegmentTap = output<{ participantId: string; chancePercent: number }>()

  protected onCheckboxChange(checked: boolean): void {
    if (this.disabled() || this.saving()) {
      return
    }
    this.checkedChange.emit(checked)
  }

  protected onPoolClick(event: MouseEvent): void {
    event.stopPropagation()
    if (!this.hasCandidates() && !this.poolLoading()) {
      return
    }
    this.poolTrigger.emit()
  }

  protected poolAriaLabel(): string {
    const label = this.label()
    const counter = this.counterText()
    if (counter.includes('/')) {
      return `Voir les candidats pour ${label} (${counter})`
    }
    return `Voir les ${counter || '0'} membres pour ${label}`
  }

  protected visibleAvatars(): SummaryRoleCandidate[] {
    return this.avatars().slice(0, 3)
  }
}
