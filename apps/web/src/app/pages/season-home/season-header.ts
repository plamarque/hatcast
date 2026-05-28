import { Component, computed, input } from '@angular/core'

import { ContextBreadcrumb } from '../../shared/context-breadcrumb/context-breadcrumb'

@Component({
  selector: 'app-season-header',
  imports: [ContextBreadcrumb],
  templateUrl: './season-header.html',
  styleUrl: './season-header.scss',
})
export class SeasonHeader {
  readonly seasonTitle = input.required<string>()
  readonly seasonSlug = input.required<string>()
  readonly seasonId = input.required<string>()
  readonly troupeId = input.required<string>()
  readonly troupeName = input<string | null>(null)
  readonly troupeSlug = input<string | null>(null)

  protected readonly showBreadcrumb = computed(
    () => !!this.troupeName()?.trim() && !!this.troupeSlug()?.trim(),
  )
}
