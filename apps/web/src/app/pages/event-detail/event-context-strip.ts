import { Component, input } from '@angular/core'
import { RouterLink } from '@angular/router'

import { leagueWorkspacePath } from '../../core/navigation/league-routes'

@Component({
  selector: 'app-event-context-strip',
  imports: [RouterLink],
  templateUrl: './event-context-strip.html',
  styleUrl: './event-context-strip.scss',
})
export class EventContextStrip {
  protected readonly leagueWorkspacePath = leagueWorkspacePath

  readonly troupeName = input.required<string>()
  readonly troupeSlug = input.required<string>()
  readonly leagueTitle = input.required<string>()
  readonly seasonSlug = input.required<string>()
  readonly showTroupeLink = input(false)
}
