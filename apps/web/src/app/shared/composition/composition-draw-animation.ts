import { Component, computed, input, output, signal } from '@angular/core'

import type { CompositionDrawStep } from '../../core/composition/composition-api.service'

@Component({
  selector: 'app-composition-draw-animation',
  templateUrl: './composition-draw-animation.html',
  styleUrl: './composition-draw-animation.scss',
})
export class CompositionDrawAnimation {
  readonly step = input.required<CompositionDrawStep>()
  readonly stepIndex = input(0)
  readonly totalSteps = input(1)

  readonly finished = output<void>()

  protected readonly cursorPercent = signal(0)

  protected readonly segments = computed(() => {
    const candidates = this.step().candidates
    const total =
      this.step().totalWeight > 0
        ? this.step().totalWeight
        : candidates.reduce((sum, c) => sum + c.weight, 0)
    if (total <= 0) {
      return candidates.map((c) => ({ ...c, widthPercent: 100 / Math.max(candidates.length, 1) }))
    }
    return candidates.map((c) => ({
      ...c,
      widthPercent: (c.weight / total) * 100,
    }))
  })

  protected readonly selectedLabel = computed(() => {
    const selectedId = this.step().selectedParticipantId
    if (!selectedId) {
      return null
    }
    return (
      this.step().candidates.find((c) => c.participantId === selectedId)?.displayName ?? null
    )
  })

  play(): void {
    const selectedId = this.step().selectedParticipantId
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
