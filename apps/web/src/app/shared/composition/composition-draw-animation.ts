import { Component, computed, input, output, signal } from '@angular/core'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'

import type { MemberGender } from '../../core/account/member-gender'
import { drawSelectionStatusLabel } from '../../core/account/member-gender'
import { UserAvatarComponent } from '../user-avatar/user-avatar'
import {
  chancePoolTier,
  chanceSpectrumSegmentBackground,
  type ChancePoolTier,
} from '../../core/availability/availability-chances'
import type {
  CompositionDrawStep,
  CompositionPoolPreviewSegment,
} from '../../core/composition/composition-api.service'

export type CompositionDrawAnimationMode = 'live' | 'preview'

export type PreviewSegment = {
  participantId: string
  displayName: string
  chancePercent: number
  weight: number
  widthPercent: number
  avatarUrl?: string | null
  gender?: MemberGender | null
}

@Component({
  selector: 'app-composition-draw-animation',
  imports: [MatProgressSpinnerModule, UserAvatarComponent],
  templateUrl: './composition-draw-animation.html',
  styleUrl: './composition-draw-animation.scss',
})
export class CompositionDrawAnimation {
  readonly preparing = input(false)
  readonly preparingMessage = input('Nous préparons le tirage au sort…')
  readonly step = input<CompositionDrawStep | null>(null)
  readonly stepIndex = input(0)
  readonly totalSteps = input(1)
  readonly mode = input<CompositionDrawAnimationMode>('live')
  readonly highlightParticipantId = input<string | null>(null)
  readonly previewPool = input<CompositionPoolPreviewSegment[]>([])
  /** Compact embed (e.g. Dispos › Tous) — less chrome. */
  readonly embedded = input(false)
  readonly showPreviewTitle = input(true)
  /** Flow-wrap pool bar; segment flex-basis stays % of a single-line bar. */
  readonly wrapSegments = input(false)
  readonly previewInteractive = input(true)

  readonly finished = output<void>()
  readonly segmentTap = output<{ participantId: string; chancePercent: number }>()

  protected readonly cursorPercent = signal(0)

  protected readonly segments = computed((): PreviewSegment[] => {
    if (this.mode() === 'preview') {
      return this.segmentsFromCandidates(this.previewPool())
    }
    const step = this.step()
    if (!step) {
      return []
    }
    const candidates = this.sortCandidatesByChance(step.candidates)
    const total =
      step.totalWeight > 0
        ? step.totalWeight
        : candidates.reduce((sum, c) => sum + c.weight, 0)
    if (total <= 0) {
      return candidates.map((c) => ({
        participantId: c.participantId,
        displayName: c.displayName,
        chancePercent: c.chancePercent,
        weight: c.weight,
        widthPercent: 100 / Math.max(candidates.length, 1),
        avatarUrl: null,
        gender: null,
      }))
    }
    return candidates.map((c) => ({
      participantId: c.participantId,
      displayName: c.displayName,
      chancePercent: c.chancePercent,
      weight: c.weight,
      widthPercent: (c.weight / total) * 100,
      avatarUrl: null,
      gender: null,
    }))
  })

  protected readonly previewCandidateCountLabel = computed(() =>
    candidateCountLabel(this.previewPool().length),
  )

  private sortCandidatesByChance<
    T extends { chancePercent: number; weight: number; displayName: string },
  >(candidates: readonly T[]): T[] {
    return [...candidates].sort(
      (a, b) =>
        b.chancePercent - a.chancePercent ||
        b.weight - a.weight ||
        a.displayName.localeCompare(b.displayName, 'fr'),
    )
  }

  private segmentsFromCandidates(
    candidates: readonly CompositionPoolPreviewSegment[],
  ): PreviewSegment[] {
    const sorted = this.sortCandidatesByChance(candidates)
    const totalChance = sorted.reduce((sum, c) => sum + c.chancePercent, 0)
    if (totalChance <= 0) {
      return sorted.map((c) => ({
        participantId: c.participantId,
        displayName: c.displayName,
        chancePercent: c.chancePercent,
        weight: c.weight,
        widthPercent: 100 / Math.max(sorted.length, 1),
        avatarUrl: c.avatarUrl ?? null,
        gender: c.gender ?? null,
      }))
    }
    return sorted.map((c) => ({
      participantId: c.participantId,
      displayName: c.displayName,
      chancePercent: c.chancePercent,
      weight: c.weight,
      widthPercent: (c.chancePercent / totalChance) * 100,
      avatarUrl: c.avatarUrl ?? null,
      gender: c.gender ?? null,
    }))
  }

  protected readonly selectedWinner = computed(() => {
    const step = this.step()
    if (!step) {
      return null
    }
    const selectedId = step.selectedParticipantId
    if (!selectedId) {
      return null
    }
    const candidate = step.candidates.find((c) => c.participantId === selectedId)
    if (!candidate) {
      return null
    }
    return {
      displayName: candidate.displayName,
      prefix: drawSelectionStatusLabel(candidate.gender),
    }
  })

  protected onSegmentTap(participantId: string, chancePercent: number): void {
    if (!this.previewInteractive() && this.mode() === 'preview') {
      return
    }
    if (this.mode() === 'preview' || this.step()) {
      this.segmentTap.emit({ participantId, chancePercent })
    }
  }

  protected segmentTestId(participantId: string): string {
    return `composition-draw-segment-${participantId}`
  }

  protected segmentBackground(chancePercent: number): string {
    return chanceSpectrumSegmentBackground(chancePercent)
  }

  protected segmentChanceTier(chancePercent: number): ChancePoolTier {
    return chancePoolTier(chancePercent)
  }

  protected segmentFlowFlex(widthPercent: number): string {
    return `0 1 ${widthPercent}%`
  }

  play(): void {
    if (this.preparing() || this.mode() === 'preview') {
      return
    }
    const step = this.step()
    if (!step) {
      return
    }
    const selectedId = step.selectedParticipantId
    if (!selectedId) {
      this.finished.emit()
      return
    }
    const segments = this.segments()
    let offset = 0
    let targetCenter = 50
    for (const segment of segments) {
      if (segment.participantId === selectedId) {
        targetCenter = offset + segment.widthPercent / 2
        break
      }
      offset += segment.widthPercent
    }
    this.cursorPercent.set(0)
    requestAnimationFrame(() => {
      this.cursorPercent.set(targetCenter)
      window.setTimeout(() => this.finished.emit(), 450)
    })
  }
}

export function candidateCountLabel(count: number): string {
  return count === 1 ? '1 candidat' : `${count} candidats`
}
