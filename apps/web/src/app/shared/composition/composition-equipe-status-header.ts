import { Component, input } from '@angular/core'

import type { CompositionEquipeStatus } from '../../core/composition/composition-equipe-status'

@Component({
  selector: 'app-composition-equipe-status-header',
  imports: [],
  templateUrl: './composition-equipe-status-header.html',
  styleUrl: './composition-equipe-status-header.scss',
  host: {
    class: 'composition-equipe-status-header',
  },
})
export class CompositionEquipeStatusHeader {
  readonly status = input<CompositionEquipeStatus | null>(null)
  readonly showDraftBanner = input(false)
}
