import { Component, input, output } from '@angular/core'

import type { CompositionPoolPreviewSegment } from '../../core/composition/composition-api.service'
import { CompositionDrawAnimation } from './composition-draw-animation'

/**
 * Pool bar (Dispos › Tous layout): embedded, proportional flow-wrap, avatars.
 */
@Component({
  selector: 'app-composition-pool-preview',
  imports: [CompositionDrawAnimation],
  template: `
    <app-composition-draw-animation
      mode="preview"
      [embedded]="true"
      [showPreviewTitle]="showTitle()"
      [wrapSegments]="true"
      [previewInteractive]="interactive()"
      [previewPool]="pool()"
      (segmentTap)="segmentTap.emit($event)"
    />
  `,
})
export class CompositionPoolPreview {
  readonly pool = input.required<CompositionPoolPreviewSegment[]>()
  readonly showTitle = input(false)
  readonly interactive = input(true)

  readonly segmentTap = output<{ participantId: string; chancePercent: number }>()
}
