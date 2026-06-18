import { Component, computed, input } from '@angular/core'

import {
  activeMalusBonusCount,
  computeProfileSegments,
  profileChartColor,
  type DrawFormulaEditorState,
} from '../../core/draw/draw-formula-payload'

@Component({
  selector: 'app-troupe-draw-formula-profile-chart',
  imports: [],
  templateUrl: './troupe-draw-formula-profile-chart.html',
  styleUrl: './troupe-draw-formula-profile-chart.scss',
})
export class TroupeDrawFormulaProfileChart {
  readonly editorState = input.required<DrawFormulaEditorState>()

  protected readonly segments = computed(() => computeProfileSegments(this.editorState()))
  protected readonly activeCount = computed(() => activeMalusBonusCount(this.editorState()))

  protected readonly centerLine = computed(() =>
    `${this.activeCount()} actif${this.activeCount() > 1 ? 's' : ''}`,
  )

  protected readonly chartSegments = computed(() =>
    this.segments().filter((segment) => segment.enabled && segment.percent > 0),
  )

  protected readonly ariaLabel = computed(() => {
    const active = this.chartSegments()
    if (active.length === 0) {
      return 'Composition de la formule : aucun critère actif'
    }
    const parts = active.map((segment) => `${segment.label} ${segment.percent} %`).join(', ')
    return `Composition de la formule : ${parts}`
  })

  protected readonly profileChartColor = profileChartColor

  protected readonly donutBackground = computed(() => {
    const segments = this.chartSegments()
    if (segments.length === 0) {
      return 'color-mix(in srgb, var(--mat-sys-on-surface) 12%, transparent)'
    }
    let cursor = 0
    const stops: string[] = []
    for (const segment of segments) {
      const start = cursor
      cursor += segment.percent
      stops.push(`${profileChartColor(segment.factorId, true)} ${start}% ${cursor}%`)
    }
    return `conic-gradient(${stops.join(', ')})`
  })
}
